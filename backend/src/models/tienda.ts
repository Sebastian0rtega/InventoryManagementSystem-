import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface TiendaAttributes {
  tienda_id: number;
  nombre: string;
  direccion: string;
  created_at: Date;
  updated_at: Date;
}

interface TiendaCreationAttributes extends Optional<TiendaAttributes, "tienda_id" | "created_at" | "updated_at"> {}

export class Tienda
  extends Model<TiendaAttributes, TiendaCreationAttributes>
  implements TiendaAttributes
{
  public tienda_id!: number;
  public nombre!: string;
  public direccion!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Tienda.init(
  {
    tienda_id: {
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
    direccion: {
      type: DataTypes.STRING(150),
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
    tableName: "tiendas",
    underscored: true,
    timestamps: false,
    modelName: "Tienda",
  },
);

