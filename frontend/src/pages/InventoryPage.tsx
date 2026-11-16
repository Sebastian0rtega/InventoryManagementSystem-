import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { canViewInventoryMovements } from '@/features/auth/permissions'
import { useSession } from '@/features/auth/sessionContext'
import { getInventoryMovements, listInventory } from '@/features/inventory/api'
import { ApiError } from '@/lib/httpClient'
import { queryKeys } from '@/shared/api/queryKeys'
import type {
  InventoryListParams,
  InventoryListResponse,
  InventoryMovementParams,
  InventoryMovementsResponse,
} from '@/shared/api/types'
import './InventoryPage.css'

const pageSizes = [10, 20, 50, 100] as const
const statuses = ['NORMAL', 'LOW', 'OUT'] as const
const sorts = ['stock_actual', '-stock_actual'] as const
type InventoryStatus = (typeof statuses)[number]
type InventorySort = (typeof sorts)[number]
type InventoryItem = InventoryListResponse['data'][number]
type Movement = InventoryMovementsResponse['data'][number]
type ResolvedInventoryParams = InventoryListParams & {
  page: number
  limit: number
}

function positiveInteger(value: string | null): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

function readListParams(searchParams: URLSearchParams): ResolvedInventoryParams {
  const page = positiveInteger(searchParams.get('page')) ?? 1
  const rawLimit = positiveInteger(searchParams.get('limit')) ?? 20
  const limit = rawLimit <= 100 ? rawLimit : 20
  const search = searchParams.get('search')?.trim()
  const storeId = positiveInteger(searchParams.get('storeId'))
  const statusValue = searchParams.get('status')
  const sortValue = searchParams.get('sort')

  return {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(storeId ? { storeId } : {}),
    ...(statuses.includes(statusValue as InventoryStatus)
      ? { status: statusValue as InventoryStatus }
      : {}),
    ...(sorts.includes(sortValue as InventorySort)
      ? { sort: sortValue as InventorySort }
      : {}),
  }
}

function sameFiltersExceptPage(
  previousKey: readonly unknown[] | undefined,
  params: InventoryListParams,
): boolean {
  const previous = previousKey?.[previousKey.length - 1]
  if (!previous || typeof previous !== 'object') {
    return false
  }

  const previousParams = previous as Record<string, unknown>
  return (
    previousParams.page !== params.page &&
    previousParams.limit === params.limit &&
    previousParams.search === params.search &&
    previousParams.storeId === params.storeId &&
    previousParams.status === params.status &&
    previousParams.sort === params.sort
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Tu sesión ya no es válida. Inicia sesión nuevamente para consultar el inventario.'
      case 403:
        return 'Tu cuenta no tiene permisos para consultar este inventario.'
      case 404:
        return 'No se encontró el recurso de inventario solicitado.'
      case 500:
        return 'El servidor encontró un problema al cargar el inventario. Inténtalo de nuevo.'
      default:
        return error.status >= 500
          ? 'El servidor no pudo completar la consulta. Inténtalo de nuevo.'
          : error.message
    }
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo cargar el inventario. Inténtalo de nuevo.'
}

function statusLabel(status: InventoryStatus): string {
  switch (status) {
    case 'LOW':
      return 'LOW · Stock bajo'
    case 'OUT':
      return 'OUT · Sin stock'
    default:
      return 'NORMAL · Stock normal'
  }
}

