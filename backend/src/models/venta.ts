import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Cliente } from "./cliente";
import type { Tienda } from "./tienda";
import type { Usuario } from "./usuario";
import type { DetalleVenta } from "./detalleVenta";

export interface VentaAttributes {
  venta_id: number;
  cliente_id: number | null;
  tienda_id: number;
  usuario_id: number;
  fecha_venta: Date;
  total: string;
  created_at: Date;
  updated_at: Date;
  cliente?: Cliente;
  tienda?: Tienda;
  usuario?: Usuario;
  detalles?: DetalleVenta[];
}

type Creation = Optional<
  VentaAttributes,
  "venta_id" | "cliente_id" | "fecha_venta" | "total" | "created_at" | "updated_at"
>;

export class Venta
  extends Model<VentaAttributes, Creation>
  implements VentaAttributes
{
  public venta_id!: number;
  public cliente_id!: number | null;
  public tienda_id!: number;
  public usuario_id!: number;
  public fecha_venta!: Date;
  public total!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly cliente?: Cliente;
  public readonly tienda?: Tienda;
  public readonly usuario?: Usuario;
  public readonly detalles?: DetalleVenta[];
}

Venta.init(
  {
    venta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cliente_id: { type: DataTypes.INTEGER, allowNull: true },
    tienda_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    fecha_venta: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "ventas",
    underscored: true,
    timestamps: false,
    modelName: "Venta",
  },
);
