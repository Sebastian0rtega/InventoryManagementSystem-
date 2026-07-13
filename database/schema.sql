-- =========================
-- TABLAS PRINCIPALES
-- =========================

CREATE TABLE Roles (
    roles_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE 
);

CREATE TABLE Usuarios (
    usuarios_id SERIAL PRIMARY KEY,
    roles_id INT REFERENCES Roles(roles_id),
    email VARCHAR(100) NOT NULL UNIQUE ,
    nombre VARCHAR(100)NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE Tiendas (
    tienda_id SERIAL PRIMARY KEY,
    usuarios_id INT REFERENCES Usuarios(usuarios_id),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    direccion VARCHAR(150)
);

CREATE TABLE Clientes (
    clientes_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100)NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Inventarios (
    inventarios_id SERIAL PRIMARY KEY,
    tiendas_id INT REFERENCES Tiendas(tienda_id),
    stock_productos INT NOT NULL,
    localizacion VARCHAR(100),
    stock_minimo INT NOT NULL
);

CREATE TABLE Categoria (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE  
);

CREATE TABLE Productos (
    productos_id SERIAL PRIMARY KEY,
    inventarios_id INT REFERENCES Inventarios(inventarios_id),
    categorias_id INT REFERENCES Categoria(categoria_id),
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nombre VARCHAR(100) NOT NULL,
    precio_venta NUMERIC(10,2)NOT NULL check(precio_venta >= 0),
    stock_minimo INT NOT NULL check(stock_minimo >= 0),
    stock_actual INT NOT NULL check(stock_actual >= 0),
    precio_compra NUMERIC(10,2) NOT NULL check(precio_compra >= 0)
);

CREATE TABLE Ventas (
    ventas_id SERIAL PRIMARY KEY,
    clientes_id INT REFERENCES Clientes(clientes_id),
    tiendas_id INT REFERENCES Tiendas(tienda_id),
    numero_boleta VARCHAR(50) UNIQUE NOT NULL,
    fecha_venta DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL check(total >= 0),
    metodos_pago VARCHAR(50) NOT NULL,
    impuestos NUMERIC(10,2) NOT NULL check(impuestos >= 0),
    sub_total NUMERIC(10,2) NOT NULL check(sub_total >= 0),
    descuento NUMERIC(10,2) 
);

CREATE TABLE Detalle_Ventas (
    detalle_ventas_id SERIAL PRIMARY KEY,
    ventas_id INT REFERENCES Ventas(ventas_id),
    cantidad INT NOT NULL check(cantidad >= 0),
    precio_unitario NUMERIC(10,2) NOT NULL check(precio_unitario >= 0),
    descuento_aplicado NUMERIC(10,2) NOT NULL,
    precio_total NUMERIC(10,2) NOT NULL check(precio_total >= 0)
);

CREATE TABLE Movimientos_Inventario (
    movimientos_inventario_id SERIAL PRIMARY KEY,
    productos_id INT REFERENCES Productos(productos_id),
    tipo_movimiento VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL check(cantidad >= 0),
    fecha_movimiento DATE NOT NULL,
    motivo TEXT
);

CREATE TABLE Compras (
    compras_id SERIAL PRIMARY KEY,
    productos_id INT REFERENCES Productos(productos_id),
    fecha_compra DATE NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    impuestos NUMERIC(10,2) NOT NULL check(impuestos >= 0),
    total NUMERIC(10,2) NOT NULL check(total >= 0)
);

CREATE TABLE Detalle_Compras (
    detalle_compra_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES Compras(compras_id),
    cantidad INT NOT NULL check(cantidad >= 0),
    precio_unitario NUMERIC(10,2) NOT NULL check(precio_unitario >= 0),
    precio_total NUMERIC(10,2) NOT NULL check(precio_total >= 0),
    metodo_pago VARCHAR(50) NOT NULL
);

CREATE TABLE Proveedores (
    proveedores_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES Compras(compras_id),
    razon_social VARCHAR(100) NOT NULL,
    nombre_empresa VARCHAR(100) NOT NULL,
    rut_empresa VARCHAR(20) UNIQUENOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    direccion VARCHAR(150)
);
