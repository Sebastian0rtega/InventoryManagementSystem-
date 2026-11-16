import { describe, expect, it } from 'vitest'
import { canAdjustInventory, canViewInventoryMovements } from './permissions'

describe('inventory permissions', () => {
  it.each([
    ['ADMIN', true],
    ['WAREHOUSE', true],
    ['SELLER', false],
  ] as const)('applies the business permissions for %s', (role, expected) => {
    expect(canAdjustInventory(role)).toBe(expected)
    expect(canViewInventoryMovements(role)).toBe(expected)
  })
})
