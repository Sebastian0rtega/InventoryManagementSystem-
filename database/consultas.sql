--querys--

--  Productos con su categoría y proveedor
SELECT p.nombre AS producto, c.nombre AS categoria, pr.nombre_empresa AS proveedor, p.precio_venta, p.stock_actual
FROM producto p
JOIN categoria c ON p.categorias_id = c.categoria_id
JOIN proveedores pr ON p.proveedores_id = pr.proveedores_id
ORDER BY c.nombre, p.nombre;

--  Total de ventas por cliente
SELECT cl.nombre AS cliente, COUNT(v.ventas_id) AS cantidad_ventas, SUM(v.total) AS total_compras
FROM venta v
JOIN clientes cl ON v.clientes_id = cl.clientes_id
GROUP BY cl.nombre
ORDER BY total_compras DESC;

--  Promedio de precio de productos por categoría
SELECT c.nombre AS categoria, ROUND(AVG(p.precio_venta), 2) AS promedio_precio
FROM producto p
JOIN categoria c ON p.categorias_id = c.categoria_id
GROUP BY c.nombre
ORDER BY promedio_precio DESC;

--  Movimientos de inventario por tipo
SELECT tipo_movimiento, COUNT(*) AS cantidad_movimientos, SUM(cantidad) AS total_unidades
FROM movimientos_inventario
GROUP BY tipo_movimiento;

--  Ventas por tienda y fecha
SELECT t.nombre AS tienda, v.fecha_venta, SUM(v.total) AS total_dia
FROM venta v
JOIN tiendas t ON v.tiendas_id = t.tienda_id
GROUP BY t.nombre, v.fecha_venta
ORDER BY v.fecha_venta DESC;

--  Productos con stock bajo (menos del 10% del total)
SELECT nombre, stock_actual, stock_total
FROM producto
WHERE stock_actual < (stock_total * 0.1);

-- Clientes con más de una compra
SELECT cl.nombre, COUNT(v.ventas_id) AS compras_realizadas
FROM venta v
JOIN clientes cl ON v.clientes_id = cl.clientes_id
GROUP BY cl.nombre
HAVING COUNT(v.ventas_id) > 1;

--  Total de compras por proveedor
SELECT pr.nombre_empresa, SUM(dc.cantidad * dc.precio_unitario) AS total_compras
FROM detalle_compra dc
JOIN compra c ON dc.compras_id = c.compras_id
JOIN proveedores pr ON pr.proveedores_id = c.tiendas_id
GROUP BY pr.nombre_empresa;
