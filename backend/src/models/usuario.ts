import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Rol } from "./rol";
import type { Tienda } from "./tienda";

export interface UsuarioAttributes {
  usuario_id: number;
  rol_id: number;
  tienda_id: number;
  email: string;
  nombre: string;
  password_hash: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  rol?: Rol;
  tienda?: Tienda;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "usuario_id" | "created_at" | "updated_at" | "activo"> {}

export class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  declare usuario_id: number;
  declare rol_id: number;
  declare tienda_id: number;
  declare email: string;
  declare nombre: string;
  declare password_hash: string;
  declare activo: boolean;
  declare created_at: Date;
  declare updated_at: Date;
  declare readonly rol?: Rol;
  declare readonly tienda?: Tienda;

  /** Devuelve una copia del usuario sin el password_hash. */
  public toPublicJSON(): Omit<UsuarioAttributes, "password_hash"> {
    const { password_hash: _passwordHash, ...userWithoutPassword } = this.toJSON() as UsuarioAttributes;
    return userWithoutPassword;
  }
}

Usuario.init(
  {
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tienda_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(100),
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
    tableName: "usuarios",
    underscored: true,
    timestamps: false,
    modelName: "Usuario",
  },
);

