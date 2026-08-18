import { Op, UniqueConstraintError } from "sequelize";
import { Producto, Categoria } from "../models";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import type { ProductoAttributes } from "../models";

// Omit generated attributes for creating/updating
export type ProductInput = Omit<
  ProductoAttributes,
  "producto_id" | "created_at" | "updated_at" | "categoria"
>;

// Interfaz para listado paginado
export interface ProductListResult {
  items: Producto[];
  page: number;
  limit: number;
  total: number;
}

const ALLOWED_SORT_FIELDS = new Set(["name", "precio_venta", "precio_compra", "created_at"]);

export async function listProducts(query: Record<string, unknown>): Promise<ProductListResult> {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (query.active !== undefined) {
    where.activo = query.active === "true";
  }

  if (query.categoryId) {
    const catId = parseInt(query.categoryId as string, 10);
    if (!isNaN(catId)) {
      where.categoria_id = catId;
    }
  }

  if (query.search) {
    const searchString = `%${query.search}%`;
    where[Op.or] = [
      { nombre: { [Op.iLike]: searchString } },
      { sku: { [Op.iLike]: searchString } },
      { codigo_barras: { [Op.iLike]: searchString } },
    ];
  }

  let order: [string, string][] = [["created_at", "DESC"]];
  if (query.sort && typeof query.sort === "string") {
    let sortField = query.sort;
    let direction = "ASC";
    if (sortField.startsWith("-")) {
      direction = "DESC";
      sortField = sortField.substring(1);
    }
    // Mapeo seguro de nombres
    if (sortField === "name") sortField = "nombre";
    
    if (ALLOWED_SORT_FIELDS.has(sortField)) {
      order = [[sortField, direction]];
    }
  }

  const { count, rows } = await Producto.findAndCountAll({
    where,
    limit,
    offset,
    order,
    include: [{ model: Categoria, as: "categoria", attributes: ["categoria_id", "nombre"] }],
  });

  return {
    items: rows,
    page,
    limit,
    total: count,
  };
}

export async function getProductById(id: number): Promise<Producto> {
  const product = await Producto.findByPk(id, {
    include: [{ model: Categoria, as: "categoria", attributes: ["categoria_id", "nombre"] }],
  });
  if (!product) {
    throw new NotFoundError("Producto no encontrado.");
  }
  return product;
}

export async function createProduct(input: Record<string, unknown>): Promise<Producto> {
  validateProductInput(input);
  
  try {
    const product = await Producto.create({
      categoria_id: input.categoryId,
      sku: input.sku.trim(),
      codigo_barras: input.barcode?.trim() || null,
      nombre: input.name.trim(),
      descripcion: input.description?.trim() || null,
      precio_compra: input.purchasePrice,
      precio_venta: input.salePrice,
      activo: input.active !== undefined ? input.active : true,
    });
    return getProductById(product.producto_id);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function updateProduct(id: number, input: Record<string, unknown>): Promise<Producto> {
  const product = await Producto.findByPk(id);
  if (!product) {
    throw new NotFoundError("Producto no encontrado.");
  }

  const updates: Record<string, unknown> = {};
  if (input.categoryId !== undefined) updates.categoria_id = input.categoryId;
  if (input.sku !== undefined) updates.sku = input.sku.trim();
  if (input.barcode !== undefined) updates.codigo_barras = input.barcode.trim();
  if (input.name !== undefined) updates.nombre = input.name.trim();
  if (input.description !== undefined) updates.descripcion = input.description.trim();
  if (input.purchasePrice !== undefined) updates.precio_compra = input.purchasePrice;
  if (input.salePrice !== undefined) updates.precio_venta = input.salePrice;
  if (input.active !== undefined) updates.activo = input.active;

  // Validación parcial si los campos son provistos
  if (updates.precio_compra !== undefined && updates.precio_compra < 0) {
    throw new ValidationError("Invalid request data", ["purchasePrice no puede ser negativo."]);
  }
  if (updates.precio_venta !== undefined && updates.precio_venta < 0) {
    throw new ValidationError("Invalid request data", ["salePrice no puede ser negativo."]);
  }

  try {
    await product.update(updates);
    return getProductById(product.producto_id);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const product = await Producto.findByPk(id);
  if (!product) {
    throw new NotFoundError("Producto no encontrado.");
  }
  // Soft delete (desactivación)
  await product.update({ activo: false });
}

function validateProductInput(input: Record<string, unknown>) {
  const errors: string[] = [];
  if (!input.categoryId) errors.push("categoryId es requerido.");
  if (!input.sku || typeof input.sku !== "string") errors.push("sku es requerido y debe ser texto.");
  if (!input.name || typeof input.name !== "string") errors.push("name es requerido y debe ser texto.");
  if (input.purchasePrice === undefined || input.purchasePrice < 0) {
    errors.push("purchasePrice es requerido y no puede ser negativo.");
  }
  if (input.salePrice === undefined || input.salePrice < 0) {
    errors.push("salePrice es requerido y no puede ser negativo.");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid request data", errors);
  }
}

function handleUniqueError(error: unknown): never {
  if (error instanceof UniqueConstraintError) {
    const fields = error.errors.map((e: { path: string }) => e.path).join(", ");
    throw new ConflictError(`Ya existe un producto con el mismo valor en: ${fields}`);
  }
  throw error;
}
