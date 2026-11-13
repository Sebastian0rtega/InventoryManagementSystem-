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
    movements: (inventoryId: number, params: InventoryMovementParams = {}) =>
      [...queryKeys.inventory.all, 'movements', inventoryId, params] as const,
  },
}
