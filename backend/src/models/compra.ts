import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Tienda } from "./tienda";
import type { Producto } from "./producto";
import type { Usuario } from "./usuario";
import type { Proveedor } from "./proveedor";
import type { DetalleCompra } from "./detalleCompra";

export interface CompraAttributes {
  compra_id: number;
  proveedor_id: number;
  tienda_id: number;
  usuario_id: number;
  tipo_documento: string;
  numero_documento: string;
  metodo_pago: string;
  fecha_compra: Date;
  total: string;
  created_at: Date;
  updated_at: Date;
  proveedor?: Proveedor;
  tienda?: Tienda;
  usuario?: Usuario;
  detalles?: DetalleCompra[];
}

type Creation = Optional<
  CompraAttributes,
  "compra_id" | "metodo_pago" | "fecha_compra" | "total" | "created_at" | "updated_at"
>;

export class Compra
  extends Model<CompraAttributes, Creation>
  implements CompraAttributes
{
  declare compra_id: number;
  declare proveedor_id: number;
  declare tienda_id: number;
  declare usuario_id: number;
  declare tipo_documento: string;
  declare numero_documento: string;
  declare metodo_pago: string;
  declare fecha_compra: Date;
  declare total: string;
  declare created_at: Date;
  declare updated_at: Date;
  declare readonly proveedor?: Proveedor;
  declare readonly tienda?: Tienda;
  declare readonly usuario?: Usuario;
  declare readonly detalles?: DetalleCompra[];
}

Compra.init(
  {
    compra_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
    tienda_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_documento: { type: DataTypes.STRING(20), allowNull: false },
    numero_documento: { type: DataTypes.STRING(50), allowNull: false },
    metodo_pago: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "OTRO" },
    fecha_compra: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "compras",
    underscored: true,
    timestamps: false,
    modelName: "Compra",
  },
);
