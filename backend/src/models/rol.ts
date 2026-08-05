import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface RolAttributes {
  rol_id: number;
  nombre_rol: string;
  created_at: Date;
  updated_at: Date;
}

interface RolCreationAttributes extends Optional<RolAttributes, "rol_id" | "created_at" | "updated_at"> {}

export class Rol extends Model<RolAttributes, RolCreationAttributes> implements RolAttributes {
  public rol_id!: number;
  public nombre_rol!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Rol.init(
  {
    rol_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre_rol: {
      type: DataTypes.STRING(50),
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
    tableName: "roles",
    underscored: true,
    timestamps: false,
    modelName: "Rol",
  },
);

