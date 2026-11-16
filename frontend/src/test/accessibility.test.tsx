import { axe } from 'jest-axe'
import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { AppShell } from '@/app/AppShell'
import { InventoryPage } from '@/pages/InventoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { queryKeys } from '@/shared/api/queryKeys'
import { activeProducts, inventoryList } from './fixtures'
import { createTestQueryClient, renderWithSession } from './renderWithSession'

afterEach(cleanup)

async function expectNoViolations(container: HTMLElement) {
  const results = await axe(container)
  expect(results.violations).toEqual([])
}

describe('accesibilidad de pantallas críticas', () => {
  it('mantiene labels, errores y navegación por teclado en el login', async () => {
    const user = userEvent.setup()
    const { container } = renderWithSession(<LoginPage />, { token: null })

    await expectNoViolations(container)
    await user.tab()
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Contraseña')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toHaveFocus()
  })

  it('expone navegación accesible y permite recorrer el shell con teclado', async () => {
    const user = userEvent.setup()
    const { container } = renderWithSession(
      <AppShell>
        <h1>Resumen</h1>
      </AppShell>,
    )

    await expectNoViolations(container)
    await user.tab()
    expect(
      screen.getByRole('link', { name: /Inventory.*GESTIÓN DE STOCK/ }),
    ).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Resumen' })).toHaveFocus()
  })

  it('expone la tabla y el modal de ajuste con teclado y nombres accesibles', async () => {
    const user = userEvent.setup()
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(
      queryKeys.inventory.list({ page: 1, limit: 20 }),
      inventoryList(),
    )
    queryClient.setQueryData(queryKeys.products.active(''), activeProducts)
    const { container } = renderWithSession(<InventoryPage />, { queryClient })

    expect(await screen.findByRole('table')).toBeInTheDocument()
    await expectNoViolations(container)

    const rowAction = screen.getByRole('button', { name: /^Ajustar$/ })
    for (let tab = 0; tab < 8; tab += 1) {
      await user.tab()
    }
    expect(rowAction).toHaveFocus()
    await user.keyboard('{Enter}')
    const dialog = await screen.findByRole('dialog', { name: 'Ajustar stock' })
    await screen.findByRole('option', { name: 'Café · SKU-21' })
    expect(screen.getByLabelText('Buscar producto activo')).toHaveFocus()
    await expectNoViolations(container)

    const closeButton = screen.getByRole('button', { name: 'Cerrar ajuste' })
    closeButton.focus()
    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByRole('button', { name: 'Registrar entrada' })).toHaveFocus()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
