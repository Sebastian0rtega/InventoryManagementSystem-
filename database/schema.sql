--tablas--

CREATE TABLE categoria (
    categoria_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50)
);

CREATE TABLE proveedores (
    proveedores_id SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    rut_empresa VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(150)
);

CREATE TABLE producto (
    productos_id SERIAL PRIMARY KEY,
    proveedores_id INT REFERENCES proveedores(proveedores_id),
    categorias_id INT REFERENCES categoria(categoria_id),
    nombre VARCHAR(100) NOT NULL,
    precio_venta NUMERIC(10,2),
    stock_total INT,
    stock_actual INT,
    precio_compra NUMERIC(10,2)
);

CREATE TABLE tiendas (
    tienda_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    direccion VARCHAR(150)
);

CREATE TABLE roles (
    roles_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50)
);

CREATE TABLE usuarios (
    usuarios_id SERIAL PRIMARY KEY,
    roles_id INT REFERENCES roles(roles_id),
    tiendas_id INT REFERENCES tiendas(tienda_id),
    nombre_usuario VARCHAR(50),
    contraseña_usuario VARCHAR(100)
);

CREATE TABLE clientes (
    clientes_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    rut VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE venta (
    ventas_id SERIAL PRIMARY KEY,
    clientes_id INT REFERENCES clientes(clientes_id),
    tiendas_id INT REFERENCES tiendas(tienda_id),
    fecha_venta DATE,
    total NUMERIC(10,2)
);

CREATE TABLE detalle_ventas (
    detalle_ventas_id SERIAL PRIMARY KEY,
    ventas_id INT REFERENCES venta(ventas_id),
    cantidad INT,
    precio_unitario NUMERIC(10,2)
);

CREATE TABLE compra (
    compras_id SERIAL PRIMARY KEY,
    tiendas_id INT REFERENCES tiendas(tienda_id),
    fecha_compra DATE,
    total NUMERIC(10,2)
);

CREATE TABLE detalle_compra (
    detalle_compra_id SERIAL PRIMARY KEY,
    compras_id INT REFERENCES compra(compras_id),
    cantidad INT,
    precio_unitario NUMERIC(10,2)
);

CREATE TABLE movimientos_inventario (
    movimientos_inventario_id SERIAL PRIMARY KEY,
    tiendas_id INT REFERENCES tiendas(tienda_id),
    tipo_movimiento VARCHAR(50),
    cantidad INT,
    fecha_movimiento DATE,
    descripcion TEXT
);
