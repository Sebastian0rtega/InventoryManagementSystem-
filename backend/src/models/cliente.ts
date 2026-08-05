import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface ClienteAttributes {
  cliente_id: number;
  nombre: string;
  rut: string;
  telefono: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface ClienteCreationAttributes
  extends Optional<ClienteAttributes, "cliente_id" | "telefono" | "created_at" | "updated_at"> {}

export class Cliente
  extends Model<ClienteAttributes, ClienteCreationAttributes>
  implements ClienteAttributes
{
  public cliente_id!: number;
  public nombre!: string;
  public rut!: string;
  public telefono!: string | null;
  public email!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Cliente.init(
  {
    cliente_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rut: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    tableName: "clientes",
    underscored: true,
    timestamps: false,
    modelName: "Cliente",
  },
);

