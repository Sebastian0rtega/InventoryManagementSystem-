import { http, HttpResponse, type RequestHandler } from 'msw'
import { env } from '@/lib/env'
import type {
  CurrentUserResponse,
  InventoryAdjustmentInput,
  InventoryAdjustmentResponse,
  InventoryListResponse,
  InventoryMovementsResponse,
  LoginInput,
  LoginResponse,
  ProductListResponse,
} from '@/shared/api/types'
import {
  activeProducts,
  currentUser,
  inventoryItem,
  successfulAdjustment,
} from './fixtures'

export type CapturedApiRequest = {
  method: string
  url: string
  body?: unknown
}

const emptyMovements: InventoryMovementsResponse = {
  inventario: {
    inventario_id: 11,
    producto: { producto_id: 21, nombre: 'Café', sku: 'SKU-21' },
    tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
    stock_actual: 2,
    stock_minimo: 3,
    status: 'LOW',
  },
  data: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

export function createApiHandlers(
  requests: CapturedApiRequest[] = [],
): RequestHandler[] {
  return [
    http.post<never, LoginInput, LoginResponse>(
      `${env.apiBaseUrl}/auth/login`,
      async ({ request }) => {
        requests.push({
          method: request.method,
          url: request.url,
          body: await request.clone().json(),
        })
        return HttpResponse.json({ token: 'test-token' })
      },
    ),
    http.get<never, never, CurrentUserResponse>(
      `${env.apiBaseUrl}/auth/me`,
      ({ request }) => {
        requests.push({ method: request.method, url: request.url })
        return HttpResponse.json(currentUser())
      },
    ),
    http.get<never, never, InventoryListResponse>(
      `${env.apiBaseUrl}/inventory`,
      ({ request }) => {
        requests.push({ method: request.method, url: request.url })
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const search = url.searchParams.get('search')?.toLocaleLowerCase()
        const isCafeSearch =
          search && ['café', 'cafe', 'sku-21'].some((term) => search.includes(term))
        const data = isCafeSearch
          ? [inventoryItem(status === 'LOW' ? 'LOW' : 'NORMAL')]
          : search
            ? []
            : [inventoryItem('NORMAL', 'Té verde')]
        return HttpResponse.json({
          data,
          page: Number(url.searchParams.get('page') ?? 1),
          limit: Number(url.searchParams.get('limit') ?? 20),
          total: data.length,
          totalPages: data.length ? 1 : 0,
        })
      },
    ),
    http.get<never, never, ProductListResponse>(
      `${env.apiBaseUrl}/products`,
      ({ request }) => {
        requests.push({ method: request.method, url: request.url })
        return HttpResponse.json(activeProducts)
      },
    ),
    http.get<{ id: string }, never, InventoryMovementsResponse>(
      `${env.apiBaseUrl}/inventory/:id/movements`,
      ({ request }) => {
        requests.push({ method: request.method, url: request.url })
        return HttpResponse.json(emptyMovements)
      },
    ),
    http.post<never, InventoryAdjustmentInput, InventoryAdjustmentResponse>(
      `${env.apiBaseUrl}/inventory/adjustments`,
      async ({ request }) => {
        requests.push({
          method: request.method,
          url: request.url,
          body: await request.clone().json(),
        })
        return HttpResponse.json(successfulAdjustment, { status: 201 })
      },
    ),
  ]
}
