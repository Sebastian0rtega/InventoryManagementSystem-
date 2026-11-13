import { apiClient } from '@/shared/api/client'
import type {
  InventoryAdjustmentInput,
  InventoryAdjustmentResponse,
  InventoryListParams,
  InventoryListResponse,
  InventoryMovementParams,
  InventoryMovementsResponse,
} from '@/shared/api/types'

type RequestOptions = {
  signal?: AbortSignal
}

function toQueryString(
  params: Readonly<Record<string, string | number | undefined>>,
): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value))
    }
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

export function listInventory(
  params: InventoryListParams = {},
  options: RequestOptions = {},
) {
  return apiClient.request<InventoryListResponse>(
    `/inventory${toQueryString(params)}`,
    options.signal ? { signal: options.signal } : {},
  )
}

export function getInventoryMovements(
  inventoryId: number,
  params: InventoryMovementParams = {},
  options: RequestOptions = {},
) {
  return apiClient.request<InventoryMovementsResponse>(
    `/inventory/${inventoryId}/movements${toQueryString(params)}`,
    options.signal ? { signal: options.signal } : {},
  )
}

export function adjustInventory(
  input: InventoryAdjustmentInput,
  options: RequestOptions = {},
) {
  return apiClient.request<InventoryAdjustmentResponse>('/inventory/adjustments', {
    method: 'POST',
    body: input,
    ...(options.signal ? { signal: options.signal } : {}),
  })
}
