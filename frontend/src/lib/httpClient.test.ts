import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createHttpClient } from '@/lib/httpClient'

const requestId = 'a41b1ed3-2b64-46c8-a0fb-4cf652e8b307'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
    },
  })
}

function createClient(clearToken?: () => void) {
  return createHttpClient({
    baseUrl: 'http://localhost:3000/api/',
    ...(clearToken ? { clearToken } : {}),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

describe('httpClient', () => {
  it('envía JSON y Bearer, y conserva el request ID de una respuesta exitosa', async () => {
    sessionStorage.setItem('inventory.accessToken', 'test-token')
    let capturedUrl = ''
    let capturedHeaders = new Headers()
    let capturedBody: BodyInit | null | undefined

    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input)
      capturedHeaders = new Headers(init?.headers)
      capturedBody = init?.body
      return jsonResponse({ ok: true })
    })

    const result = await createClient().request<{ ok: boolean }>('/auth/login', {
      method: 'POST',
      body: { email: 'demo@example.com', password: 'secret' },
    })

    expect(capturedUrl).toBe('http://localhost:3000/api/auth/login')
    expect(capturedHeaders.get('Authorization')).toBe('Bearer test-token')
    expect(capturedHeaders.get('Content-Type')).toBe('application/json')
    expect(capturedBody).toBe(
      JSON.stringify({ email: 'demo@example.com', password: 'secret' }),
    )
    expect(result).toEqual({
      data: { ok: true },
      status: 200,
      requestId,
    })
  })

  it.each([
    [400, 'VALIDATION_ERROR'],
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [409, 'STOCK_INSUFFICIENT'],
    [500, 'INTERNAL_SERVER_ERROR'],
  ])(
    'traduce HTTP %i preservando el error estándar y requestId',
    async (status, code) => {
      const clearToken = vi.fn()
      vi.stubGlobal('fetch', async () =>
        jsonResponse(
          {
            success: false,
            error: {
              code,
              message: `error ${status}`,
              details: [{ field: 'stock' }],
            },
          },
          status,
        ),
      )

      const client = createClient(clearToken)

      await expect(client.request('/inventory')).rejects.toMatchObject({
        name: 'ApiError',
        status,
        code,
        message: `error ${status}`,
        details: [{ field: 'stock' }],
        requestId,
      })

      expect(clearToken).toHaveBeenCalledTimes(status === 401 ? 1 : 0)
    },
  )

  it('usa un error HTTP explícito cuando el servidor devuelve un cuerpo no JSON', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response('<html>failure</html>', {
          status: 500,
          headers: { 'X-Request-Id': requestId },
        }),
    )

    await expect(createClient().request('/inventory')).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_ERROR',
      requestId,
    })
  })

  it('limpia el token guardado en sessionStorage ante HTTP 401', async () => {
    sessionStorage.setItem('inventory.accessToken', 'expired-token')
    vi.stubGlobal('fetch', async () =>
      jsonResponse(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token inválido',
            details: [],
          },
        },
        401,
      ),
    )

    await expect(createClient().request('/auth/me')).rejects.toBeInstanceOf(ApiError)

    expect(sessionStorage.getItem('inventory.accessToken')).toBeNull()
  })

  it('rechaza respuestas exitosas que no son JSON válido', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response('not json', {
          status: 200,
          headers: { 'X-Request-Id': requestId },
        }),
    )

    await expect(createClient().request('/inventory')).rejects.toMatchObject({
      status: 200,
      code: 'INVALID_RESPONSE',
      requestId,
    })
  })

  it('propaga la cancelación del llamador sin convertirla en un error de API', async () => {
    vi.stubGlobal(
      'fetch',
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
        }),
    )

    const controller = new AbortController()
    const pending = createClient().request('/inventory', {
      signal: controller.signal,
    })
    controller.abort()

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('traduce el vencimiento del timeout sin confundirlo con una cancelación', async () => {
    vi.stubGlobal(
      'fetch',
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
        }),
    )

    await expect(
      createClient().request('/inventory', { timeoutMs: 1 }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      code: 'REQUEST_TIMEOUT',
    })
  })

  it('mantiene los errores de transporte reconocibles como ApiError', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('network failure')
    })

    await expect(createClient().request('/inventory')).rejects.toBeInstanceOf(ApiError)
  })
})
