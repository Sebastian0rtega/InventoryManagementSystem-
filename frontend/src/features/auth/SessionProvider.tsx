import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, login as requestLogin } from '@/features/auth/api'
import { SessionContext } from '@/features/auth/sessionContext'
import type { LoginInput } from '@/shared/api/types'
import { queryKeys } from '@/shared/api/queryKeys'
import { ApiError, API_FORBIDDEN_EVENT, API_UNAUTHORIZED_EVENT } from '@/lib/httpClient'
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from '@/lib/sessionToken'

type SessionProviderProps = {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [token, setToken] = useState(getSessionToken)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => (await getCurrentUser()).data,
    enabled: token !== null,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const login = useCallback(
    async (input: LoginInput) => {
      const { data } = await requestLogin(input)
      saveSessionToken(data.token)

      try {
        const user = (await getCurrentUser()).data
        queryClient.setQueryData(queryKeys.auth.currentUser, user)
        setToken(data.token)
      } catch (error: unknown) {
        clearSessionToken()
        queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
        throw error
      }
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    clearSessionToken()
    setToken(null)
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [navigate, queryClient])

  const handleUnauthorized = useCallback(() => {
    clearSessionToken()
    setToken(null)
    queryClient.clear()
    if (location.pathname !== '/login') {
      navigate('/login', {
        replace: true,
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      })
    }
  }, [location.hash, location.pathname, location.search, navigate, queryClient])

  const handleForbidden = useCallback(() => {
    if (location.pathname !== '/forbidden') {
      navigate('/forbidden', {
        replace: true,
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      })
    }
  }, [location.hash, location.pathname, location.search, navigate])

  useEffect(() => {
    window.addEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized)
    window.addEventListener(API_FORBIDDEN_EVENT, handleForbidden)

    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorized)
      window.removeEventListener(API_FORBIDDEN_EVENT, handleForbidden)
    }
  }, [handleUnauthorized, handleForbidden])

  const retry = useCallback(() => {
    void currentUserQuery.refetch()
  }, [currentUserQuery])

  const isExpired =
    currentUserQuery.error instanceof ApiError && currentUserQuery.error.status === 401
  const value = useMemo(
    () => ({
      token: isExpired ? null : token,
      user: currentUserQuery.data ?? null,
      isLoading: token !== null && !isExpired && currentUserQuery.isPending,
      error: currentUserQuery.error instanceof Error ? currentUserQuery.error : null,
      login,
      logout,
      retry,
    }),
    [
      currentUserQuery.data,
      currentUserQuery.error,
      currentUserQuery.isPending,
      isExpired,
      login,
      logout,
      retry,
      token,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
