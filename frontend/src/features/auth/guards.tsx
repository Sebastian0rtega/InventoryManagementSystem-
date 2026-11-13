import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/features/auth/sessionContext'
import type { UserRole } from '@/features/auth/permissions'
import { ApiError } from '@/lib/httpClient'

export function ProtectedRoute() {
  const { token, user, isLoading, error, retry } = useSession()
  const location = useLocation()

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    )
  }

  if (isLoading) {
    return <p role="status">Validando la sesión…</p>
  }

  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <Navigate to="/forbidden" replace />
    }

    return (
      <section role="alert">
        <h1>No se pudo validar la sesión</h1>
        <p>Comprueba tu conexión e inténtalo de nuevo.</p>
        <button type="button" onClick={retry}>
          Reintentar
        </button>
      </section>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

type RoleRouteProps = {
  allowedRoles: readonly UserRole[]
  children: ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useSession()

  if (!user || !allowedRoles.includes(user.rol.nombre_rol)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
