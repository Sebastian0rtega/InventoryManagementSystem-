import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { App } from '@/app/App'
import { Providers } from '@/app/Providers'
import { apiRequests, server } from '@/test/server'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
})
beforeEach(() => {
  apiRequests.length = 0
  window.history.replaceState({}, '', '/login')
})

describe('flujo integrado de inventario', () => {
  it('inicia sesión, filtra el inventario y registra un ajuste', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <App />
      </Providers>,
    )

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'inventory@example.com',
    )
    await user.type(screen.getByLabelText('Contraseña'), 'not-a-real-password')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByRole('heading', { name: 'Inventario' }),
    ).toBeInTheDocument()
    await user.type(screen.getByLabelText('Buscar producto o SKU'), 'cafe')
    await user.selectOptions(screen.getByLabelText('Estado'), 'LOW')
    expect(await screen.findByRole('row', { name: /Café/ })).toBeInTheDocument()

    await waitFor(() => {
      expect(
        apiRequests.some((request) => {
          if (request.method !== 'GET' || !request.url.includes('/inventory?')) {
            return false
          }
          const url = new URL(request.url)
          return (
            url.searchParams.get('search') === 'cafe' &&
            url.searchParams.get('status') === 'LOW'
          )
        }),
      ).toBe(true)
    })
    expect(await screen.findByRole('cell', { name: 'LOW · Stock bajo' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: /^Ajustar$/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Ajustar stock' })
    await screen.findByRole('option', { name: 'Café · SKU-21' })
    await user.selectOptions(within(dialog).getByLabelText('Producto activo'), '21')
    await user.clear(within(dialog).getByLabelText('Cantidad'))
    await user.type(within(dialog).getByLabelText('Cantidad'), '3')
    await user.type(within(dialog).getByLabelText('Motivo'), 'Conteo físico')
    await user.click(within(dialog).getByRole('button', { name: 'Registrar entrada' }))

    expect(
      await screen.findByText('Ajuste registrado correctamente.'),
    ).toBeInTheDocument()
    expect(
      apiRequests.find((request) => request.url.endsWith('/inventory/adjustments')),
    ).toMatchObject({
      method: 'POST',
      body: {
        productId: 21,
        storeId: 2,
        tipo: 'ENTRADA',
        cantidad: 3,
        motivo: 'Conteo físico',
      },
    })
  })
})
