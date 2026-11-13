import type { CurrentUserResponse } from '@/shared/api/types'

export type UserRole = CurrentUserResponse['rol']['nombre_rol']

export function canAdjustInventory(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'WAREHOUSE'
}
