-- SEED--


INSERT INTO Roles (nombre_rol) VALUES
('Administrador'),
('Vendedor'),
('Bodeguero');


INSERT INTO Usuarios (roles_id, email, nombre, password) VALUES
(1, 'admin@tienda.com', 'Carlos Admin', 'demo123'),
(2, 'vendedor@tienda.com', 'Lucía Vendedor', 'demo123'),
(3, 'bodega@tienda.com', 'Pedro Bodega', 'demo123');


INSERT INTO Tiendas (usuarios_id, nombre, direccion) VALUES
(1, 'Tienda Central', 'Av. Principal 123'),
(2, 'Sucursal Norte', 'Calle Norte 456');


INSERT INTO Clientes (nombre, rut, telefono, email) VALUES
('Juan Pérez', '11111111-1', '912345678', 'juanperez@mail.com'),
('María López', '22222222-2', '987654321', 'marialopez@mail.com');


INSERT INTO Categoria (nombre) VALUES
('Electrónica'),
('Alimentos'),
('Ropa');

INSERT INTO Productos (categorias_id, codigo_barras, sku, descripcion, nombre, precio_venta, stock_minimo, stock_actual, precio_compra)
VALUES
(1, '1234567890123', 'ELEC001', 'Smartphone gama media', 'Smartphone X', 250000, 5, 20, 180000),
(2, '9876543210987', 'FOOD001', 'Caja de cereales', 'Cereal Crunch', 3500, 10, 50, 2000),
(3, '4567891234567', 'CLOT001', 'Polera algodón', 'Polera Blanca', 8000, 15, 100, 5000);


INSERT INTO Inventarios (tiendas_id, productos_id, stock_productos, localizacion, stock_minimo) VALUES
(1, 1, 20, 'Bodega Central', 5),
(1, 2, 50, 'Estante A1', 10),
(2, 3, 100, 'Sucursal Norte - Rack 3', 15);


INSERT INTO Proveedores (razon_social, nombre_empresa, rut_empresa, telefono, email, direccion) VALUES
('Proveedor Electrónica', 'ElectroChile', '33333333-3', '912345678', 'contacto@electrochile.com', 'Av. Tecnológica 789'),
('Proveedor Alimentos', 'FoodCorp', '44444444-4', '987654321', 'ventas@foodcorp.com', 'Calle Industrial 321'),
('Proveedor Ropa', 'Moda SA', '55555555-5', '934567890', 'info@modasa.com', 'Av. Moda 654');


INSERT INTO Compras (proveedores_id, productos_id, fecha_compra, total) VALUES
(1, 1, '2026-07-01', 900000),
(2, 2, '2026-07-02', 100000),
(3, 3, '2026-07-03', 500000);

INSERT INTO Detalle_Compras (compras_id, cantidad, sku, numero_boleta, precio_unitario, subtotal, costo, metodo_pago) VALUES
(1, 5, 'ELEC001', 'BOL001', 180000, 900000, 900000, 'Transferencia'),
(2, 50, 'FOOD001', 'BOL002', 2000, 100000, 100000, 'Efectivo'),
(3, 100, 'CLOT001', 'BOL003', 5000, 500000, 500000, 'Crédito');


INSERT INTO Ventas (clientes_id, productos_id, fecha_venta, total) VALUES
(1, 1, '2026-07-05', 250000),
(2, 2, '2026-07-06', 7000),
(1, 3, '2026-07-07', 16000);


INSERT INTO Detalle_Ventas (productos_id, ventas_id, numero_boleta, sku, cantidad, precio_unitario, metodo_pago, precio_total) VALUES
(1, 1, 'VENT001', 'ELEC001', 1, 250000, 'Crédito', 250000),
(2, 2, 'VENT002', 'FOOD001', 2, 3500, 'Efectivo', 7000),
(3, 3, 'VENT003', 'CLOT001', 2, 8000, 'Débito', 16000);


INSERT INTO Movimientos_Inventario (productos_id, tipo_movimiento, cantidad, fecha_movimiento, motivo) VALUES
(1, 'Entrada', 5, '2026-07-01', 'Compra proveedor ElectroChile'),
(2, 'Entrada', 50, '2026-07-02', 'Compra proveedor FoodCorp'),
(3, 'Entrada', 100, '2026-07-03', 'Compra proveedor Moda SA'),
(1, 'Salida', 1, '2026-07-05', 'Venta a cliente Juan Pérez'),
(2, 'Salida', 2, '2026-07-06', 'Venta a cliente María López'),
(3, 'Salida', 2, '2026-07-07', 'Venta a cliente Juan Pérez');
