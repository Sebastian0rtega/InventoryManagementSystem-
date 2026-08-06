import sequelize from "../config/db";
import { Usuario } from "./usuario";
import { Rol } from "./rol";
import { Tienda } from "./tienda";
import { Categoria } from "./categoria";
import { Cliente } from "./cliente";
import { Producto } from "./producto";

// Asociaciones
Usuario.belongsTo(Rol, { foreignKey: "rol_id", as: "rol" });
Usuario.belongsTo(Tienda, { foreignKey: "tienda_id", as: "tienda" });
Producto.belongsTo(Categoria, { foreignKey: "categoria_id", as: "categoria" });

export const models = {
  Usuario,
  Rol,
  Tienda,
  Categoria,
  Cliente,
  Producto,
};

export { sequelize, Usuario, Rol, Tienda, Categoria, Cliente, Producto };
export type { UsuarioAttributes } from "./usuario";
