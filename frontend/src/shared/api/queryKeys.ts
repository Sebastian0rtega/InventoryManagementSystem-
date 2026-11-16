import type { InventoryListParams, InventoryMovementParams } from '@/shared/api/types'

export const queryKeys = {
  auth: {
    currentUser: ['auth', 'current-user'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    lists: () => [...queryKeys.inventory.all, 'list'] as const,
    list: (params: InventoryListParams = {}) =>
      [...queryKeys.inventory.lists(), params] as const,
    movementList: (inventoryId: number) =>
      [...queryKeys.inventory.all, 'movements', inventoryId] as const,
    movements: (inventoryId: number, params: InventoryMovementParams = {}) =>
      [...queryKeys.inventory.movementList(inventoryId), params] as const,
  },
  products: {
    active: (search = '') => ['products', 'active', search] as const,
  },
}
