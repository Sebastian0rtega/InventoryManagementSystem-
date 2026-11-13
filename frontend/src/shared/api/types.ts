import type { paths } from '@/shared/api/schema'

export type LoginInput =
  paths['/api/auth/login']['post']['requestBody']['content']['application/json']
export type LoginResponse =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json']
export type CurrentUserResponse =
  paths['/api/auth/me']['get']['responses'][200]['content']['application/json']

export type InventoryListParams = NonNullable<
  paths['/api/inventory']['get']['parameters']['query']
>
export type InventoryListResponse =
  paths['/api/inventory']['get']['responses'][200]['content']['application/json']

export type InventoryAdjustmentInput =
  paths['/api/inventory/adjustments']['post']['requestBody']['content']['application/json']
export type InventoryAdjustmentResponse =
  paths['/api/inventory/adjustments']['post']['responses'][201]['content']['application/json']

export type InventoryMovementParams = NonNullable<
  paths['/api/inventory/{id}/movements']['get']['parameters']['query']
>
export type InventoryMovementsResponse =
  paths['/api/inventory/{id}/movements']['get']['responses'][200]['content']['application/json']
