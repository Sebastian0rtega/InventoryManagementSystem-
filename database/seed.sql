--Datos de prueba--
INSERT INTO categoria (nombre, tipo) VALUES
('Electrónica', 'Tecnología'),
('Alimentos', 'Consumo'),
('Ropa', 'Vestimenta'),
('Limpieza', 'Hogar');


INSERT INTO proveedores (nombre_empresa, rut_empresa, telefono, email, direccion) VALUES
('TechCorp', '12345678-9', '987654321', 'contacto@techcorp.com', 'Av. Central 123'),
('FoodPlus', '98765432-1', '912345678', 'ventas@foodplus.com', 'Calle Norte 45'),
('CleanHouse', '55555555-5', '934567890', 'info@cleanhouse.cl', 'Camino Sur 88');


INSERT INTO tiendas (nombre, direccion) VALUES
('Tienda Central', 'Av. Libertad 100'),
('Sucursal Norte', 'Calle Norte 200');


INSERT INTO roles (nombre_rol) VALUES
('Administrador'),
('Vendedor'),
('Bodeguero');


INSERT INTO usuarios (roles_id, tiendas_id, nombre_usuario, contraseña_usuario) VALUES
(1, 1, 'admin', 'admin123'),
(2, 2, 'vendedor1', 'venta2024'),
(3, 1, 'bodega1', 'stock2024');


INSERT INTO clientes (nombre, rut, telefono, email) VALUES
('Juan Pérez', '11111111-1', '987654321', 'juanperez@mail.com'),
('María López', '22222222-2', '912345678', 'marialopez@mail.com'),
('Carlos Díaz', '33333333-3', '923456789', 'carlosdiaz@mail.com');

INSERT INTO producto (proveedores_id, categorias_id, nombre, precio_venta, stock_total, stock_actual, precio_compra) VALUES
(1, 1, 'Laptop Lenovo', 750000, 20, 15, 600000),
(1, 1, 'Mouse inalámbrico', 15000, 50, 45, 10000),
(2, 2, 'Cereal Integral', 3500, 100, 80, 2500),
(3, 4, 'Detergente líquido', 5500, 60, 55, 4000);


INSERT INTO compra (tiendas_id, fecha_compra, total) VALUES
(1, '2026-07-01', 500000),
(2, '2026-07-02', 300000);


INSERT INTO detalle_compra (compras_id, cantidad, precio_unitario) VALUES
(1, 10, 50000),
(2, 5, 60000);


INSERT INTO venta (clientes_id, tiendas_id, fecha_venta, total) VALUES
(1, 1, '2026-07-05', 150000),
(2, 2, '2026-07-06', 200000),
(3, 1, '2026-07-07', 750000);


INSERT INTO detalle_ventas (ventas_id, cantidad, precio_unitario) VALUES
(1, 3, 50000),
(2, 4, 50000),
(3, 1, 750000);

INSERT INTO movimientos_inventario (tiendas_id, tipo_movimiento, cantidad, fecha_movimiento, descripcion) VALUES
(1, 'Entrada', 10, '2026-07-01', 'Compra inicial de laptops'),
(2, 'Salida', 4, '2026-07-06', 'Venta de mouse'),
(1, 'Salida', 1, '2026-07-07', 'Venta de laptop Lenovo');
