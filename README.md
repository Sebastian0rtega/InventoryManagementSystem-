# Inventory Management System - Backend API

Sistema profesional de gestión de inventario desarrollado con **Node.js**, **Express**, **TypeScript** y **PostgreSQL** (Sequelize ORM).

> 📌 **Sprint 1**: Para consultar la guía de la demostración mínima de 9 pasos y la colección de Postman, consulta el [README de Sprint 1](docs/README-sprint-1.md).

---

##  Requisitos Previos

Asegúrate de contar con los siguientes componentes instalados en tu sistema:
- **Node.js**: `v18.0.0` o superior (Recomendado `v20` o `v24`).
- **npm**: `v9.0.0` o superior.
- **PostgreSQL**: `v15` o superior (o Docker / Docker Desktop).
- **Git**.

---

##  Instalación y Variables de Entorno

### 1. Clonar el repositorio
```bash
git clone https://github.com/Sebastian0rtega/InventoryManagementSystem-.git
cd InventoryManagementSystem-
```

### 2. Instalar dependencias
```bash
# Desde la raíz del repositorio
npm ci --prefix backend
```

### 3. Configurar variables de entorno
Copia el ejemplo que vive en `backend/` para crear `backend/.env`:
```bash
# Desde la raíz del repositorio
cp backend/.env.example backend/.env
```
En PowerShell puedes usar `Copy-Item backend\.env.example backend\.env`. Edita el archivo según tus credenciales locales. No subas `.env` al repositorio.


##  Comandos para Docker, Migraciones, Seeders y Servidor

###  Docker
El archivo docker-compose.yaml esta en la raiz del repositorio (no dentro de backend/). Ejecuta desde la raiz:
```bash
docker compose --env-file backend/.env up -d database
docker compose --env-file backend/.env ps
```
El `init.sql` crea `inventory_test_db` junto con la base configurada en `DB_NAME`, al inicializar un volumen nuevo.

###  Migraciones y Seeders (Sequelize CLI)
Para ejecutar las migraciones (creación de tablas) y popular los datos semilla (roles, tienda inicial y usuario admin y vendedor de demostracion): los comandos se ejecutan desde la carpeta backend/
```bash
# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders
npm run db:seed

# Deshacer seeders (opcional)
npm run db:seed:undo

# Compilar y revisar estilo
npm run build
npm run lint
```

### Pruebas automatizadas
Desde `backend/`, con PostgreSQL disponible y `DB_NAME_TEST` apuntando a una base aislada:
```bash
npm run db:test:setup
npm test
```
`db:test:setup` revierte migraciones, vuelve a migrar y ejecuta seeders **solo en `DB_NAME_TEST`**. No lo ejecutes contra la base de producción. Jest usa valores locales de prueba para las variables de aplicación si no hay `.env`, pero las pruebas de integración fallan explícitamente si PostgreSQL no está disponible.

### Swagger y Bruno
- Swagger UI: `http://localhost:3000/api/docs`; especificación: `http://localhost:3000/api/docs.json`.
- En Bruno, ejecuta primero los requests de `setup/` para obtener `tokenWarehouse`. La carpeta `inventory/` incluye listado, ajustes de entrada/salida, consulta de movimientos y casos de autorización.

###  Servidor de Desarrollo y Producción
```bash
# Iniciar servidor de desarrollo con recarga automática (ts-node-dev)
npm run dev

# Compilar proyecto a JavaScript (TypeScript build)
npm run build

# Iniciar servidor compilado en modo producción
npm start
```

---

## 📂 Estructura del Backend

```
backend/
├── .env.example          # Plantilla de variables de entorno
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración compilador TypeScript
├── src/
│   ├── server.ts         # Punto de entrada del servidor HTTP
│   ├── app.ts            # Configuración de Express, middlewares y rutas
│   ├── config/
│   │   ├── env.ts        # Validación de variables de entorno
│   │   └── db.ts         # Instancia de conexión Sequelize
│   ├── controllers/      # Controladores HTTP (Manejo de request/response)
│   │   ├── authController.ts
│   │   ├── categoryController.ts
│   │   ├── productController.ts
│   │   └── userController.ts
│   ├── services/         # Capa de Lógica de Negocio
│   │   ├── authService.ts
│   │   ├── categoryService.ts
│   │   ├── productService.ts
│   │   └── userService.ts
│   ├── models/           # Modelos Sequelize en TypeScript
│   │   ├── index.ts
│   │   ├── usuario.ts
│   │   ├── rol.ts
│   │   ├── tienda.ts
│   │   ├── categoria.ts
│   │   └── producto.ts
│   ├── middlewares/      # Interceptores (Auth, Roles, Error Handler)
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   └── errorHandler.ts
│   ├── routes/           # Rutas y enrutadores Express
│   │   ├── authRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── userRoutes.ts
│   └── utils/            # Utilidades y clases de error estandarizadas
│       └── errors.ts
```

---

##  Listado de Endpoints y Roles

### Roles de Usuario Canónicos
- **`ADMIN`**: Administrador Global. Acceso total a usuarios, categorías y gestión de catálogo.
- **`SELLER`**: Vendedor. Acceso a consulta de productos y ventas (Rol asignado por defecto al registrarse).
- **`WAREHOUSE`**: Bodeguero. Acceso a gestión de inventarios y movimientos de stock.

### Tabla de Endpoints API

