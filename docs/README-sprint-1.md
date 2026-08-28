# Sprint 1 - Demostración Mínima y Colección Postman

Este documento contiene la guía de la **Demostración Mínima** y las instrucciones para importar y ejecutar la colección de Postman del Sprint 1.

---

## 📦 Colección de Postman API

La colección de Postman formateada en estándar v2.1.0 se encuentra en:
`docs/sprint-1-inventory-api.postman_collection.json`

### Instrucciones para importar en Postman:
1. Abre la aplicación de **Postman**.
2. Haz clic en el botón **Import** (o utiliza el atajo `Ctrl + O`).
3. Selecciona el archivo `docs/sprint-1-inventory-api.postman_collection.json`.
4. La colección cargará automáticamente con la variable de entorno `{{baseUrl}}` apuntando a `http://localhost:3000`.

---

## 🚀 Demostración Mínima (9 Pasos)

1. **PostgreSQL Healthy**:
   - `GET {{baseUrl}}/api/health/database` → `200 OK` `{"status": "connected", "message": "Conexión a PostgreSQL exitosa."}`

2. **Ejecutar Migraciones y Seeders**:
   - `npm run db:migrate` y `npm run db:seed`

3. **Mostrar `/api/health` y `/api/health/database`**:
   - `GET {{baseUrl}}/api/health` → `200 OK`
   - `GET {{baseUrl}}/api/health/database` → `200 OK`

4. **Registrar un usuario**:
   - `POST {{baseUrl}}/api/auth/register` con cuerpo JSON: `email`, `nombre`, `password`.

5. **Iniciar sesión y consultar `/api/auth/me`**:
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
