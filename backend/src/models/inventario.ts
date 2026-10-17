import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Tienda } from "./tienda";
import type { Producto } from "./producto";
import type { MovimientoInventario } from "./movimientoInventario";

export interface InventarioAttributes {
  inventario_id: number;
  tienda_id: number;
  producto_id: number;
  cantidad: number;
  stock_minimo: number;
  created_at: Date;
  updated_at: Date;
  tienda?: Tienda;
  producto?: Producto;
  movimientos?: MovimientoInventario[];
}

type Creation = Optional<
  InventarioAttributes,
  "inventario_id" | "cantidad" | "stock_minimo" | "created_at" | "updated_at"
>;

export class Inventario
  extends Model<InventarioAttributes, Creation>
  implements InventarioAttributes
{
  declare inventario_id: number;
  declare tienda_id: number;
  declare producto_id: number;
  declare cantidad: number;
  declare stock_minimo: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare readonly tienda?: Tienda;
  declare readonly producto?: Producto;
  declare readonly movimientos?: MovimientoInventario[];
}

Inventario.init(
  {
    inventario_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tienda_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "inventarios",
    underscored: true,
    timestamps: false,
    modelName: "Inventario",
  },
);