| Método | Ruta | Propósito | Acceso |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Estado del servicio web | Público |
| **GET** | `/api/health/database` | Estado de conexión a PostgreSQL | Público |
| **POST** | `/api/auth/register` | Registrar usuario (aprendizaje) | Público |
| **POST** | `/api/auth/login` | Validar credenciales y obtener JWT | Público |
| **GET** | `/api/auth/me` | Obtener usuario autenticado y su rol | Token |
| **GET** | `/api/users` | Listar usuarios del sistema | Admin |
| **GET** | `/api/users/:id` | Obtener usuario por ID | Token |
| **POST** | `/api/users` | Crear usuario con rol específico | Admin |
| **PATCH** | `/api/users/:id` | Actualizar datos de usuario | Token (Propio/Admin) |
| **PATCH** | `/api/users/:id/status` | Activar/Desactivar usuario | Admin |
| **GET** | `/api/categories` | Listar categorías | Token |
| **POST** | `/api/categories` | Crear categoría | Admin |
| **PATCH** | `/api/categories/:id` | Editar categoría | Admin |
| **DELETE** | `/api/categories/:id` | Eliminar categoría | Admin |
| **GET** | `/api/products` | Listar productos (Paginación/Búsqueda) | Token |
| **GET** | `/api/products/:id` | Obtener detalle de un producto | Token |
| **POST** | `/api/products` | Crear nuevo producto | Admin |
| **PATCH** | `/api/products/:id` | Actualizar producto | Admin |
| **DELETE** | `/api/products/:id` | Desactivar producto (Soft delete) | Admin |
| **GET/POST** | `/api/suppliers` | Listar y crear proveedores | Admin / Warehouse lectura; Admin creación |
| **GET/PATCH/DELETE** | `/api/suppliers/:id` | Ver, editar y desactivar proveedor | Admin / Warehouse lectura; Admin escritura |
| **GET/POST** | `/api/customers` | Listar y crear clientes | Admin / Seller |
| **GET/PATCH/DELETE** | `/api/customers/:id` | Ver, editar y desactivar cliente | Admin / Seller lectura y edición; Admin desactivación |
| **POST/GET** | `/api/purchases` | Crear y listar compras con paginación | Admin / Warehouse (solo su tienda) |
| **GET** | `/api/purchases/:id` | Obtener compra con detalles | Admin / Warehouse (solo su tienda) |
| **POST/GET** | `/api/sales` | Crear y listar ventas con paginación | Admin / Seller |
| **GET** | `/api/sales/:id` | Obtener venta con detalles | Admin / Seller |
| **GET** | `/api/inventory` | Consultar stock, búsqueda y filtros | Admin / Seller / Warehouse (tienda propia para Seller/Warehouse) |
| **POST** | `/api/inventory/adjustments` | Ajustar stock y registrar entrada o salida | Admin / Warehouse |
| **GET** | `/api/inventory/:id/movements` | Consultar bitácora de movimientos | Admin / Warehouse (tienda propia) |
| **GET** | `/api/docs` | Swagger UI | Público |
| **GET** | `/api/docs.json` | Especificación OpenAPI | Público |

---

##  Credenciales de Demostración (Sin secretos reales)

> [!NOTE]
> Estas credenciales son únicamente para entornos de prueba locales/desarrollo y se alimentan de la semilla (`db:seed`).

- **Administrador Global (Admin)**:
  - **Email**: `admin@inventory.com`
  - **Password**: valor de `ADMIN_PASSWORD` en tu `.env`
- **Vendedor Demo (Seller)**:
  - **Email**: `vendedor.demo@example.com`
  - **Password**: valor de `ADMIN_PASSWORD` en tu `.env` con sufijo `-seller`
- **Bodeguero Demo (Warehouse)**:
  - **Email**: `bodega@empresa.com`
  - **Password**: valor de `ADMIN_PASSWORD` en tu `.env` con sufijo `-warehouse`

En Bruno, configura `adminPassword`, `sellerPassword` y `warehousePassword` en el
environment `local` para que coincidan con `ADMIN_PASSWORD` y sus sufijos.

---

##  Problemas Conocidos y Decisiones Técnicas

1. **Arquitectura en Capas Decoplada (Controladores vs. Servicios)**:
   - Toda la lógica de negocio se encuentra en la capa `services/`. Los controladores en `controllers/` son delgados y únicamente se encargan del parseo HTTP y respuestas.
2. **Propiedades de Modelos en TypeScript (`declare`)**:
   - Se utiliza la palabra clave `declare` en la definición de propiedades de los modelos Sequelize (`export class Usuario extends Model { declare email: string; }`) para evitar el "class property shadowing" al compilar TypeScript con `target: ES2022`.
3. **Manejo de Duplicados en Base de Datos**:
   - En lugar de confiar únicamente en verificaciones previas (`findOne`), se capturan las excepciones `SequelizeUniqueConstraintError` para garantizar la seguridad ante solicitudes concurrentes (*race-condition safe*), retornando un código `409 Conflict`.
4. **Respuesta Estándar de Errores**:
   - Todos los errores devuelven una estructura uniforme:
     ```json
     {
       "success": false,
       "error": {
         "code": "VALIDATION_ERROR | CONFLICT | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | INTERNAL_SERVER_ERROR",
         "message": "Mensaje comprensible",
         "details": []
       }
     }
     ```
5. **Desactivación Lógica de Productos (*Soft Delete*)**:
   - Los productos eliminados mediante `DELETE /api/products/:id` no se borran físicamente de la base de datos para no romper la trazabilidad histórica de compras y ventas. En su lugar, se actualiza el atributo `activo: false`.
6. **Tienda del rol WAREHOUSE**:
  - Las compras creadas, listadas o consultadas por WAREHOUSE quedan limitadas a la tienda asignada al usuario; el `storeId` de la petición no amplía ese ámbito.
7. **Dirección de ajustes manuales**:
  - La bitácora persiste `AJUSTE_ENTRADA` o `AJUSTE_SALIDA`. El valor histórico `AJUSTE` se conserva permitido para no invalidar registros antiguos.
