# Frontend

Aplicación React + TypeScript creada con Vite. La versión LTS de referencia es
Node 24 (ver `.nvmrc`).

## Inicio local

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Configura `VITE_API_BASE_URL` en `.env` con la URL accesible de la API. La
aplicación falla al arrancar con un mensaje explícito si falta o no es válida.

## Comandos

```text
npm run dev          servidor local
npm run api:types    genera tipos desde la API local
npm run lint         ESLint
npm run format:check verificación de formato
npm test             pruebas Vitest
npm run build        compilación de producción
npm run verify       lint, formato, pruebas y build
```

La carpeta `frontend/` tiene su propio `package.json` y `package-lock.json`; las
dependencias del backend en la raíz no se comparten.

## Tipos OpenAPI

Para regenerar los tipos no hace falta usar staging. Levanta el backend local
con `docker compose --env-file backend/.env up -d database api` desde la raíz y
ejecuta `npm run api:types` desde `frontend/`. El comando obtiene
`http://localhost:3000/api/docs.json` y actualiza
`src/shared/api/schema.d.ts`; revisa y versiona el resultado junto con cualquier
cambio de contrato del backend.
