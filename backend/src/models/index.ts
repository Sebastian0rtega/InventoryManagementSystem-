import sequelize from "../config/db";
import { Usuario } from "./usuario";
import { Rol } from "./rol";
import { Tienda } from "./tienda";
import { Categoria } from "./categoria";
import { Cliente } from "./cliente";
import { Producto } from "./producto";
import { Proveedor } from "./proveedor";
import { Inventario } from "./inventario";
import { Compra } from "./compra";
import { DetalleCompra } from "./detalleCompra";
import { Venta } from "./venta";
import { DetalleVenta } from "./detalleVenta";
import { MovimientoInventario } from "./movimientoInventario";

// Helper: solo crea la asociación si no existe (evita asociaciones duplicadas
// si este módulo se importa más de una vez).
const assocRegistry = ((globalThis as Record<string, unknown>).__assocRegistry ??=
  new Set<string>()) as Set<string>;
function once(key: string, fn: () => void) {
  if (assocRegistry.has(key)) return;
  assocRegistry.add(key);
  fn();
}

// Usuario / Rol / Tienda / Categoria
once("Usuario.belongsTo:rol", () =>
  Usuario.belongsTo(Rol, { foreignKey: "rol_id", as: "rol" }));
once("Usuario.belongsTo:tienda", () =>
  Usuario.belongsTo(Tienda, { foreignKey: "tienda_id", as: "tienda" }));
once("Producto.belongsTo:categoria", () =>
  Producto.belongsTo(Categoria, { foreignKey: "categoria_id", as: "categoria" }));

// Inventario
once("Inventario.belongsTo:tienda", () =>
  Inventario.belongsTo(Tienda, { foreignKey: "tienda_id", as: "tienda" }));
once("Inventario.belongsTo:producto", () =>
  Inventario.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" }));
once("Inventario.hasMany:movimientos", () =>
  Inventario.hasMany(MovimientoInventario, { foreignKey: "inventario_id", as: "movimientos" }));
once("Movimiento.belongsTo:inventario", () =>
  MovimientoInventario.belongsTo(Inventario, { foreignKey: "inventario_id", as: "inventario" }));

// Compras (cabecera/detalle)
once("Compra.belongsTo:proveedor", () =>
  Compra.belongsTo(Proveedor, { foreignKey: "proveedor_id", as: "proveedor" }));
once("Compra.belongsTo:tienda", () =>
  Compra.belongsTo(Tienda, { foreignKey: "tienda_id", as: "tienda" }));
once("Compra.belongsTo:usuario", () =>
  Compra.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" }));
once("Compra.hasMany:detalles", () =>
  Compra.hasMany(DetalleCompra, { foreignKey: "compra_id", as: "detalles" }));
once("DetalleCompra.belongsTo:compra", () =>
  DetalleCompra.belongsTo(Compra, { foreignKey: "compra_id", as: "compra" }));
once("DetalleCompra.belongsTo:producto", () =>
  DetalleCompra.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" }));

// Ventas (cabecera/detalle)
once("Venta.belongsTo:cliente", () =>
  Venta.belongsTo(Cliente, { foreignKey: "cliente_id", as: "cliente" }));
once("Venta.belongsTo:tienda", () =>
  Venta.belongsTo(Tienda, { foreignKey: "tienda_id", as: "tienda" }));
once("Venta.belongsTo:usuario", () =>
  Venta.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" }));
once("Venta.hasMany:detalles", () =>
  Venta.hasMany(DetalleVenta, { foreignKey: "venta_id", as: "detalles" }));
once("DetalleVenta.belongsTo:venta", () =>
  DetalleVenta.belongsTo(Venta, { foreignKey: "venta_id", as: "venta" }));
once("DetalleVenta.belongsTo:producto", () =>
  DetalleVenta.belongsTo(Producto, { foreignKey: "producto_id", as: "producto" }));

export const models = {
  Usuario,
  Rol,
  Tienda,
  Categoria,
  Cliente,
  Producto,
  Proveedor,
  Inventario,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  MovimientoInventario,
};

export {
  sequelize,
  Usuario,
  Rol,
  Tienda,
  Categoria,
  Cliente,
  Producto,
  Proveedor,
  Inventario,
  Compra,
  DetalleCompra,
  Venta,
  DetalleVenta,
  MovimientoInventario,
};
export type { UsuarioAttributes } from "./usuario";
export type { ProductoAttributes } from "./producto";
