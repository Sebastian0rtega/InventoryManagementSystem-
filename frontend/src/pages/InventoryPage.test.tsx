import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { InventoryPage } from '@/pages/InventoryPage'
import { SessionContext } from '@/features/auth/sessionContext'
import type { UserRole } from '@/features/auth/permissions'
import type { CurrentUserResponse, InventoryListResponse } from '@/shared/api/types'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function item(
  productName: string,
  status: 'NORMAL' | 'LOW' | 'OUT' = 'NORMAL',
  inventoryId = 11,
): InventoryListResponse['data'][number] {
  return {
    inventario_id: inventoryId,
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

function listResponse(
  rows: InventoryListResponse['data'],
  page = 1,
  totalPages = 1,
): InventoryListResponse {
  return { data: rows, page, limit: 20, total: rows.length, totalPages }
}

function currentUser(role: UserRole): CurrentUserResponse {
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

function LocationSearch() {
  const { search } = useLocation()
  return <output data-testid="location-search">{search}</output>
}

function renderInventoryPage({
  role = 'ADMIN',
  path = '/inventory',
}: {
  role?: UserRole
  path?: string
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider
          value={{
            token: 'test-token',
            user: currentUser(role),
            isLoading: false,
            error: null,
            login: vi.fn(),
            logout: vi.fn(),
            retry: vi.fn(),
          }}
        >
          <LocationSearch />
          <Routes>
            <Route path="/inventory" element={<InventoryPage />} />
          </Routes>
        </SessionContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('InventoryPage', () => {
  it('updates discrete filters in the URL immediately and resets the page', async () => {
    const requestUrls: URL[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      requestUrls.push(url)
      return jsonResponse(listResponse([item('Té verde')], 3, 5))
    })
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage({ path: '/inventory?page=3&limit=10&sort=stock_actual' })

    expect(await screen.findByText('Té verde')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'LOW' },
    })

    await waitFor(() => {
      const currentUrl = new URLSearchParams(
        screen.getByTestId('location-search').textContent ?? '',
      )
      expect(currentUrl.get('status')).toBe('LOW')
      expect(currentUrl.get('sort')).toBe('stock_actual')
      expect(currentUrl.get('limit')).toBe('10')
      expect(currentUrl.has('page')).toBe(false)
    })

    await waitFor(() => {
      expect(requestUrls.some((url) => url.searchParams.get('status') === 'LOW')).toBe(
        true,
      )
    })
  })

  it('preserves any backend-valid limit when loading a shared URL', async () => {
    const requestUrls: URL[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        requestUrls.push(new URL(String(input)))
        return jsonResponse(listResponse([item('Té verde')], 3, 5))
      }),
    )
    renderInventoryPage({ path: '/inventory?page=3&limit=7' })

    expect(await screen.findByText('Té verde')).toBeInTheDocument()
    expect(screen.getByLabelText('Por página')).toHaveValue('7')
    expect(
      new URLSearchParams(screen.getByTestId('location-search').textContent ?? '').get(
        'limit',
      ),
    ).toBe('7')
    expect(requestUrls[0]?.searchParams.get('limit')).toBe('7')
  })

  it('debounces only the search and resets pagination when it reaches the URL', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(listResponse([item('Té verde')])))
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage({ path: '/inventory?page=4&sort=stock_actual' })

    expect(await screen.findByText('Té verde')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Buscar producto o SKU'), {
      target: { value: 'cafe' },
    })

    const beforeDebounce = new URLSearchParams(
      screen.getByTestId('location-search').textContent ?? '',
    )
    expect(beforeDebounce.has('search')).toBe(false)
    expect(beforeDebounce.get('page')).toBe('4')

    await waitFor(
      () => {
        const afterDebounce = new URLSearchParams(
          screen.getByTestId('location-search').textContent ?? '',
        )
        expect(afterDebounce.get('search')).toBe('cafe')
        expect(afterDebounce.has('page')).toBe(false)
        expect(afterDebounce.get('sort')).toBe('stock_actual')
      },
      { timeout: 1500 },
    )
  })

  it('hides the store filter and movement actions from SELLER', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(listResponse([item('Café')]))),
    )
    renderInventoryPage({ role: 'SELLER' })

    expect(await screen.findByText('Café')).toBeInTheDocument()
    expect(screen.queryByLabelText('ID de tienda')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver movimientos' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'NORMAL · Stock normal' }),
    ).toBeInTheDocument()
  })

  it('explains LOW and OUT with text as well as color', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          listResponse([
            item('Producto bajo', 'LOW'),
            item('Producto agotado', 'OUT', 12),
          ]),
        ),
      ),
    )
    renderInventoryPage()

    expect(
      await screen.findByRole('cell', { name: 'LOW · Stock bajo' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'OUT · Sin stock' })).toBeInTheDocument()
  })

  it('loads the movement panel for WAREHOUSE', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      if (url.pathname.endsWith('/inventory/11/movements')) {
        return jsonResponse({
          inventario: {
            inventario_id: 11,
            producto: { producto_id: 21, nombre: 'Café', sku: 'SKU-21' },
            tienda: { tienda_id: 2, nombre: 'Casa Matriz' },
            stock_actual: 20,
            stock_minimo: 3,
            status: 'NORMAL',
          },
          data: [
            {
              movimiento_id: 101,
              inventario_id: 11,
              tipo_movimiento: 'AJUSTE_ENTRADA',
              cantidad: 5,
              referencia_tipo: 'AJUSTE_MANUAL',
              referencia_id: null,
              motivo: 'Conteo físico',
              usuario_id: 1,
              created_at: '2026-01-01T10:00:00.000Z',
              updated_at: '2026-01-01T10:00:00.000Z',
              usuario: {
                usuario_id: 1,
                nombre: 'Inventory User',
                email: 'inventory@example.com',
              },
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        })
      }

      return jsonResponse(listResponse([item('Café')]))
    })
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage({ role: 'WAREHOUSE' })

    fireEvent.click(await screen.findByRole('button', { name: 'Ver movimientos' }))

    expect(await screen.findByText('Conteo físico')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('keeps current results when an older filter request resolves later', async () => {
    let resolveNormal: ((response: Response) => void) | undefined
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(String(input))
      const status = url.searchParams.get('status')

      if (status === 'NORMAL') {
        return new Promise<Response>((resolve) => {
          resolveNormal = resolve
        })
      }

      return Promise.resolve(
        jsonResponse(
          listResponse([
            item(
              status === 'LOW' ? 'Producto bajo' : 'Producto original',
              status === 'LOW' ? 'LOW' : 'NORMAL',
            ),
          ]),
        ),
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage()

    expect(await screen.findByText('Producto original')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'NORMAL' },
    })
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'LOW' },
    })

    expect(await screen.findByText('Producto bajo')).toBeInTheDocument()
    resolveNormal?.(jsonResponse(listResponse([item('Respuesta tardía')])))

    await waitFor(() => {
      expect(screen.getByText('Producto bajo')).toBeInTheDocument()
      expect(screen.queryByText('Respuesta tardía')).not.toBeInTheDocument()
    })
  })

  it('keeps the previous page visible and labels it while the next page loads', async () => {
    let resolveSecondPage: ((response: Response) => void) | undefined
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = new URL(String(input))
      if (url.searchParams.get('page') === '2') {
        return new Promise<Response>((resolve) => {
          resolveSecondPage = resolve
        })
      }

      return Promise.resolve(jsonResponse(listResponse([item('Página uno')], 1, 2)))
    })
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage()

    expect(await screen.findByText('Página uno')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(
      await screen.findByText(
        /Cargando página 2; se muestran temporalmente los resultados de la página anterior/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Página uno')).toBeInTheDocument()

    resolveSecondPage?.(jsonResponse(listResponse([item('Página dos')], 2, 2)))

    expect(await screen.findByText('Página dos')).toBeInTheDocument()
    expect(screen.queryByText('Página uno')).not.toBeInTheDocument()
  })

  it('shows a distinct and recoverable message for a missing inventory resource', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Inventario no encontrado.',
              details: [],
            },
          },
          404,
        ),
      ),
    )
    renderInventoryPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se encontró el recurso de inventario solicitado.',
    )
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('shows a distinct server error and retries the failed request', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected error.',
            details: [],
          },
        },
        500,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    renderInventoryPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El servidor encontró un problema al cargar el inventario.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })
})
