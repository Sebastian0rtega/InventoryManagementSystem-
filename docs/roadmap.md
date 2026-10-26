## Roadmap

- **Sprint 0 (Semana 1):** Configuración inicial del repositorio, GitHub Project, Issues, diseño de base de datos, documentación.
- **Sprint 1 (Semana 2):** Implementar autenticación y roles de usuario.
- **Sprint 2 (Semana 3):** Módulos de compras, ventas e inventario.
- **Sprint 3 (Semana 4):** CRUD de proveedores y clientes.
- **Sprint 4 (Semana 5):** Módulo de compras y ventas.
- **Sprint 5 (Semana 6):** Movimientos de inventario y reportes básicos.
- **Sprint 6 (Semana 7):** Dashboard y exportación a Excel.
- **Sprint 7 (Semana 8):** Integración con Docker, CI/CD y despliegue en la nube.

## Estado de Semana 3

- Compras y ventas transaccionales con detalle y actualización atómica de stock.
- Inventario con filtros y paginación; los ajustes manuales registran explícitamente entrada o salida.
- WAREHOUSE opera compras e inventario únicamente en la tienda asignada.
- Swagger/OpenAPI publica las rutas reales y sus contratos de entrada principales.
- Bruno incluye casos de inventario, movimientos y autorización por tienda.
- Validación local: build y lint ejecutados; lint sin errores y con dos warnings preexistentes.
- Validación en AWS: migraciones y seeders completados en PostgreSQL de pruebas; build pasó y la suite completa aprobó 7/7 suites (82/82 tests).
- Bruno en AWS: 6 requests de inventario aprobados, con 12/12 assertions (incluye autorización 401/403).
