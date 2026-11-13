import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { Providers } from '@/app/Providers'
import { apiClient } from '@/shared/api/client'

type TestRole = 'ADMIN' | 'SELLER' | 'WAREHOUSE'

type MockOptions = {
  role?: TestRole
  loginStatus?: number
  currentUserStatus?: number
  inventoryStatus?: number
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function standardError(status: number) {
  return jsonResponse(
    {
      success: false,
      error: {
        code: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        message: status === 401 ? 'Credenciales inválidas.' : 'Acceso denegado.',
        details: [],
      },
    },
    status,
  )
}

function mockApi({
  role = 'ADMIN',
  loginStatus = 200,
  currentUserStatus = 200,
  inventoryStatus = 401,
}: MockOptions = {}) {
  const requests: string[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input)).pathname
    requests.push(path)

    if (path.endsWith('/auth/login')) {
      return loginStatus === 200
        ? jsonResponse({ token: 'session-token' })
        : standardError(loginStatus)
    }

    if (path.endsWith('/auth/me')) {
      if (currentUserStatus !== 200) {
        return standardError(currentUserStatus)
      }

      return jsonResponse({
        usuario_id: 7,
        rol_id: 3,
        tienda_id: 2,
        email: 'user@example.com',
        nombre: 'Usuario de prueba',
        activo: true,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        rol: {
          rol_id: 3,
          nombre_rol: role,
        },
      })
    }

    if (path.endsWith('/inventory')) {
      return standardError(inventoryStatus)
    }

    return standardError(500)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, requests }
}

function startAt(path: string) {
  sessionStorage.clear()
  window.history.replaceState({}, '', path)
}

function renderApp() {
  return render(
    <Providers>
      <App />
    </Providers>,
  )
}

async function submitLogin() {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'user@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { value: 'not-a-real-secret' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

function ExpiringApiRequest() {
  return (
    <button
      type="button"
      onClick={() => {
        void apiClient.request('/inventory').catch(() => undefined)
      }}
    >
      Consultar API protegida
    </button>
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('auth y control de acceso', () => {
  it('redirige al login sin sesión y restaura la ruta solicitada al autenticarse', async () => {
    mockApi()
    startAt('/inventory/adjustments?source=deep-link')
    renderApp()

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    await submitLogin()

    expect(
      await screen.findByRole('heading', { name: 'Ajustes de inventario' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/inventory/adjustments')
    expect(window.location.search).toBe('?source=deep-link')
  })

  it('muestra un error de credenciales sin revelar la contraseña', async () => {
    mockApi({ loginStatus: 401 })
    startAt('/login')
    renderApp()

    await submitLogin()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciales inválidas.',
    )
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(sessionStorage.getItem('inventory.accessToken')).toBeNull()
  })

  it('limpia token expirado y devuelve al login', async () => {
    mockApi({ currentUserStatus: 401 })
    startAt('/inventory')
    sessionStorage.setItem('inventory.accessToken', 'expired-token')
    renderApp()

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('inventory.accessToken')).toBeNull()
  })

  it('limpia la sesión y redirige al login ante un 401 posterior', async () => {
    mockApi({ currentUserStatus: 200 })
    startAt('/login')
    render(
      <Providers>
        <App />
        <ExpiringApiRequest />
      </Providers>,
    )
    await submitLogin()
    await screen.findByRole('heading', { name: 'Inventario' })

    fireEvent.click(screen.getByRole('button', { name: 'Consultar API protegida' }))

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('inventory.accessToken')).toBeNull()
  })

  it('mantiene la sesión y presenta acceso denegado ante un 403', async () => {
    mockApi({ currentUserStatus: 403 })
    startAt('/inventory')
    sessionStorage.setItem('inventory.accessToken', 'valid-token')
    renderApp()

    expect(
      await screen.findByRole('heading', { name: 'Acceso denegado' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('inventory.accessToken')).toBe('valid-token')
  })

  it.each([
    ['ADMIN', true],
    ['WAREHOUSE', true],
    ['SELLER', false],
  ] as const)(
    'muestra el acceso de ajuste según el rol %s',
    async (role, canAdjust) => {
      mockApi({ role })
      startAt('/login')
      renderApp()
      await submitLogin()

      await screen.findByRole('heading', { name: 'Inventario' })

      if (canAdjust) {
        expect(
          screen.getByRole('link', { name: 'Ajustes de inventario' }),
        ).toBeInTheDocument()
      } else {
        expect(
          screen.queryByRole('link', { name: 'Ajustes de inventario' }),
        ).not.toBeInTheDocument()
      }
    },
  )

  it('bloquea el acceso directo a ajustes para SELLER', async () => {
    mockApi({ role: 'SELLER' })
    startAt('/inventory/adjustments')
    renderApp()
    await submitLogin()

    expect(
      await screen.findByRole('heading', { name: 'Acceso denegado' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('inventory.accessToken')).toBe('session-token')
  })

  it('cierra sesión, limpia el token y vuelve al login', async () => {
    mockApi()
    startAt('/login')
    renderApp()
    await submitLogin()

    await screen.findByRole('heading', { name: 'Inventario' })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(
      await screen.findByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('inventory.accessToken')).toBeNull()
  })
})
