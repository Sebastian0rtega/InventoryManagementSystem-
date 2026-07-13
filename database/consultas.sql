--querys--

SELECT p.nombre AS producto, c.nombre AS categoria, pr.nombre_empresa AS proveedor
FROM Productos p
JOIN Categoria c ON p.categorias_id = c.categoria_id
JOIN Compras co ON co.productos_id = p.productos_id
JOIN Proveedores pr ON co.proveedores_id = pr.proveedores_id;

SELECT c.nombre AS categoria, p.nombre AS producto
FROM Categoria c
LEFT JOIN Productos p ON c.categoria_id = p.categorias_id;

SELECT cl.nombre AS cliente, v.ventas_id
FROM Clientes cl
LEFT JOIN Ventas v ON cl.clientes_id = v.clientes_id;


SELECT nombre, stock_actual, stock_minimo
FROM Productos
WHERE stock_actual < stock_minimo;


SELECT cl.nombre AS cliente, COUNT(v.ventas_id) AS cantidad_ventas
FROM Clientes cl
LEFT JOIN Ventas v ON cl.clientes_id = v.clientes_id
GROUP BY cl.nombre;

SELECT t.nombre AS tienda, SUM(v.total) AS total_vendido
FROM Ventas v
JOIN Detalle_Ventas dv ON v.ventas_id = dv.ventas_id
JOIN Productos p ON dv.productos_id = p.productos_id
JOIN Inventarios i ON p.productos_id = i.productos_id
JOIN Tiendas t ON i.tiendas_id = t.tienda_id
GROUP BY t.nombre;


SELECT DATE_TRUNC('month', fecha_venta) AS periodo, SUM(total) AS total_vendido
FROM Ventas
WHERE fecha_venta BETWEEN '2026-07-01' AND '2026-07-31'
GROUP BY periodo;


SELECT c.nombre AS categoria, AVG(p.precio_venta) AS precio_promedio
FROM Productos p
JOIN Categoria c ON p.categorias_id = c.categoria_id
GROUP BY c.nombre;


SELECT pr.nombre_empresa AS proveedor, SUM(co.total) AS total_comprado
FROM Compras co
JOIN Proveedores pr ON co.proveedores_id = pr.proveedores_id
GROUP BY pr.nombre_empresa;


SELECT p.nombre AS producto, SUM(dv.cantidad) AS cantidad_vendida
FROM Detalle_Ventas dv
JOIN Productos p ON dv.productos_id = p.productos_id
GROUP BY p.nombre
ORDER BY cantidad_vendida DESC;
