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
  "compra_id" | "fecha_compra" | "total" | "created_at" | "updated_at"
>;

export class Compra
  extends Model<CompraAttributes, Creation>
  implements CompraAttributes
{
  public compra_id!: number;
  public proveedor_id!: number;
  public tienda_id!: number;
  public usuario_id!: number;
  public tipo_documento!: string;
  public numero_documento!: string;
  public fecha_compra!: Date;
  public total!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly proveedor?: Proveedor;
  public readonly tienda?: Tienda;
  public readonly usuario?: Usuario;
  public readonly detalles?: DetalleCompra[];
}

Compra.init(
  {
    compra_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
    tienda_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_documento: { type: DataTypes.STRING(20), allowNull: false },
    numero_documento: { type: DataTypes.STRING(50), allowNull: false },
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
