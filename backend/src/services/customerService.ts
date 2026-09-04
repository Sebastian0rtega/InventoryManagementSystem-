import { Op, UniqueConstraintError, WhereOptions } from "sequelize";
import { Cliente } from "../models";
import { ConflictError, NotFoundError } from "../utils/errors";
import { CrearClienteInput, ListaQuery, ActualizarClienteInput } from "../validators/transaccionales";

export async function listCustomers(
  query: ListaQuery,
): Promise<{ data: Cliente[]; page: number; limit: number; total: number; totalPages: number }> {
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

  const { rows, count } = await Cliente.findAndCountAll({
    where: where as WhereOptions,
    order: [["cliente_id", "ASC"]],
    offset: (page - 1) * limit,
    limit,
  });

  return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
}

export async function getCustomerById(id: number): Promise<Cliente> {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) {
    throw new NotFoundError("Cliente no encontrado.");
  }
  return cliente;
}

export async function createCustomer(input: CrearClienteInput): Promise<Cliente> {
  try {
    return await Cliente.create(input);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe un cliente con ese RUT o email.");
    }
    throw error;
  }
}

export async function updateCustomer(id: number, input: ActualizarClienteInput): Promise<Cliente> {
  const cliente = await getCustomerById(id);
  try {
    return await cliente.update(input);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe otro cliente con ese RUT o email.");
    }
    throw error;
  }
}

/**
 * Eliminación preferente: DESACTIVACIÓN (soft delete).
 * No eliminamos físicamente porque el cliente puede estar referenciado
 * por ventas (FK cliente_id con onDelete RESTRICT).
 */
export async function deleteCustomer(id: number): Promise<Cliente> {
  const cliente = await getCustomerById(id);
  if (!cliente.activo) {
    throw new ConflictError("El cliente ya está desactivado.");
  }
  await cliente.update({ activo: false });
  return cliente;
}
