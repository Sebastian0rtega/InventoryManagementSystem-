# TODO — Día 4: Roles, autorización y usuarios

- [x] 1. Migración `20260718000100-sync-roles.js`: renombrar roles a ADMIN/SELLER/WAREHOUSE
- [x] 2. Migración `20260718000200-add-activo-to-usuarios.js`: columna `activo`
- [x] 3. Modelo `usuario.ts`: agregar campo `activo`
- [x] 4. `utils/errors.ts`: agregar `ForbiddenError` (403)
- [x] 5. Middleware `authorize.ts`: `authorize(...roles)`
- [x] 6. `services/authService.ts`: roles constantes, JWT con nombre de rol, register usa SELLER
- [x] 7. `services/userService.ts`: list/get/create/update/updateStatus
- [x] 8. `controllers/userController.ts`: reglas de propiedad (ADMIN o propietario)
- [x] 9. `routes/userRoutes.ts`: endpoints de usuarios
- [x] 10. `app.ts`: montar `/api/users`
- [x] 11. Seeders: alinear nombres de roles + usuarios
- [x] 12. Compilar/lint y validar definición de terminado


# TODO — Prueba desde un clon limpio

- [x] 1. Clonar el repositorio en una carpeta nueva
- [x] 2. Cambiar a la rama de integración autorizada
- [x] 3. Crear `.env` a partir de `.env.example`
- [x] 4. Levantar PostgreSQL con Docker Compose
- [x] 5. Instalar dependencias
- [x] 6. Ejecutar migraciones y seeders
- [x] 7. Iniciar el backend
- [x] 8. Ejecutar todos los casos de la colección API

# TODO — README obligatorio

- [x] Requisitos previos
- [x] Instalación y variables de entorno
- [x] Comandos para Docker, migraciones, seeders y servidor
- [x] Estructura del backend
- [x] Listado de endpoints y roles
- [x] Credenciales de demostración sin secretos reales
- [x] Problemas conocidos y decisiones técnicas

# TODO — Demostración mínima

- [x] 1. Mostrar PostgreSQL healthy
- [x] 2. Ejecutar migraciones y seeders
- [x] 3. Mostrar `/api/health` y `/api/health/database`
- [x] 4. Registrar o crear un usuario
- [x] 5. Iniciar sesión y consultar `/api/auth/me`
- [x] 6. Demostrar un 403 por rol insuficiente
- [x] 7. Crear categoría y producto
- [x] 8. Demostrar rechazo de SKU duplicado
- [x] 9. Listar productos usando paginación y búsqueda

# TODO — Cierre Sprint 1

- [x] Dejar todos los PR del Sprint 1 hacia `dev` listos para revisión
- [x] No fusionar a `main` ni crear `v0.2.0` hasta recibir aprobación

# TODO — Cierre Semana 3

- [x] Hacer que las suites de integración fallen si PostgreSQL de pruebas no responde
- [x] Dar defaults de entorno a Jest para no depender de `backend/.env`
- [x] Generar paths Swagger y alinear esquemas de compras, ventas y ajustes con Zod
- [x] Persistir ajustes manuales como `AJUSTE_ENTRADA` o `AJUSTE_SALIDA` con migración compatible
- [x] Limitar creación, listado y detalle de compras de WAREHOUSE a su tienda
- [x] Agregar requests Bruno para inventario, ajustes y consulta de movimientos
- [x] Actualizar README y roadmap de la semana
- [x] Ejecutar build y lint (0 errores; 2 warnings existentes)
- [x] Ejecutar migraciones y seeders en PostgreSQL de pruebas; tests: 7 suites y 82 tests aprobados
- [x] Ejecutar Bruno contra la API de pruebas en AWS (inventario: 6 requests, 12 assertions aprobadas)