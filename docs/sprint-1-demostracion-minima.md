# Sprint 1 - Demostración Mínima y Colección Postman

Este documento contiene la guía de la **Demostración Mínima** y las instrucciones para utilizar la colección de Postman en las pruebas del Sprint 1.

---

##  Colección de Postman

El archivo de la colección se encuentra en:
`docs/sprint-1-inventory-api.postman_collection.json`

### Cómo Importar y Usar en Postman:
1. Abre **Postman**.
2. Haz clic en **Import** (o `Ctrl + O`) y selecciona el archivo `docs/sprint-1-inventory-api.postman_collection.json`.
3. La colección incluye la variable `{{baseUrl}}` por defecto en `http://localhost:3000`.

---

## Puntos de la Demostración Mínima

1. **PostgreSQL Healthy**:
   - `GET {{baseUrl}}/api/health/database` → `200 OK` `{"status": "connected", "message": "Conexión a PostgreSQL exitosa."}`

2. **Ejecutar Migraciones y Seeders**:
   - `npm run db:migrate` y `npm run db:seed`

3. **Mostrar /api/health y /api/health/database**:
   - `GET {{baseUrl}}/api/health` → `200 OK`
   - `GET {{baseUrl}}/api/health/database` → `200 OK`

4. **Registrar un usuario**:
   - `POST {{baseUrl}}/api/auth/register` con cuerpo JSON: `email`, `nombre`, `password`.

5. **Iniciar sesión y consultar /api/auth/me**:
   - `POST {{baseUrl}}/api/auth/login` → Retorna Token JWT.
   - `GET {{baseUrl}}/api/auth/me` con Header `Authorization: Bearer <TOKEN>` → Retorna datos de identidad y rol.

6. **Demostrar 403 por rol insuficiente**:
   - Intentar crear categoría con token de rol `SELLER`: `POST {{baseUrl}}/api/categories` → `403 Forbidden`.

7. **Crear categoría y producto (Como Admin)**:
   - Login como `admin@inventory.com` → Obtiene token de `ADMIN`.
   - `POST {{baseUrl}}/api/categories` → `201 Created`.
   - `POST {{baseUrl}}/api/products` → `201 Created`.

8. **Demostrar rechazo de SKU duplicado**:
   - `POST {{baseUrl}}/api/products` con SKU existente → `409 Conflict`.

9. **Listar productos usando paginación y búsqueda**:
   - `GET {{baseUrl}}/api/products?page=1&limit=5&search=Teclado` → `200 OK` con listado paginado.
