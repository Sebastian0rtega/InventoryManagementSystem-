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
    email VARCHAR(100) NOT NULL,
    nombre VARCHAR(100),
    password VARCHAR(100)
);

CREATE TABLE Tiendas (
    tienda_id SERIAL PRIMARY KEY,
    usuarios_id INT REFERENCES Usuarios(usuarios_id),
    nombre VARCHAR(100),
    direccion VARCHAR(150)
);

CREATE TABLE Clientes (
    clientes_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    rut VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Inventarios (
    inventarios_id SERIAL PRIMARY KEY,
    tiendas_id INT REFERENCES Tiendas(tienda_id),
    stock_productos INT,
    localizacion VARCHAR(100),
    stock_minimo INT
);

CREATE TABLE Categoria (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Productos (
    productos_id SERIAL PRIMARY KEY,
    inventarios_id INT REFERENCES Inventarios(inventarios_id),
    categorias_id INT REFERENCES Categoria(categoria_id),
    codigo_barras VARCHAR(50),
    sku VARCHAR(50),
    descripcion TEXT,
    nombre VARCHAR(100),
    precio_venta NUMERIC(10,2),
    stock_minimo INT,
    stock_actual INT,
    precio_compra NUMERIC(10,2)
);

CREATE TABLE Ventas (
    ventas_id SERIAL PRIMARY KEY,
    clientes_id INT REFERENCES Clientes(clientes_id),
    tiendas_id INT REFERENCES Tiendas(tienda_id),
    numero_boleta VARCHAR(50),
    fecha_venta DATE,
    total NUMERIC(10,2),
    metodos_pago VARCHAR(50),
    impuestos NUMERIC(10,2),
    sub_total NUMERIC(10,2),
    descuento NUMERIC(10,2)
);

CREATE TABLE Detalle_Ventas (
    detalle_ventas_id SERIAL PRIMARY KEY,
    ventas_id INT REFERENCES Ventas(ventas_id),
    cantidad INT,
    precio_unitario NUMERIC(10,2),
    descuento_aplicado NUMERIC(10,2),
    precio_total NUMERIC(10,2)
);

CREATE TABLE Movimientos_Inventario (
    movimientos_inventario_id SERIAL PRIMARY KEY,
    productos_id INT REFERENCES Productos(productos_id),
    tipo_movimiento VARCHAR(50),
    cantidad INT,
    fecha_movimiento DATE,
    motivo TEXT
);

CREATE TABLE Compras (
    compras_id SERIAL PRIMARY KEY,
    productos_id INT REFERENCES Productos(productos_id),
    fecha_compra DATE,
    numero_factura VARCHAR(50),
    impuestos NUMERIC(10,2),
    total NUMERIC(10,2)
);

CREATE TABLE Detalle_Compras (
    detalle_compra_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES Compras(compras_id),
    cantidad INT,
    precio_unitario NUMERIC(10,2),
    precio_total NUMERIC(10,2),
    metodo_pago VARCHAR(50)
);

CREATE TABLE Proveedores (
    proveedores_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES Compras(compras_id),
    razon_social VARCHAR(100),
    nombre_empresa VARCHAR(100),
    rut_empresa VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(150)
);
