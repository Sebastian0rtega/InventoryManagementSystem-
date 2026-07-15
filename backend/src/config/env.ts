import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

for (const envName of requiredEnv) {
  if (!process.env[envName]) {
    throw new Error(`[ERROR CRÍTICO]: Falta la variable de entorno obligatoria: ${envName}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  }
};