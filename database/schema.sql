-- =========================
-- TABLAS PRINCIPALES
-- =========================

CREATE TABLE Roles (
    roles_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL  
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
    direccion VARCHAR(150) NOT NULL
);

CREATE TABLE Clientes (
    clientes_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100)NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE inventarios (
    inventarios_id SERIAL PRIMARY KEY,
    tiendas_id INT REFERENCES tiendas(tienda_id),
    productos_id INT REFERENCES productos(productos_id),
    stock_productos INT CHECK (stock_productos >= 0),
    localizacion VARCHAR(100),
    stock_minimo INT CHECK (stock_minimo >= 0)
);


CREATE TABLE Categoria (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL 
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

CREATE TABLE ventas (
    ventas_id SERIAL PRIMARY KEY,
    clientes_id INT REFERENCES clientes(clientes_id),
    productos_id INT REFERENCES productos(productos_id),
    fecha_venta DATE,
    total NUMERIC(10,2)
);


CREATE TABLE detalle_ventas (
    detalle_ventas_id SERIAL PRIMARY KEY,
    productos_id INT REFERENCES productos(productos_id),
    ventas_id INT REFERENCES ventas(ventas_id),
    numero_boleta VARCHAR(50) UNIQUE,
    sku VARCHAR(50) UNIQUE,
    cantidad INT CHECK (cantidad >= 0),
    precio_unitario NUMERIC(10,2),
    metodo_pago VARCHAR(50),
    precio_total NUMERIC(10,2)
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
    total NUMERIC(10,2) NOT NULL check(total >= 0)
);

CREATE TABLE Detalle_Compras (
    detalle_compra_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES Compras(compras_id),
    cantidad INT NOT NULL check(cantidad >= 0),
    sku VARCHAR(50) UNIQUE,
    numero_boleta VARCHAR(50) UNIQUE,
    precio_unitario NUMERIC(10,2) NOT NULL check(precio_unitario >= 0),
    subtotal NUMERIC(10,2) NOT NULL check(precio_total >= 0),
    costo NUMERIC(10,2),
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
