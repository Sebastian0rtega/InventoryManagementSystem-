import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, type Location } from 'react-router-dom'
import { z } from 'zod'
import { useSession } from '@/features/auth/sessionContext'
import type { LoginInput } from '@/shared/api/types'

const loginSchema = z.object({
  email: z.email('Ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginRedirectState = {
  from: Pick<Location, 'pathname'> & Partial<Pick<Location, 'search' | 'hash'>>
}

function isLoginRedirectState(value: unknown): value is LoginRedirectState {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('from' in value) ||
    typeof value.from !== 'object' ||
    value.from === null ||
    !('pathname' in value.from) ||
    typeof value.from.pathname !== 'string' ||
    !value.from.pathname.startsWith('/')
  ) {
    return false
  }

  return true
}

function getDestination(state: unknown): string {
  if (!isLoginRedirectState(state) || state.from?.pathname === '/login') {
    return '/inventory'
  }

  const { pathname, search, hash } = state.from
  return `${pathname}${search ?? ''}${hash ?? ''}`
}

export function LoginPage() {
  const { login, token, user } = useSession()
  const location = useLocation()
  const [requestError, setRequestError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (token && user) {
    return <Navigate to={getDestination(location.state)} replace />
  }

  const submit = handleSubmit(async (input) => {
    setRequestError(null)
    try {
      await login(input)
    } catch (error: unknown) {
      setRequestError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      )
    }
  })

  return (
    <main>
      <section aria-labelledby="login-title">
        <h1 id="login-title">Iniciar sesión</h1>
        <p>Ingresa con tu cuenta para acceder al inventario.</p>
        <form onSubmit={submit} noValidate>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
          {requestError && <p role="alert">{requestError}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  )
}
