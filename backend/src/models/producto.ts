import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Categoria } from "./categoria";

interface ProductoAttributes {
  producto_id: number;
  categoria_id: number;
  codigo_barras: string;
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
  public producto_id!: number;
  public categoria_id!: number;
  public codigo_barras!: string;
  public sku!: string;
  public descripcion!: string | null;
  public nombre!: string;
  public precio_venta!: number;
  public precio_compra!: number;
  public activo!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly categoria?: Categoria;
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
      allowNull: false,
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

