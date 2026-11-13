import { env } from '@/lib/env'
import { createHttpClient } from '@/lib/httpClient'

export const apiClient = createHttpClient({ baseUrl: env.apiBaseUrl })
