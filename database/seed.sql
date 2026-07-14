
-- SEED--

INSERT INTO roles (nombre_rol)
VALUES
('Administrador'),
('Vendedor'),
('Bodeguero');

INSERT INTO tiendas (nombre, direccion)
VALUES
('Casa Matriz', 'Av. Libertad 123'),
('Sucursal Norte', 'Av. Norte 456');

INSERT INTO categorias (nombre)
VALUES
('Lácteos'),
('Bebidas'),
('Abarrotes'),
('Limpieza');

INSERT INTO clientes
(nombre,rut,telefono,email)
VALUES
('Juan Pérez','11111111-1','987654321','juan@email.com'),
('María González','22222222-2','912345678','maria@email.com'),
('Pedro Soto','33333333-3','923456789','pedro@email.com');

INSERT INTO proveedores
(razon_social,nombre_empresa,rut_empresa,telefono,email,direccion)
VALUES
('Distribuidora Sur','Distribuidora Sur SPA','76111111-1','22334455','contacto@distsur.cl','Valparaíso'),
('Alimentos Chile','Alimentos Chile Ltda','76222222-2','22445566','ventas@alimentos.cl','Santiago');

INSERT INTO productos
(categoria_id,codigo_barras,sku,descripcion,nombre,precio_venta,precio_compra)
VALUES
(1,'780100000001','LEC001','Leche Entera 1L','Leche Soprole',1200,850),
(1,'780100000002','QUE001','Queso Gauda','Queso Gauda',4500,3500),
(2,'780100000003','BEB001','Bebida Cola 1.5L','Coca Cola',2200,1500),
(2,'780100000004','JUG001','Jugo Naranja','Watts Naranja',1800,1200),
(3,'780100000005','ARR001','Arroz Grado 1','Arroz Tucapel',1700,1200),
(4,'780100000006','DET001','Detergente Líquido','Omo 3L',8500,6500);

INSERT INTO usuarios
(rol_id,tienda_id,email,nombre,password)
VALUES
(1,1,'admin@empresa.cl','Administrador','admin123'),
(2,1,'vendedor@empresa.cl','Carlos Díaz','venta123'),
(3,2,'bodega@empresa.cl','Ana Torres','bodega123');

INSERT INTO inventarios
(tienda_id,producto_id,stock_actual,localizacion,stock_minimo)
VALUES
(1,1,80,'A-01',20),
(2,2,40,'A-02',10);

INSERT INTO compras
(proveedor_id,tienda_id,fecha_compra,total,metodo_pago,numero_documento,tipo_documento)
VALUES
(1,1,'2026-07-01',250000,'Transferencia',1001,'Factura'),
(2,2,'2026-07-05',180000,'Transferencia',1002,'Factura');

INSERT INTO detalle_compras
(compra_id,producto_id,cantidad,numero_boleta,precio_unitario,subtotal)
VALUES
(1,1,100,'FC-1001',850,85000),
(1,3,80,'FC-1002',1500,120000),
(2,2,40,'FC-1003',3500,140000),
(2,6,20,'FC-1004',6500,130000);

INSERT INTO ventas
(cliente_id,tienda_id,fecha_venta,total,metodo_pago,numero_documento,tipo_documento)
VALUES
(1,1,'2026-07-08',9600,'Débito',5001,'Boleta'),
(2,1,'2026-07-09',6700,'Efectivo',5002,'Boleta'),
(3,2,'2026-07-10',15700,'Crédito',5003,'Factura');

INSERT INTO detalle_ventas
(producto_id,venta_id,cantidad,precio_unitario,subtotal)
VALUES
(1,1,3,1200,3600),
(3,1,2,2200,4400),
(5,1,1,1600,1600),

(2,2,1,4500,4500),
(4,2,1,1800,1800),

(6,3,1,8500,8500),
(3,3,2,2200,4400),
(1,3,2,1200,2400);

INSERT INTO movimientos_inventarios
(inventario_id,producto_id,tipo_movimiento,cantidad,fecha_movimiento,motivo)
VALUES
(1,1,'ENTRADA',100,'2026-07-01','Compra proveedor'),
(1,1,'SALIDA',3,'2026-07-08','Venta'),

(2,2,'ENTRADA',40,'2026-07-05','Compra proveedor'),
(2,2,'SALIDA',1,'2026-07-09','Venta');