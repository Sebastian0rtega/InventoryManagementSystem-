import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Categoria } from "./categoria";

export interface ProductoAttributes {
  producto_id: number;
  categoria_id: number;
  codigo_barras: string | null;
  sku: string;
  descripcion: string | null;
  nombre: string;
  precio_venta: number;
  precio_compra: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  categoria?: Categoria;
}

interface ProductoCreationAttributes
  extends Optional<
    ProductoAttributes,
    "producto_id" | "descripcion" | "activo" | "created_at" | "updated_at"
  > {}

export class Producto
  extends Model<ProductoAttributes, ProductoCreationAttributes>
  implements ProductoAttributes
{
  declare producto_id: number;
  declare categoria_id: number;
  declare codigo_barras: string | null;
  declare sku: string;
  declare descripcion: string | null;
  declare nombre: string;
  declare precio_venta: number;
  declare precio_compra: number;
  declare activo: boolean;
  declare created_at: Date;
  declare updated_at: Date;
  declare readonly categoria?: Categoria;
}

Producto.init(
  {
    producto_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codigo_barras: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precio_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "productos",
    underscored: true,
    timestamps: false,
    modelName: "Producto",
  },
);

