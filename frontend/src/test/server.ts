import { setupServer } from 'msw/node'
import { createApiHandlers, type CapturedApiRequest } from './handlers'

export const apiRequests: CapturedApiRequest[] = []
export const server = setupServer(...createApiHandlers(apiRequests))
