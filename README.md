
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
- **Frontend:** React
- **Base de Datos:** PostgreSQL
- **ORM:** Sequelize
- **Infraestructura:** Docker, GitHub Actions, Cloud Deploy
- **Control de versiones:** Git + GitHub

##  Arquitectura propuesta
- **Frontend:** SPA en React
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
- `develop` → rama de integración.
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


## Decisiones de diseño

## 1. Inventario por tienda
  El inventario será por tienda, ya que cada sucursal maneja su propio stock.
  Se utiliza la tabla inventarios con los campos:

    producto_id

    tienda_id

    stock_actual

    stock_minimo

  Esto permite controlar el stock diferenciado por ubicación y facilita reportes de ventas y compras por tienda.

## 2. Uso de stock_total y stock_actual  
Se elimina la duplicación.

  Se mantiene solo stock_actual en la tabla productos.
  stock_minimo se conserva como referencia para alertas.
  stock_total no aporta valor adicional, ya que el control se hace con stock_actual y las reglas de inventario.

## 3. Relación producto–proveedor
  Un producto puede ser comprado a varios proveedores.
  La relación se maneja en la tabla compras con proveedor_id, vinculando cada compra a un proveedor.
  Esto otorga flexibilidad para abastecimiento y mejores condiciones comerciales.

## 4. Reglas de stock (aumenta/disminuye)

  Compra: incrementa el stock del producto en la tienda correspondiente.

  Venta: disminuye el stock del producto en la tienda correspondiente.

  Movimiento: ajusta manualmente el stock por devoluciones, pérdidas o correcciones.

## 5. Auditoría de movimientos
  La tabla movimientos_inventario debe incluir referencias opcionales a compras y ventas. Cada movimiento de inventario debe registrar:

    producto_id

    cantidad

    tipo_movimiento (entrada/salida)

    fecha_movimiento

    motivo

  Esto permite rastrear el origen de cada cambio en el stock y cumplir con trazabilidad y seguridad.