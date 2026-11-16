import type { UserRole } from '@/features/auth/permissions'
import type {
  CurrentUserResponse,
  InventoryAdjustmentResponse,
  InventoryListResponse,
  ProductListResponse,
} from '@/shared/api/types'

export function currentUser(role: UserRole = 'ADMIN'): CurrentUserResponse {
  return {
    usuario_id: 1,
    rol_id: 1,
    tienda_id: 2,
    email: 'inventory@example.com',
    nombre: 'Inventory User',
    activo: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    rol: { rol_id: 1, nombre_rol: role },
  }
}

export function inventoryItem(
  status: 'NORMAL' | 'LOW' | 'OUT' = 'LOW',
  productName = 'Café',
): InventoryListResponse['data'][number] {
  return {
    inventario_id: 11,
    tienda_id: 2,
    producto_id: 21,
    stock_actual: status === 'OUT' ? 0 : status === 'LOW' ? 2 : 20,
    stock_minimo: 3,
    status,
    producto: {
      producto_id: 21,
      nombre: productName,
      sku: 'SKU-21',
      codigo_barras: null,
      precio_venta: '10.00',
      activo: true,
    },
    tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
  }
}

export function inventoryList(
  items: InventoryListResponse['data'] = [inventoryItem()],
): InventoryListResponse {
  return { data: items, page: 1, limit: 20, total: items.length, totalPages: 1 }
}

export const activeProducts: ProductListResponse = {
  items: [{ producto_id: 21, nombre: 'Café', sku: 'SKU-21', activo: true }],
  page: 1,
  limit: 100,
  total: 1,
}

export const successfulAdjustment: InventoryAdjustmentResponse = {
  ajuste: {
    movimiento_id: 501,
    tipo: 'ENTRADA',
    cantidad: 3,
    motivo: 'Conteo físico',
    usuario: { usuario_id: 1, nombre: 'Inventory User' },
    tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
    producto: { producto_id: 21, nombre: 'Café', sku: 'SKU-21' },
    fecha: '2026-01-01T10:00:00.000Z',
  },
  inventario: {
    inventario_id: 11,
    stock_actual: 5,
    stock_minimo: 3,
    status: 'NORMAL',
  },
}
