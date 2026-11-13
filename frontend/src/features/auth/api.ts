import { apiClient } from '@/shared/api/client'
import type { CurrentUserResponse, LoginInput, LoginResponse } from '@/shared/api/types'

type RequestOptions = {
  signal?: AbortSignal
}

export function login(input: LoginInput, options: RequestOptions = {}) {
  return apiClient.request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: input,
    ...(options.signal ? { signal: options.signal } : {}),
  })
}

export function getCurrentUser(options: RequestOptions = {}) {
  return apiClient.request<CurrentUserResponse>('/auth/me', {
    ...(options.signal ? { signal: options.signal } : {}),
  })
}
