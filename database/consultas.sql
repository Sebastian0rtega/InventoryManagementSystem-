-- CONSULTAS SQL

-- 1. Productos con su categoría y proveedor
SELECT
    p.producto_id,
    p.nombre AS producto,
    c.nombre AS categoria,
    pr.nombre_empresa AS proveedor
FROM productos p
JOIN categorias c
    ON p.categoria_id = c.categoria_id
JOIN detalle_compras dc
    ON p.producto_id = dc.producto_id
JOIN compras co
    ON dc.compra_id = co.compra_id
JOIN proveedores pr
    ON co.proveedor_id = pr.proveedor_id;

-- 2. Categorías sin productos
SELECT
    c.categoria_id,
    c.nombre
FROM categorias c
LEFT JOIN productos p
    ON c.categoria_id = p.categoria_id
WHERE p.producto_id IS NULL;

-- 3. Clientes sin ventas
SELECT
    c.cliente_id,
    c.nombre
FROM clientes c
LEFT JOIN ventas v
    ON c.cliente_id = v.cliente_id
WHERE v.venta_id IS NULL;

-- 4.Productos con stock bajo
SELECT
    p.nombre,
    i.stock_actual,
    i.stock_minimo
FROM inventarios i
JOIN productos p
    ON i.producto_id = p.producto_id
WHERE i.stock_actual <= i.stock_minimo;

-- 5.Cantidad de ventas por cliente
SELECT
    c.nombre,
    COUNT(v.venta_id) AS cantidad_ventas
FROM clientes c
JOIN ventas v
    ON c.cliente_id = v.cliente_id
GROUP BY c.nombre
ORDER BY cantidad_ventas DESC;

-- 6.Total vendido por tienda
SELECT
    t.nombre,
    SUM(v.total) AS total_vendido
FROM tiendas t
JOIN ventas v
    ON t.tienda_id = v.tienda_id
GROUP BY t.nombre
ORDER BY total_vendido DESC;

-- 7. Total vendido por período
SELECT
    fecha_venta,
    SUM(total) AS total_vendido
FROM ventas
GROUP BY fecha_venta
ORDER BY fecha_venta;

--8. Precio promedio por categoría
SELECT
    c.nombre,
    ROUND(AVG(p.precio_venta),2) AS precio_promedio
FROM categorias c
JOIN productos p
    ON c.categoria_id = p.categoria_id
GROUP BY c.nombre
ORDER BY precio_promedio DESC;

-- 9. Compras por proveedor
SELECT
    pr.nombre_empresa,
    SUM(co.total) AS total_comprado
FROM proveedores pr
JOIN compras co
    ON pr.proveedor_id = co.proveedor_id
GROUP BY pr.nombre_empresa
ORDER BY total_comprado DESC;

-- 10. Productos vendidos
SELECT
    p.nombre,
    SUM(dv.cantidad) AS unidades_vendidas
FROM productos p
JOIN detalle_ventas dv
    ON p.producto_id = dv.producto_id
GROUP BY p.nombre
ORDER BY unidades_vendidas DESC;