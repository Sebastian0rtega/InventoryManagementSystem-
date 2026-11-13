import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL debe ser una URL absoluta válida.'),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  const details = result.error.issues.map(({ message }) => message).join(' ')

  throw new Error(
    `Configuración del frontend inválida: ${details} Copia .env.example a .env y configura la URL de la API.`,
  )
}

export const env = {
  apiBaseUrl: result.data.VITE_API_BASE_URL.replace(/\/+$/, ''),
}
