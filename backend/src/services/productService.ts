import { Op, UniqueConstraintError } from "sequelize";
import { Producto, Categoria } from "../models";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

// Interfaz para listado paginado
export interface ProductListResult {
  items: Producto[];
  page: number;
  limit: number;
  total: number;
}

interface CreateProductInput {
  categoryId: unknown;
  sku: unknown;
  barcode?: unknown;
  name: unknown;
  description?: unknown;
  purchasePrice: unknown;
  salePrice: unknown;
  active?: unknown;
}

interface UpdateProductInput {
  categoryId?: unknown;
  sku?: unknown;
  barcode?: unknown;
  name?: unknown;
  description?: unknown;
  purchasePrice?: unknown;
  salePrice?: unknown;
  active?: unknown;
}

const ALLOWED_SORT_FIELDS = new Set(["nombre", "precio_venta", "precio_compra", "created_at"]);

export async function listProducts(query: Record<string, unknown>): Promise<ProductListResult> {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (query.active !== undefined) {
    where["activo"] = query.active === "true";
  }

  if (query.categoryId) {
    const catId = parseInt(query.categoryId as string, 10);
    if (!isNaN(catId)) {
      where["categoria_id"] = catId;
    }
  }

  if (query.search) {
    const searchString = `%${query.search}%`;
    Object.assign(where, {
      [Op.or]: [
        { nombre: { [Op.iLike]: searchString } },
        { sku: { [Op.iLike]: searchString } },
        { codigo_barras: { [Op.iLike]: searchString } },
      ],
    });
  }

  let order: [string, string][] = [["created_at", "DESC"]];
  if (query.sort && typeof query.sort === "string") {
    let sortField = query.sort;
    let direction = "ASC";
    if (sortField.startsWith("-")) {
      direction = "DESC";
      sortField = sortField.substring(1);
    }
    // Mapeo de alias de campo: "name" → "nombre"
    if (sortField === "name") sortField = "nombre";

    if (ALLOWED_SORT_FIELDS.has(sortField)) {
      order = [[sortField, direction]];
    }
  }

  const { count, rows } = await Producto.findAndCountAll({
    where,
    limit,
    offset,
    order: order as [string, string][],
    include: [{ model: Categoria, as: "categoria", attributes: ["categoria_id", "nombre"] }],
    distinct: true,
  });

  return { items: rows, page, limit, total: count };
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

export async function createProduct(input: CreateProductInput): Promise<Producto> {
  validateCreateInput(input);

  // Validar que la categoría existe
  const catId = input.categoryId as number;
  const categoria = await Categoria.findByPk(catId);
  if (!categoria) {
    throw new NotFoundError("La categoría indicada no existe.");
  }

  try {
    const product = await Producto.create({
      categoria_id: catId,
      sku: (input.sku as string).trim(),
      codigo_barras: input.barcode ? (input.barcode as string).trim() : null,
      nombre: (input.name as string).trim(),
      descripcion: input.description ? (input.description as string).trim() : null,
      precio_compra: input.purchasePrice as number,
      precio_venta: input.salePrice as number,
      activo: typeof input.active === "boolean" ? input.active : true,
    });
    return getProductById(product.producto_id);
  } catch (error) {
    handleUniqueError(error);
  }
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Producto> {
  if (isNaN(id)) {
    throw new ValidationError("Invalid request data", ["El ID debe ser un número entero válido."]);
  }

  const product = await Producto.findByPk(id);
  if (!product) {
    throw new NotFoundError("Producto no encontrado.");
  }

  const updates: Record<string, unknown> = {};

  if (input.categoryId !== undefined) {
    const catId = input.categoryId as number;
    const categoria = await Categoria.findByPk(catId);
    if (!categoria) {
      throw new NotFoundError("La categoría indicada no existe.");
    }
    updates["categoria_id"] = catId;
  }

  if (input.sku !== undefined) {
    updates["sku"] = (input.sku as string).trim();
  }

  if (input.barcode !== undefined) {
    updates["codigo_barras"] = input.barcode ? (input.barcode as string).trim() : null;
  }

  if (input.name !== undefined) {
    updates["nombre"] = (input.name as string).trim();
  }

  if (input.description !== undefined) {
    updates["descripcion"] = input.description ? (input.description as string).trim() : null;
  }

  if (input.purchasePrice !== undefined) {
    if (!isValidPositivePrice(input.purchasePrice)) {
      throw new ValidationError("Invalid request data", [
        "purchasePrice debe ser un número mayor que cero.",
      ]);
    }
    updates["precio_compra"] = input.purchasePrice as number;
  }

  if (input.salePrice !== undefined) {
    if (!isValidPositivePrice(input.salePrice)) {
      throw new ValidationError("Invalid request data", [
        "salePrice debe ser un número mayor que cero.",
      ]);
    }
    updates["precio_venta"] = input.salePrice as number;
  }

  if (input.active !== undefined) {
    updates["activo"] = input.active as boolean;
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError("Invalid request data", ["No se proporcionaron campos editables válidos."]);
  }

  try {
    await product.update(updates);
    return getProductById(product.producto_id);
  } catch (error) {
    handleUniqueError(error);
  }
}

/**
 * Desactivación lógica (soft delete).
 *
 * Decisión de diseño: los productos pueden tener historial en ventas e
 * inventario, por lo que nunca se borran físicamente. Se desactiva el flag
 * `activo` para ocultarlos del catálogo sin perder trazabilidad.
 */
export async function deleteProduct(id: number): Promise<void> {
  const product = await Producto.findByPk(id);
  if (!product) {
    throw new NotFoundError("Producto no encontrado.");
  }
  await product.update({ activo: false });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function validateCreateInput(input: CreateProductInput): void {
  const errors: string[] = [];

  if (!input.categoryId || typeof input.categoryId !== "number") {
    errors.push("categoryId es requerido y debe ser un número.");
  }
  if (!input.sku || typeof input.sku !== "string" || !(input.sku as string).trim()) {
    errors.push("sku es requerido y debe ser texto no vacío.");
  }
  if (!input.name || typeof input.name !== "string" || !(input.name as string).trim()) {
    errors.push("name es requerido y debe ser texto no vacío.");
  }
  if (!isValidPositivePrice(input.purchasePrice)) {
    errors.push("purchasePrice es requerido y debe ser un número mayor que cero.");
  }
  if (!isValidPositivePrice(input.salePrice)) {
    errors.push("salePrice es requerido y debe ser un número mayor que cero.");
  }

  if (errors.length > 0) {
    throw new ValidationError("Invalid request data", errors);
  }
}

/**
 * Un precio válido es un número finito estrictamente mayor que cero.
 * Se rechazan strings, NaN, 0 y negativos para evitar comparaciones coercitivas.
 */
function isValidPositivePrice(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (value as number) > 0
  );
}

function handleUniqueError(error: unknown): never {
  if (error instanceof UniqueConstraintError) {
    const fields = error.errors
      .map((e) => e.path ?? "campo desconocido")
      .join(", ");
    throw new ConflictError(`Ya existe un producto con el mismo valor en: ${fields}`);
  }
  throw error;
}
