import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { Providers } from '@/app/Providers'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('flujo de autenticación principal', () => {
  it('inicia sesión y entra al inventario', async () => {
    window.history.replaceState({}, '', '/login')
    sessionStorage.clear()
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname
      return path.endsWith('/auth/login')
        ? jsonResponse({ token: 'test-token' })
        : jsonResponse({
            usuario_id: 1,
            rol_id: 1,
            tienda_id: 1,
            email: 'demo@example.com',
            nombre: 'Demo',
            activo: true,
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
            rol: { rol_id: 1, nombre_rol: 'ADMIN' },
          })
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <Providers>
        <App />
      </Providers>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'demo@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'valid-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(
      await screen.findByRole('heading', { name: 'Inventario' }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sessionStorage.getItem('inventory.accessToken')).toBe('test-token')
  })
})
