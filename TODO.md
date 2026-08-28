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

- [ ] 1. Clonar el repositorio en una carpeta nueva
- [ ] 2. Cambiar a la rama de integración autorizada
- [ ] 3. Crear `.env` a partir de `.env.example`
- [ ] 4. Levantar PostgreSQL con Docker Compose
- [ ] 5. Instalar dependencias
- [ ] 6. Ejecutar migraciones y seeders
- [ ] 7. Iniciar el backend
- [ ] 8. Ejecutar todos los casos de la colección API

# TODO — README obligatorio

- [ ] Requisitos previos
- [ ] Instalación y variables de entorno
- [ ] Comandos para Docker, migraciones, seeders y servidor
- [ ] Estructura del backend
- [ ] Listado de endpoints y roles
- [ ] Credenciales de demostración sin secretos reales
- [ ] Problemas conocidos y decisiones técnicas

# TODO — Demostración mínima

- [ ] 1. Mostrar PostgreSQL healthy
- [ ] 2. Ejecutar migraciones y seeders
- [ ] 3. Mostrar `/api/health` y `/api/health/database`
- [ ] 4. Registrar o crear un usuario
- [ ] 5. Iniciar sesión y consultar `/api/auth/me`
- [ ] 6. Demostrar un 403 por rol insuficiente
- [ ] 7. Crear categoría y producto
- [ ] 8. Demostrar rechazo de SKU duplicado
- [ ] 9. Listar productos usando paginación y búsqueda

# TODO — Cierre Sprint 1

- [ ] Dejar todos los PR del Sprint 1 hacia `dev` listos para revisión
- [ ] No fusionar a `main` ni crear `v0.2.0` hasta recibir aprobación