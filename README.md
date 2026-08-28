# Inventory Management System - Backend API

Sistema profesional de gestión de inventario desarrollado con **Node.js**, **Express**, **TypeScript** y **PostgreSQL** (Sequelize ORM).

> 📌 **Sprint 1**: Para consultar la guía de la demostración mínima de 9 pasos y la colección de Postman, consulta el [README de Sprint 1](file:///C:/Users/sebaw/Downloads/InventoryManagementSystem/InventoryManagementSystem-/docs/README-sprint-1.md).

---

##  Requisitos Previos

Asegúrate de contar con los siguientes componentes instalados en tu sistema:
- **Node.js**: `v18.0.0` o superior (Recomendado `v20` o `v24`).
- **npm**: `v9.0.0` o superior.
- **PostgreSQL**: `v15` o superior (o Docker / Docker Desktop).
- **Git**.

---

##  Instalación y Variables de Entorno

### 1. Clonar el repositorio y navegar a la carpeta backend
```bash
git clone https://github.com/Sebastian0rtega/InventoryManagementSystem-.git
cd InventoryManagementSystem-/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo `.env.example` para crear tu `.env`:
```bash
cp .env.example .env
```

Edita el archivo `.env` según tus credenciales locales o de base de datos


##  Comandos para Docker, Migraciones, Seeders y Servidor

###  Docker
Si deseas ejecutar la base de datos PostgreSQL utilizando Docker Compose:
```bash
docker-compose up -d
```

###  Migraciones y Seeders (Sequelize CLI)
Para ejecutar las migraciones (creación de tablas) y popular los datos semilla (roles, tienda inicial y usuario admin):
```bash
# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders
npm run db:seed

# Deshacer seeders (opcional)
npm run db:seed:undo
```

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

---

##  Credenciales de Demostración (Sin secretos reales)

> [!NOTE]
> Estas credenciales son únicamente para entornos de prueba locales/desarrollo y se alimentan de la semilla (`db:seed`).

- **Administrador Global (Admin)**:
  - **Email**: `admin@inventory.com`
  - **Password**: `Admin123!` *(Configurable en `.env` mediante `ADMIN_PASSWORD`)*
- **Vendedor Demo (Seller)**:
  - **Email**: `vendedor.demo@example.com`
  - **Password**: `Password123!`

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
