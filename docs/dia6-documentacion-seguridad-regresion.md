# DÍA 6 · Documentación, seguridad y regresión

## Estado de implementación

### 1. Swagger/OpenAPI ✔
- `backend/src/docs/openapi.ts` — spec completa de la API (auth, users, categories,
  products, suppliers, customers, purchases, sales, inventory).
- UI interactiva: **http://localhost:3000/api/docs** · JSON: **/api/docs.json**.
- Dependencias: `swagger-ui-express`, `swagger-jsdoc` (+ `@types/*` en devDeps).

### 2. Esquemas documentados ✔
- Esquemas de entrada: `RegistroInput`, `LoginInput`, `ProductoInput`,
  `CrearCompraInput`, `CrearVentaInput`, `AjusteInventarioInput`.
- Seguridad Bearer: `components.securitySchemes.bearerAuth` (JWT, se aplica global).
- Errores estándar con esquema `Error` (code/message/details) referenciado en
  respuestas 400 (VALIDATION_ERROR), 401 (UNAUTHORIZED), 403 (FORBIDDEN),
  404 (NOT_FOUND) y 409 (CONFLICT) en las anotaciones de las rutas del Sprint 2:
  `purchaseRoutes.ts`, `saleRoutes.ts`, `inventoryRoutes.ts`.

### 3. Colección Bruno ✔
- `bruno/bruno.json` renombrada a "Inventory Management API".
- Environment `bruno/environments/local.bru` con `baseUrl`, tokens por rol
  (`tokenAdmin`, `tokenSeller`, `tokenWarehouse`) e IDs encadenados
  (`compraId`, `ventaId`, `userId`, …).
- Nueva carpeta `bruno/setup/` con los 3 logins que guardan los tokens en el
  environment vía `bru.setEnvVar` — ejecutarlos primero.
- Encadenamiento: `purchases/1` guarda `compraId` y `docNumeroTest`;
  `purchases/3-ver-compra` usa `{{compraId}}`; `sales/1` guarda `ventaId`;
  `sales/3-ver-venta` usa `{{ventaId}}`. Todos los URLs usan `{{baseUrl}}`.
- Aserciones de seguridad en los logins: `res.body.usuario: not contains password_hash`.

### 4–5. Suite Jest/Supertest ✔ (condicionada a la base de prueba)
- Suites existentes: `purchases`, `sales`, `inventory`, `suppliers-customers`,
  `transactional-models`, `money` (76 tests).
- `setup.ts` fuerza `NODE_ENV=test` → `DB_NAME_TEST` (`inventory_test_db`);
  **nunca** usa `inventory_db`.
- Limpieza entre casos: la suite valida rollback y conteos relativos (before/after),
  sin depender de datos fijos de seed.
- ⚠️ En esta máquina **no hay base accesible**: Docker Desktop apagado y el host
  remoto `34.236.152.49:5432` inalcanzable. Las pruebas de integración se saltan
  con aviso `[SKIP]`. Para ejecutarlas:
  1. Levantar Docker Desktop y `docker compose up -d database` (el `init.sql`
     crea `inventory_test_db`), o levantar PostgreSQL local.
  2. `npm run db:test:setup` (migraciones + seeders en la base de prueba).
  3. `npm test`.

### 6. Cobertura
Ejecutar con `npx jest --coverage --runInBand` para detectar rutas sin probar
(compras, ventas e inventario con DB; los GET de inventario y ajustes son los
candidatos a reforzar). La cifra es un mapa de brechas, no un objetivo.

### 7. Regresión
El orden correcto una vez la base esté arriba:
auth → users → categories → products → suppliers/customers → purchases →
sales → inventory. La suite ya corre en ese orden con `--runInBand`.

### 8. Revisión de exposición de datos ✔
- `password_hash`: excluido en todos los servicios (`PublicUser`,
  `toPublicJSON()`); actualización de usuario devuelve `getUserById` (sin hash).
- SQL/stack: `errorHandler` hace `console.error(err.stack)` **solo en logs del
  servidor**; la respuesta 500 no incluye detalles. Validado que ninguna ruta
  usa `sequelize.query` crudo en respuestas.
- **Corrección aplicada**: `/api/health/database` ya no devuelve
  `error.message` del driver (filtraba host/detalles de PostgreSQL); ahora
  responde con mensaje genérico.
- Secrets: `.env` está git-ignorado; el `.env` de ejemplo usa `change_me`.

### 9. Verificaciones ejecutadas ✔
- `npm run build` → OK (tsc sin errores).
- `npm run lint` → 0 errores, 2 warnings preexistentes
  (`models/compra.ts` import no usado, `models/usuario.ts` `_passwordHash`).
- `npm test` → **6 suites, 76 tests pasando** (integración saltada por falta de DB).

### 10. Dependencias vulnerables (criterio, sin --force)
`npm audit fix` aplicado (safe): actualiza `brace-expansion` y `js-yaml`
(solo devDeps: eslint/ts-node-dev). Quedan 5 moderadas que **requieren cambios
incompatibles** y NO se aplican a ciegas:
- `qs` (vía express 4) → requiere migrar a **Express 5** (breaking).
- `uuid` (vía sequelize 6) → requeriría Sequelize 3 (breaking).
Plan sugerido: migrar a Express 5 como tarea propia con regresión completa
después de que la base de pruebas esté operativa.
