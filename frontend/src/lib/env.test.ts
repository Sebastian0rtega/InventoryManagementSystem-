import { describe, expect, it } from 'vitest'
import { parseFrontendEnv } from './env'

describe('parseFrontendEnv', () => {
  it('requires an absolute API URL and removes trailing slashes', () => {
    expect(
      parseFrontendEnv({ VITE_API_BASE_URL: 'https://inventory.example/api///' }),
    ).toEqual({ apiBaseUrl: 'https://inventory.example/api' })
  })

  it.each([undefined, '', '/api', 'not a URL'])(
    'rejects invalid API configuration: %s',
    (value) => {
      expect(() => parseFrontendEnv({ VITE_API_BASE_URL: value })).toThrow(
        'Configuración del frontend inválida',
      )
    },
  )
})
