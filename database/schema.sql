
-- TABLAS PRINCIPALES

CREATE TABLE roles (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL  
);
CREATE TABLE tiendas (
    tienda_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    direccion VARCHAR(150) NOT NULL
);
CREATE TABLE categorias (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL 
);
CREATE TABLE clientes (
    cliente_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100)NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    razon_social VARCHAR(100) NOT NULL,
    nombre_empresa VARCHAR(100) NOT NULL,
    rut_empresa VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    direccion VARCHAR(150)
);
CREATE TABLE productos (
    producto_id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(categoria_id) ,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nombre VARCHAR(100) NOT NULL,
    precio_venta NUMERIC(10,2)NOT NULL check(precio_venta > 0),
    precio_compra NUMERIC(10,2) NOT NULL check(precio_compra > 0)
);

CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    rol_id INT NOT NULL REFERENCES roles(rol_id) ,
    tienda_id INT NOT NULL REFERENCES tiendas(tienda_id) ,
    email VARCHAR(100) NOT NULL UNIQUE ,
    nombre VARCHAR(100)NOT NULL,
    password_hash VARCHAR(100) NOT NULL --en Semana 2 se almacenarán hashes.

);
CREATE TABLE inventarios (
    inventario_id SERIAL PRIMARY KEY ,
    tienda_id INT NOT NULL REFERENCES tiendas(tienda_id)  ,
    producto_id INT NOT NULL REFERENCES productos(producto_id),
    stock_actual INT  NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    localizacion VARCHAR(100),
    stock_minimo INT  NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    UNIQUE(tienda_id,producto_id)
);
CREATE TABLE ventas (
    venta_id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(cliente_id) ,
    tienda_id INT NOT NULL REFERENCES tiendas(tienda_id) ,
    fecha_venta DATE,
    total NUMERIC(10,2) check(total > 0),
    metodo_pago VARCHAR(50),
    numero_documento INT UNIQUE,
    tipo_documento TEXT
);
CREATE TABLE compras (
    compra_id SERIAL PRIMARY KEY,
    proveedor_id INT NOT NULL REFERENCES proveedores(proveedor_id) ,
    tienda_id INT NOT NULL REFERENCES tiendas(tienda_id) ,
    fecha_compra DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL check(total > 0),
    metodo_pago VARCHAR(50),
    numero_documento INT UNIQUE,
    tipo_documento TEXT
);
CREATE TABLE detalle_ventas (
    detalle_venta_id SERIAL PRIMARY KEY,
    producto_id INT  NOT NULL REFERENCES productos(producto_id),
    venta_id INT NOT NULL REFERENCES ventas(venta_id) ,
    cantidad INT CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) check(precio_unitario > 0),
    subtotal NUMERIC(10,2) check(subtotal > 0)
);
CREATE TABLE detalle_compras (
    detalle_compra_id SERIAL PRIMARY KEY,
    compra_id INT NOT NULL REFERENCES compras(compra_id) ,
    producto_id INT NOT NULL REFERENCES productos(producto_id) ,
    cantidad INT NOT NULL check(cantidad > 0),
    numero_boleta VARCHAR(50) UNIQUE,
    precio_unitario NUMERIC(10,2) NOT NULL check(precio_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK(subtotal > 0)
);

CREATE TABLE movimientos_inventarios (
    movimiento_inventario_id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(producto_id),
    inventario_id INT NOT NULL REFERENCES inventarios(inventario_id) ,
    tipo_movimiento VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL check(cantidad > 0),
    fecha_movimiento DATE NOT NULL,
    motivo TEXT
);