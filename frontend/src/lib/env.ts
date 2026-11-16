import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL debe ser una URL absoluta válida.'),
})

export function parseFrontendEnv(environment: Record<string, unknown>) {
  const result = envSchema.safeParse(environment)

  if (!result.success) {
    const details = result.error.issues.map(({ message }) => message).join(' ')

    throw new Error(
      `Configuración del frontend inválida: ${details} Copia .env.example a .env y configura la URL de la API.`,
    )
  }

  return {
    apiBaseUrl: result.data.VITE_API_BASE_URL.replace(/\/+$/, ''),
  }
}

export const env = parseFrontendEnv(import.meta.env)
