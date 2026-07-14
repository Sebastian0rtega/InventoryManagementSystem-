
# Inventory Management System

## Descripción
Sistema profesional de gestión de inventario desarrollado como parte de un Bootcamp de Desarrollo Fullstack.  
El proyecto simula el flujo de trabajo de una empresa real, utilizando metodologías ágiles, Git Flow y despliegue en la nube.

**Objetivos**
- Gestionar productos, categorías, proveedores y clientes.
- Registrar compras, ventas y movimientos de inventario.
- Implementar autenticación y roles de usuario.
- Generar reportes y exportar datos a Excel.
- Desplegar con Docker y CI/CD en la nube.

## Tecnologías
- **Frontend:** Angular + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize
- **Infraestructura:** Docker, GitHub Actions, Cloud Deploy
- **Control de versiones:** Git + GitHub

## Arquitectura propuesta
- **Frontend:** SPA en Angular
- **Backend:** API REST en Node.js + Express
- **Base de datos:** PostgreSQL con modelo relacional
- **Infraestructura:** Contenedores Docker + CI/CD

## Roadmap

- **Sprint 0 (Semana 1):** Configuración inicial del repositorio, GitHub Project, Issues, diseño de base de datos, documentación.
- **Sprint 1 (Semana 2):** Implementar autenticación y roles de usuario.
- **Sprint 2 (Semana 3):** CRUD de productos y categorías.
- **Sprint 3 (Semana 4):** CRUD de proveedores y clientes.
- **Sprint 4 (Semana 5):** Módulo de compras y ventas.
- **Sprint 5 (Semana 6):** Movimientos de inventario y reportes básicos.
- **Sprint 6 (Semana 7):** Dashboard y exportación a Excel.
- **Sprint 7 (Semana 8):** Integración con Docker, CI/CD y despliegue en la nube.


## Modelo de ramas (Git Flow)
- `main` → protegida, lista para producción.
- `dev` → rama de integración.
- `feature/*` → ramas para nuevas funcionalidades.
  
   


# Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Sebastian0rtega/InventoryManagementSystem-.git

## Estructura 
InventoryManagementSystem/
│
├── .gitignore
├── LICENSE
├── README.md
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── consultas.sql
│
└── docs/
    ├── arquitectura.md
    ├── requerimientos.md
    ├── roadmap.md
    ├── modelo-entidad-relacion.drawio
    └── modelo-entidad-relacion.drawio.png


# Release v0.1.0 - Sprint 0

Este release corresponde a la primera semana del proyecto (Sprint 0).  
Incluye la planificación inicial y preparación del entorno de desarrollo.

##  Entregables
- Repositorio público configurado.
- README profesional.
- Roadmap del proyecto.
- Arquitectura inicial.
- Modelo Entidad-Relación.
- Archivos SQL:
  - schema.sql
  - seed.sql
  - consultas.sql
- GitHub Project con Issues.
- alrededor de 30 commits 
- Pull Requests revisados y aprobados.


## 3.2 Decisiones de diseño documentadas

- **Inventario por tienda**  
  El inventario se gestiona por **tienda**, no de forma global. Se utiliza la tabla `inventarios` con las columnas `producto_id`, `tienda_id`, `stock_actual` y `stock_minimo`. Esto permite controlar el stock específico de cada sucursal.

- **Stock_actual vs stock_total**  
  Se elimina la duplicación: solo se mantiene `stock_actual`. El campo `stock_total` no se utiliza porque el inventario es por tienda y no global. `stock_actual` representa la cantidad disponible en esa tienda.

- **Relación producto-proveedor**  
  Un producto puede ser comprado a **varios proveedores**. No existe un proveedor principal fijo. La relación se establece a través de las tablas `compras` y `detalle_compras`, donde cada compra vincula un producto con el proveedor correspondiente.

- **Reglas de stock**  
  - Una **compra** incrementa el `stock_actual` del producto en la tienda correspondiente.  
  - Una **venta** disminuye el `stock_actual`.  
  - Cada modificación genera un registro en `movimientos_inventarios` para trazabilidad.

- **Auditoría de movimientos**  
  Los movimientos de inventario se auditan con:  
  - `producto_id` y `inventario_id` para identificar qué stock cambió.  
  - `tipo_movimiento` (compra, venta, ajuste).  
  - `cantidad` y `fecha_movimiento`.  
  - `motivo` para documentar la razón.  
  - Opcionalmente, referencias a `compra_id` o `venta_id` pueden añadirse para vincular el origen exacto del movimiento.


## Autor
Sebastian Ortega

## Licencia
Este proyecto está distribuido bajo la licencia MIT. Consulte el archivo LICENSE para más información.