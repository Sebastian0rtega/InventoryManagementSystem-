import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { SessionContext } from '@/features/auth/sessionContext'
import type { UserRole } from '@/features/auth/permissions'
import { currentUser } from './fixtures'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  })
}

export function renderWithSession(
  ui: ReactElement,
  {
    role = 'ADMIN',
    token = 'test-token',
    path = '/',
    queryClient = createTestQueryClient(),
  }: {
    role?: UserRole
    token?: string | null
    path?: string
    queryClient?: QueryClient
  } = {},
) {
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider
          value={{
            token,
            user: token ? currentUser(role) : null,
            isLoading: false,
            error: null,
            login: async () => undefined,
            logout: () => undefined,
            retry: () => undefined,
          }}
        >
          {ui}
        </SessionContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...result, queryClient }
}
