import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import { Categoria } from "../models";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export async function listCategories(): Promise<Categoria[]> {
  return await Categoria.findAll({ order: [["nombre", "ASC"]] });
}

export async function getCategoryById(id: number): Promise<Categoria> {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    throw new NotFoundError("Categoría no encontrada.");
  }
  return categoria;
}

export async function createCategory(nombreRaw: unknown): Promise<Categoria> {
  if (typeof nombreRaw !== "string") {
    throw new ValidationError("Invalid request data", ["El nombre debe ser de tipo texto."]);
  }
  
  const nombre = nombreRaw.trim();
  if (!nombre) {
    throw new ValidationError("Invalid request data", ["El nombre de la categoría no puede estar vacío."]);
  }

  try {
    const nueva = await Categoria.create({ nombre });
    return nueva;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe una categoría con ese nombre.");
    }
    throw error;
  }
}

export async function updateCategory(id: number, nombreRaw: unknown): Promise<Categoria> {
  if (typeof nombreRaw !== "string") {
    throw new ValidationError("Invalid request data", ["El nombre debe ser de tipo texto."]);
  }
  
  const nombre = nombreRaw.trim();
  if (!nombre) {
    throw new ValidationError("Invalid request data", ["El nombre de la categoría no puede estar vacío."]);
  }

  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    throw new NotFoundError("Categoría no encontrada.");
  }

  try {
    await categoria.update({ nombre });
    return categoria;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError("Ya existe otra categoría con ese nombre.");
    }
    throw error;
  }
}

/**
 * Eliminación FÍSICA de la categoría.
 *
 * Decisión de diseño: las categorías son datos de configuración sin historial
 * propio; no requieren auditoría de borrado. Si la categoría tiene productos
 * asociados, Sequelize lanza ForeignKeyConstraintError, que se convierte en
 * 409 Conflict para proteger la integridad referencial.
 */
export async function deleteCategory(id: number): Promise<void> {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    throw new NotFoundError("Categoría no encontrada.");
  }

  try {
    await categoria.destroy();
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new ConflictError("No se puede eliminar la categoría porque tiene productos asociados.");
    }
    throw error;
  }
}
