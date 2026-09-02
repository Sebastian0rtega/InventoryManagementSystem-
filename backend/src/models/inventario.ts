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
  created_at: Date;
  updated_at: Date;
  tienda?: Tienda;
  producto?: Producto;
  movimientos?: MovimientoInventario[];
}

type Creation = Optional<
  InventarioAttributes,
  "inventario_id" | "cantidad" | "created_at" | "updated_at"
>;

export class Inventario
  extends Model<InventarioAttributes, Creation>
  implements InventarioAttributes
{
  public inventario_id!: number;
  public tienda_id!: number;
  public producto_id!: number;
  public cantidad!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly tienda?: Tienda;
  public readonly producto?: Producto;
  public readonly movimientos?: MovimientoInventario[];
}

Inventario.init(
  {
    inventario_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tienda_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
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
