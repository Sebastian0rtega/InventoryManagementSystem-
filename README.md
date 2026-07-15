
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

##  Arquitectura propuesta
- **Frontend:** SPA en Angular
- **Backend:** API REST en Node.js
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


## El proyecto compila, lint no falla, el servidor inicia sin warnings propios y /api/health responde 200
