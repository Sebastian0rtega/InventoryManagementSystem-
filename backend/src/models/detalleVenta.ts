import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Venta } from "./venta";
import type { Producto } from "./producto";

export interface DetalleVentaAttributes {
  detalle_venta_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_venta: string;
  subtotal: string;
  created_at: Date;
  updated_at: Date;
  venta?: Venta;
  producto?: Producto;
}

type Creation = Optional<
  DetalleVentaAttributes,
  "detalle_venta_id" | "created_at" | "updated_at"
>;

export class DetalleVenta
  extends Model<DetalleVentaAttributes, Creation>
  implements DetalleVentaAttributes
{
  public detalle_venta_id!: number;
  public venta_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  public precio_venta!: string;
  public subtotal!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly venta?: Venta;
  public readonly producto?: Producto;
}

DetalleVenta.init(
  {
    detalle_venta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    venta_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    precio_venta: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "detalle_ventas",
    underscored: true,
    timestamps: false,
    modelName: "DetalleVenta",
  },
);
