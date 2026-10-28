/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Estado del servicio
 *     security: []
 *     responses:
 *       '200': { description: Servicio disponible }
 * /api/health/database:
 *   get:
 *     tags: [Health]
 *     summary: Estado de la conexión PostgreSQL
 *     security: []
 *     responses:
 *       '200': { description: Base de datos conectada }
 *       '503': { description: Base de datos no disponible }
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar vendedor
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegistroInput' }
 *     responses:
 *       '201': { description: Usuario registrado }
 *       '400': { description: Datos inválidos }
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión y obtener JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       '200': { description: Sesión iniciada }
 *       '401': { description: Credenciales inválidas }
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener usuario autenticado
 *     responses:
 *       '200': { description: Usuario actual }
 *       '401': { description: Token ausente o inválido }
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios (ADMIN)
 *     responses:
 *       '200': { description: Usuarios paginados }
 *       '403': { description: Rol sin permiso }
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario (ADMIN)
 *     responses:
 *       '201': { description: Usuario creado }
 *       '400': { description: Datos inválidos }
 *       '403': { description: Rol sin permiso }
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Usuario encontrado }
 *       '404': { description: Usuario no encontrado }
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar usuario propio o como ADMIN
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Usuario actualizado }
 *       '403': { description: Rol sin permiso }
 *       '404': { description: Usuario no encontrado }
 * /api/users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Activar o desactivar usuario (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Estado actualizado }
 *       '403': { description: Rol sin permiso }
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Listar categorías
 *     responses:
 *       '200': { description: Categorías }
 *   post:
 *     tags: [Categories]
 *     summary: Crear categoría (ADMIN)
 *     responses:
 *       '201': { description: Categoría creada }
 *       '400': { description: Datos inválidos }
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Obtener categoría por ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Categoría encontrada }
 *       '404': { description: Categoría no encontrada }
 *   patch:
 *     tags: [Categories]
 *     summary: Actualizar categoría (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Categoría actualizada }
 *       '404': { description: Categoría no encontrada }
 *   delete:
 *     tags: [Categories]
 *     summary: Eliminar categoría (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Categoría eliminada }
 *       '409': { description: Categoría asociada a productos }
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Listar productos con filtros y paginación
 *     responses:
 *       '200': { description: Productos }
 *   post:
 *     tags: [Products]
 *     summary: Crear producto (ADMIN)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductoInput' }
 *     responses:
 *       '201': { description: Producto creado }
 *       '400': { description: Datos inválidos }
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtener producto por ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Producto encontrado }
 *       '404': { description: Producto no encontrado }
 *   patch:
 *     tags: [Products]
 *     summary: Actualizar producto (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Producto actualizado }
 *       '404': { description: Producto no encontrado }
 *   delete:
 *     tags: [Products]
 *     summary: Desactivar producto (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Producto desactivado }
 *       '404': { description: Producto no encontrado }
 * /api/suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: Listar proveedores (ADMIN, WAREHOUSE)
 *     responses:
 *       '200': { description: Proveedores }
 *   post:
 *     tags: [Suppliers]
 *     summary: Crear proveedor (ADMIN)
 *     responses:
 *       '201': { description: Proveedor creado }
 *       '400': { description: Datos inválidos }
 * /api/suppliers/{id}:
 *   get:
 *     tags: [Suppliers]
 *     summary: Obtener proveedor por ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Proveedor encontrado }
 *       '404': { description: Proveedor no encontrado }
 *   patch:
 *     tags: [Suppliers]
 *     summary: Actualizar proveedor (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Proveedor actualizado }
 *       '404': { description: Proveedor no encontrado }
 *   delete:
 *     tags: [Suppliers]
 *     summary: Desactivar proveedor (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Proveedor desactivado }
 *       '404': { description: Proveedor no encontrado }
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Listar clientes (ADMIN, SELLER)
 *     responses:
 *       '200': { description: Clientes }
 *   post:
 *     tags: [Customers]
 *     summary: Crear cliente (ADMIN, SELLER)
 *     responses:
 *       '201': { description: Cliente creado }
 *       '400': { description: Datos inválidos }
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Obtener cliente por ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Cliente encontrado }
 *       '404': { description: Cliente no encontrado }
 *   patch:
 *     tags: [Customers]
 *     summary: Actualizar cliente (ADMIN, SELLER)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Cliente actualizado }
 *       '404': { description: Cliente no encontrado }
 *   delete:
 *     tags: [Customers]
 *     summary: Desactivar cliente (ADMIN)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Cliente desactivado }
 *       '404': { description: Cliente no encontrado }
 * /api/purchases:
 *   post:
 *     tags: [Purchases]
 *     summary: Crear compra con entrada de stock atómica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CrearCompraInput' }
 *     responses:
 *       '201': { description: Compra creada }
 *       '400': { description: Datos inválidos }
 *       '403': { description: WAREHOUSE solo puede comprar para su tienda }
 *       '409': { description: Documento duplicado }
 *   get:
 *     tags: [Purchases]
 *     summary: Listar compras; WAREHOUSE solo ve su tienda
 *     parameters:
 *       - { in: query, name: supplierId, schema: { type: integer } }
 *       - { in: query, name: storeId, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       '200': { description: Compras paginadas y limitadas por tienda para WAREHOUSE }
 *       '403': { description: Rol sin permiso }
 * /api/purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Obtener compra; WAREHOUSE solo consulta su tienda
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Compra con detalles }
 *       '404': { description: Compra no encontrada en el ámbito del usuario }
 * /api/sales:
 *   post:
 *     tags: [Sales]
 *     summary: Crear venta con salida de stock atómica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CrearVentaInput' }
 *     responses:
 *       '201': { description: Venta creada }
 *       '400': { description: Datos inválidos }
 *       '409': { description: Stock insuficiente }
 *   get:
 *     tags: [Sales]
 *     summary: Listar ventas
 *     parameters:
 *       - { in: query, name: storeId, schema: { type: integer } }
 *       - { in: query, name: customerId, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       '200': { description: Ventas paginadas }
 * /api/sales/{id}:
 *   get:
 *     tags: [Sales]
 *     summary: Obtener venta con detalles
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       '200': { description: Venta encontrada }
 *       '404': { description: Venta no encontrada }
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Listar stock con filtros y paginación
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: storeId, schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string, enum: [NORMAL, LOW, OUT] } }
 *       - { in: query, name: sort, schema: { type: string, enum: [stock_actual, '-stock_actual'] } }
 *     responses:
 *       '200': { description: Inventario; SELLER y WAREHOUSE quedan limitados a su tienda }
 * /api/inventory/adjustments:
 *   post:
 *     tags: [Inventory]
 *     summary: Ajustar stock manualmente y registrar dirección del movimiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AjusteInventarioInput' }
 *     responses:
 *       '201': { description: Ajuste y movimiento AJUSTE_ENTRADA o AJUSTE_SALIDA registrados }
 *       '400': { description: Datos inválidos }
 *       '403': { description: Rol sin permiso o tienda ajena }
 *       '409': { description: Stock insuficiente para una salida }
 * /api/inventory/{id}/movements:
 *   get:
 *     tags: [Inventory]
 *     summary: Consultar bitácora de movimientos de inventario
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       '200': { description: Movimientos paginados; solo lectura }
 *       '403': { description: Rol sin permiso o tienda ajena }
 *       '404': { description: Inventario no encontrado }
 */
export const openapiRouteDocumentation = true;