function movementLabel(movement: Movement): string {
  switch (movement.tipo_movimiento) {
    case 'ENTRADA_COMPRA':
    case 'AJUSTE_ENTRADA':
      return 'Entrada'
    case 'SALIDA_VENTA':
    case 'AJUSTE_SALIDA':
      return 'Salida'
    case 'MERMA':
      return 'Merma'
    case 'TRASLADO':
      return 'Traslado'
    default:
      return 'Ajuste'
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

function LoadingRows() {
  return (
    <div className="inventory-skeleton" role="status" aria-label="Cargando inventario">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="inventory-skeleton-row" key={index}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}

function InventoryTable({
  items,
  canSeeMovements,
  onShowMovements,
}: {
  items: InventoryItem[]
  canSeeMovements: boolean
  onShowMovements: (item: InventoryItem) => void
}) {
  return (
    <div className="inventory-table-scroll">
      <table className="inventory-table">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">SKU</th>
            <th scope="col">Tienda</th>
            <th scope="col">Stock actual</th>
            <th scope="col">Stock mínimo</th>
            <th scope="col">Estado</th>
            {canSeeMovements && <th scope="col">Movimientos</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.inventario_id}>
              <th className="inventory-product" scope="row">
                {item.producto.nombre}
              </th>
              <td>{item.producto.sku}</td>
              <td>{item.tienda.nombre}</td>
              <td>{item.stock_actual}</td>
              <td>{item.stock_minimo}</td>
              <td>
                <span
                  className={`inventory-status inventory-status-${item.status.toLowerCase()}`}
                >
                  {statusLabel(item.status)}
                </span>
              </td>
              {canSeeMovements && (
                <td>
                  <button
                    className="inventory-link-button"
                    type="button"
                    onClick={() => onShowMovements(item)}
                  >
                    Ver movimientos
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MovementsPanel({
  item,
  pageSize,
  onClose,
}: {
  item: InventoryItem
  pageSize: number
  onClose: () => void
}) {
  const params: InventoryMovementParams = useMemo(
    () => ({ page: 1, limit: pageSize }),
    [pageSize],
  )
  const query = useQuery({
    queryKey: queryKeys.inventory.movements(item.inventario_id, params),
    queryFn: async ({ signal }) =>
      (await getInventoryMovements(item.inventario_id, params, { signal })).data,
  })

  return (
    <section className="movements-panel" aria-labelledby="movements-title">
      <div className="movements-heading">
        <div>
          <span className="inventory-overline">BITÁCORA</span>
          <h2 id="movements-title">
            {item.producto.nombre} · {item.tienda.nombre}
          </h2>
        </div>
        <button className="secondary-button" type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {query.isPending && <p role="status">Cargando movimientos…</p>}
      {query.isError && (
        <div className="inventory-error" role="alert">
          <p>{errorMessage(query.error)}</p>
          <button type="button" onClick={() => void query.refetch()}>
            Reintentar
          </button>
        </div>
      )}
      {query.data && query.data.data.length === 0 && (
        <p className="inventory-empty">Este registro todavía no tiene movimientos.</p>
      )}
      {query.data && query.data.data.length > 0 && (
        <div className="inventory-table-scroll">
          <table className="inventory-table movements-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Movimiento</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Motivo</th>
                <th scope="col">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((movement) => (
                <tr key={movement.movimiento_id}>
                  <td>{formatDate(movement.created_at)}</td>
                  <td>{movementLabel(movement)}</td>
                  <td>{movement.cantidad}</td>
                  <td>{movement.motivo ?? '—'}</td>
                  <td>{movement.usuario?.nombre ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function InventoryPage() {
  const { user } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState({
    source: urlSearch,
    value: urlSearch,
  })
  const searchDraft = searchInput.source === urlSearch ? searchInput.value : urlSearch
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const params = useMemo(() => readListParams(searchParams), [searchParams])
  const selectablePageSizes = [...new Set([...pageSizes, params.limit])].sort(
    (left, right) => left - right,
  )
  const canSelectStore = user?.rol.nombre_rol === 'ADMIN'
  const canSeeMovements = user ? canViewInventoryMovements(user.rol.nombre_rol) : false

  const setUrlParams = useCallback(
    (
      changes: Record<string, string | number | undefined>,
      options: { resetPage?: boolean; replace?: boolean } = {},
    ) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (options.resetPage) {
            next.delete('page')
          }

          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '') {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          }

          return next
        },
        { replace: options.replace ?? false },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    const value = searchDraft.trim()
    if (value === urlSearch) {
      return
    }

    const timeout = window.setTimeout(() => {
      setUrlParams({ search: value || undefined }, { resetPage: true, replace: true })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [searchDraft, setUrlParams, urlSearch])

  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: async ({ signal }) => (await listInventory(params, { signal })).data,
    placeholderData: (previousData, previousQuery) =>
      sameFiltersExceptPage(previousQuery?.queryKey, params) ? previousData : undefined,
  })

  const changeFilter = (changes: Record<string, string | number | undefined>) => {
    setUrlParams(changes, { resetPage: true })
  }

  return (
    <section className="inventory-page" aria-labelledby="inventory-title">
      <header className="inventory-page-heading">
        <div>
          <span className="inventory-overline">OPERACIONES</span>
          <h1 id="inventory-title">Inventario</h1>
          <p>Consulta existencias por tienda, estado y disponibilidad.</p>
        </div>
        <span className="inventory-total">
          {inventoryQuery.data
            ? `${inventoryQuery.data.total} registros`
            : 'Control de existencias'}
        </span>
      </header>

      <section className="inventory-filters" aria-label="Filtros de inventario">
        <label className="inventory-filter inventory-search">
          <span>Buscar producto o SKU</span>
          <input
            type="search"
            maxLength={100}
            value={searchDraft}
            onChange={(event) =>
              setSearchInput({ source: urlSearch, value: event.target.value })
            }
            placeholder="Nombre, SKU o código de barras"
          />
        </label>

        {canSelectStore && (
          <label className="inventory-filter inventory-store-filter">
            <span>ID de tienda</span>
            <input
              type="number"
              min="1"
              value={params.storeId ?? ''}
              onChange={(event) =>
                changeFilter({
                  storeId: positiveInteger(event.target.value),
                })
              }
              placeholder="Todas"
            />
          </label>
        )}

        <label className="inventory-filter">
          <span>Estado</span>
          <select
            value={params.status ?? ''}
            onChange={(event) =>
              changeFilter({ status: event.target.value || undefined })
            }
          >
            <option value="">Todos</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="inventory-filter">
          <span>Ordenar por stock</span>
          <select
            value={params.sort ?? ''}
            onChange={(event) =>
              changeFilter({ sort: event.target.value || undefined })
            }
          >
            <option value="">Predeterminado</option>
            <option value="stock_actual">Menor a mayor</option>
            <option value="-stock_actual">Mayor a menor</option>
          </select>
        </label>

        <label className="inventory-filter inventory-limit-filter">
          <span>Por página</span>
          <select
            value={params.limit}
            onChange={(event) => changeFilter({ limit: Number(event.target.value) })}
          >
            {selectablePageSizes.map((limit) => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
        </label>
      </section>

      {inventoryQuery.isError && (
        <div className="inventory-error" role="alert">
          <div>
            <strong>No se pudo cargar el inventario</strong>
            <p>{errorMessage(inventoryQuery.error)}</p>
          </div>
          <button type="button" onClick={() => void inventoryQuery.refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {inventoryQuery.isPending && <LoadingRows />}

      {inventoryQuery.data && (
        <>
          {inventoryQuery.isPlaceholderData && (
            <p className="inventory-page-transition" role="status">
              Cargando página {params.page}; se muestran temporalmente los resultados de
              la página anterior.
            </p>
          )}

          {inventoryQuery.data.data.length === 0 ? (
            <div className="inventory-empty" role="status">
              <strong>No hay resultados para estos filtros.</strong>
              <span>Prueba otra búsqueda o restablece los filtros.</span>
            </div>
          ) : (
            <InventoryTable
              items={inventoryQuery.data.data}
              canSeeMovements={canSeeMovements}
              onShowMovements={setSelectedItem}
            />
          )}

          <nav className="inventory-pagination" aria-label="Paginación del inventario">
            <span>
              Página {params.page} de {inventoryQuery.data.totalPages}
            </span>
            <div>
              <button
                className="secondary-button"
                type="button"
                disabled={params.page <= 1 || inventoryQuery.isFetching}
                onClick={() => setUrlParams({ page: params.page - 1 })}
              >
                Anterior
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={
                  params.page >= inventoryQuery.data.totalPages ||
                  inventoryQuery.isFetching
                }
                onClick={() => setUrlParams({ page: params.page + 1 })}
              >
                Siguiente
              </button>
            </div>
          </nav>

          {canSeeMovements && selectedItem && (
            <MovementsPanel
              item={selectedItem}
              pageSize={params.limit}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </>
      )}
    </section>
  )
}
