import { clearSessionToken, getSessionToken } from '@/lib/sessionToken'

const defaultTimeoutMs = 15_000

export type HttpResponse<T> = {
  data: T
  status: number
  requestId: string | null
}

export type HttpRequestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

export type HttpClientOptions = {
  baseUrl: string
  getToken?: () => string | null
  clearToken?: () => void
  fetchImplementation?: typeof fetch
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown[]
  readonly requestId: string | null

  constructor(
    status: number,
    code: string,
    message: string,
    details: unknown[],
    requestId: string | null,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toApiError(status: number, body: unknown, requestId: string | null): ApiError {
  const errorBody = isRecord(body) && isRecord(body.error) ? body.error : undefined

  return new ApiError(
    status,
    typeof errorBody?.code === 'string' ? errorBody.code : 'HTTP_ERROR',
    typeof errorBody?.message === 'string'
      ? errorBody.message
      : `La API respondió con HTTP ${status}.`,
    Array.isArray(errorBody?.details) ? errorBody.details : [],
    requestId,
  )
}

export function createHttpClient({
  baseUrl,
  getToken = getSessionToken,
  clearToken = clearSessionToken,
  fetchImplementation = fetch,
}: HttpClientOptions) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  async function request<T>(
    path: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const url = new URL(path.replace(/^\/+/, ''), `${normalizedBaseUrl}/`)
    const headers = new Headers({ Accept: 'application/json' })
    const token = getToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    let body: string | undefined
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(options.body)
    }

    const controller = new AbortController()
    let timedOut = false
    const callerSignal = options.signal
    const abortFromCaller = () => controller.abort(callerSignal?.reason)

    if (callerSignal?.aborted) {
      abortFromCaller()
    } else {
      callerSignal?.addEventListener('abort', abortFromCaller, { once: true })
    }

    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, options.timeoutMs ?? defaultTimeoutMs)

    try {
      const response = await fetchImplementation(url, {
        method: options.method ?? 'GET',
        headers,
        ...(body !== undefined ? { body } : {}),
        signal: controller.signal,
      })
      const requestId = response.headers.get('X-Request-Id')

      if (response.status === 401) {
        clearToken()
      }

      const responseText = await response.text()
      let responseBody: unknown

      if (responseText.trim()) {
        try {
          responseBody = JSON.parse(responseText) as unknown
        } catch {
          if (response.ok) {
            throw new ApiError(
              response.status,
              'INVALID_RESPONSE',
              'La API devolvió una respuesta que no es JSON válido.',
              [],
              requestId,
            )
          }
          throw toApiError(response.status, undefined, requestId)
        }
      } else if (response.ok) {
        throw new ApiError(
          response.status,
          'INVALID_RESPONSE',
          'La API devolvió una respuesta vacía.',
          [],
          requestId,
        )
      }

      if (!response.ok) {
        throw toApiError(response.status, responseBody, requestId)
      }

      return {
        // The endpoint's response type comes from the generated OpenAPI paths.
        data: responseBody as T,
        status: response.status,
        requestId,
      }
    } catch (error: unknown) {
      if (callerSignal?.aborted) {
        throw error
      }
      if (timedOut) {
        throw new ApiError(
          0,
          'REQUEST_TIMEOUT',
          `La solicitud excedió el tiempo límite de ${options.timeoutMs ?? defaultTimeoutMs} ms.`,
          [],
          null,
          { cause: error },
        )
      }
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'No se pudo conectar con la API.',
        [],
        null,
        { cause: error },
      )
    } finally {
      clearTimeout(timeoutId)
      callerSignal?.removeEventListener('abort', abortFromCaller)
    }
  }

  return { request }
}
