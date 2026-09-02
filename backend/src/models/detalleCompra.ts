import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Compra } from "./compra";
import type { Producto } from "./producto";

export interface DetalleCompraAttributes {
  detalle_compra_id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  precio_compra: string;
  subtotal: string;
  created_at: Date;
  updated_at: Date;
  compra?: Compra;
  producto?: Producto;
}

type Creation = Optional<
  DetalleCompraAttributes,
  "detalle_compra_id" | "created_at" | "updated_at"
>;

export class DetalleCompra
  extends Model<DetalleCompraAttributes, Creation>
  implements DetalleCompraAttributes
{
  public detalle_compra_id!: number;
  public compra_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  public precio_compra!: string;
  public subtotal!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly compra?: Compra;
  public readonly producto?: Producto;
}

DetalleCompra.init(
  {
    detalle_compra_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    compra_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    precio_compra: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "detalle_compras",
    underscored: true,
    timestamps: false,
    modelName: "DetalleCompra",
  },
);
