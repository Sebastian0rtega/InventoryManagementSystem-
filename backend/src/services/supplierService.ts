import { Op, UniqueConstraintError, WhereOptions } from "sequelize";
import { Proveedor } from "../models";
import { ConflictError, NotFoundError } from "../utils/errors";
import { CrearProveedorInput, ListaQuery, ActualizarProveedorInput } from "../validators/transaccionales";

export async function listSuppliers(
  query: ListaQuery,
): Promise<{ data: Proveedor[]; page: number; limit: number; total: number; totalPages: number }> {
  const { q, activo, page, limit } = query;
  const where: Record<string | symbol, unknown> = {};
  if (activo !== undefined) {
    where.activo = activo;
  }
  if (q) {
    where[Op.or] = [
      { nombre: { [Op.iLike]: `%${q}%` } },
      { rut: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { rows, count } = await Proveedor.findAndCountAll({
    where: where as WhereOptions,
    order: [["proveedor_id", "ASC"]],
    offset: (page - 1) * limit,
    limit,
  });

  return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
}

export async function getSupplierById(id: number): Promise<Proveedor> {
  const proveedor = await Proveedor.findByPk(id);
  if (!proveedor) {
    throw new NotFoundError("Proveedor no encontrado.");
  }
  return proveedor;
}

export async function createSupplier(input: CrearProveedorInput): Promise<Proveedor> {
  try {
    return await Proveedor.create(input);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe un proveedor con ese RUT o email.");
    }
    throw error;
  }
}

export async function updateSupplier(id: number, input: ActualizarProveedorInput): Promise<Proveedor> {
  const proveedor = await getSupplierById(id);
  try {
    return await proveedor.update(input);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe otro proveedor con ese RUT o email.");
    }
    throw error;
  }
}

/**
 * Eliminación preferente: DESACTIVACIÓN (soft delete).
 * No eliminamos físicamente porque el proveedor puede estar referenciado
 * por compras (FK proveedor_id con onDelete RESTRICT).
 */
export async function deleteSupplier(id: number): Promise<Proveedor> {
  const proveedor = await getSupplierById(id);
  if (!proveedor.activo) {
    throw new ConflictError("El proveedor ya está desactivado.");
  }
  await proveedor.update({ activo: false });
  return proveedor;
}
