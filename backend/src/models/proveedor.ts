import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export interface ProveedorAttributes {
  proveedor_id: number;
  nombre: string;
  rut: string;
  telefono: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;
}

type Creation = Optional<
  ProveedorAttributes,
  "proveedor_id" | "telefono" | "created_at" | "updated_at"
>;

export class Proveedor
  extends Model<ProveedorAttributes, Creation>
  implements ProveedorAttributes
{
  public proveedor_id!: number;
  public nombre!: string;
  public rut!: string;
  public telefono!: string | null;
  public email!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Proveedor.init(
  {
    proveedor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    rut: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    telefono: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "proveedores",
    underscored: true,
    timestamps: false,
    modelName: "Proveedor",
  },
);
