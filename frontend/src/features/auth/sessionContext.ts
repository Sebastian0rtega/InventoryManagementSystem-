import { createContext, useContext } from 'react'
import type { CurrentUserResponse, LoginInput } from '@/shared/api/types'

export type SessionContextValue = {
  token: string | null
  user: CurrentUserResponse | null
  isLoading: boolean
  error: Error | null
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  retry: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession debe utilizarse dentro de SessionProvider.')
  }

  return context
}
