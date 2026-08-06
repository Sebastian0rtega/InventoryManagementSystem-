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
  created_at: Date;
  updated_at: Date;
  rol?: Rol;
  tienda?: Tienda;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "usuario_id" | "created_at" | "updated_at"> {}

export class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public usuario_id!: number;
  public rol_id!: number;
  public tienda_id!: number;
  public email!: string;
  public nombre!: string;
  public password_hash!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly rol?: Rol;
  public readonly tienda?: Tienda;

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

