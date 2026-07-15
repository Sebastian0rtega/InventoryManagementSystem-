
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

##  Tecnologías
- **Backend:** Node.js / Express
- **Frontend:** Angular + typescript
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize
- **Infraestructura:** Docker, GitHub Actions, Cloud Deploy
- **Control de versiones:** Git + GitHub

##  Arquitectura propuesta
- **Frontend:** SPA en Angular
- **Backend:** API REST en Node.js
- **Base de datos:** PostgreSQL con modelo relacional
- **Infraestructura:** Contenedores Docker + CI/CD

 Roadmap del Bootcamp
- **Semana 1:** Sprint 0 – Planificación, repositorio, base de datos, documentación.

(suposicion)
- **Semana 2:** Autenticación y roles.
- **Semana 3:** CRUD de productos y categorías.
- **Semana 4:** Proveedores y clientes.
- **Semana 5:** Compras y ventas.
- **Semana 6:** Movimientos de inventario y reportes.
- **Semana 7:** Docker y CI/CD.
- **Semana 8:** Deploy en la nube.

##  Modelo de ramas (Git Flow)
- `main` → protegida, lista para producción.
- `dev` → rama de integración.
- `feature/*` → ramas para nuevas funcionalidades.
  
   


# Instalación
1. Clonar el repositorio:
   ```bash
   git clone git@github.com:usuario/inventory-management-system.git



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