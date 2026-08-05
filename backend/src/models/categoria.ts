import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface CategoriaAttributes {
  categoria_id: number;
  nombre: string;
  created_at: Date;
  updated_at: Date;
}

interface CategoriaCreationAttributes
  extends Optional<CategoriaAttributes, "categoria_id" | "created_at" | "updated_at"> {}

export class Categoria
  extends Model<CategoriaAttributes, CategoriaCreationAttributes>
  implements CategoriaAttributes
{
  public categoria_id!: number;
  public nombre!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Categoria.init(
  {
    categoria_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
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
    tableName: "categorias",
    underscored: true,
    timestamps: false,
    modelName: "Categoria",
  },
);

