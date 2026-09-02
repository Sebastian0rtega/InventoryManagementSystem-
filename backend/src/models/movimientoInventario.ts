import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import type { Inventario } from "./inventario";
import type { Usuario } from "./usuario";

export type TipoMovimiento =
  | "ENTRADA_COMPRA"
  | "SALIDA_VENTA"
  | "AJUSTE"
  | "MERMA"
  | "TRASLADO";

export interface MovimientoInventarioAttributes {
  movimiento_id: number;
  inventario_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  referencia_tipo: string | null;
  referencia_id: number | null;
  usuario_id: number | null;
  created_at: Date;
  updated_at: Date;
  inventario?: Inventario;
  usuario?: Usuario;
}

type Creation = Optional<
  MovimientoInventarioAttributes,
  "movimiento_id" | "referencia_tipo" | "referencia_id" | "usuario_id" | "created_at" | "updated_at"
>;

export class MovimientoInventario
  extends Model<MovimientoInventarioAttributes, Creation>
  implements MovimientoInventarioAttributes
{
  public movimiento_id!: number;
  public inventario_id!: number;
  public tipo_movimiento!: TipoMovimiento;
  public cantidad!: number;
  public referencia_tipo!: string | null;
  public referencia_id!: number | null;
  public usuario_id!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
  public readonly inventario?: Inventario;
  public readonly usuario?: Usuario;
}

MovimientoInventario.init(
  {
    movimiento_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    inventario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_movimiento: { type: DataTypes.STRING(20), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    referencia_tipo: { type: DataTypes.STRING(20), allowNull: true },
    referencia_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "movimientos_inventarios",
    underscored: true,
    timestamps: false,
    modelName: "MovimientoInventario",
  },
);
