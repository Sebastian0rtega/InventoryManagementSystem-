import { Transaction, UniqueConstraintError, WhereOptions } from "sequelize";
import { sequelize, Compra, DetalleCompra, Inventario, MovimientoInventario, Producto, Proveedor, Tienda } from "../models";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { calcularSubtotal, calcularTotal } from "../utils/money";
import { CrearCompraBody, ListaComprasQuery } from "../validators/compras";

/**
 * DÍA 3 · Registro de compra con ENTRADA de stock atómica.
 *
 * Todo ocurre dentro de UNA transacción Sequelize:
 *   cabecera → detalles → inventario (create o increment) → movimientos ENTRADA.
 * Si cualquier paso falla (producto inexistente, stock inválido, documento
 * duplicado), se hace ROLLBACK y no queda ningún rastro parcial en la DB.
 */
export async function createPurchase(
  body: CrearCompraBody,
  usuarioId: number,
): Promise<Compra> {
  const { supplierId, storeId, documentType, documentNumber, paymentMethod, items } = body;

  // 1. Validar proveedor, tienda y productos ANTES de abrir la transacción
  //    (lecturas fuera de la tx: fallan rápido y no generan rollbacks costosos).
  const proveedor = await Proveedor.findByPk(supplierId);
  if (!proveedor) throw new NotFoundError("El proveedor indicado no existe.");

  const tienda = await Tienda.findByPk(storeId);
  if (!tienda) throw new NotFoundError("La tienda indicada no existe.");

  const productos = await Producto.findAll({
    where: { producto_id: items.map((i) => i.productId) },
  });
  if (productos.length !== items.length) {
    const encontrados = new Set(productos.map((p) => p.producto_id));
    const faltantes = items
      .map((i) => i.productId)
      .filter((id) => !encontrados.has(id))
      .join(", ");
    throw new NotFoundError(`Productos inexistentes: ${faltantes}.`);
  }
  const inactivos = productos.filter((p) => !p.activo).map((p) => p.producto_id);
  if (inactivos.length > 0) {
    throw new ValidationError("Invalid request data", [
      `Productos desactivados: ${inactivos.join(", ")}.`,
    ]);
  }

  try {
    // 2. Abrir transacción
    return await sequelize.transaction(async (t: Transaction) => {
      // 3. Crear cabecera (la restricción compuesta uq_compras_documento_proveedor
      //    rechaza el mismo documento para el mismo proveedor → 409).
      const total = calcularTotal(
        items.map((i) => calcularSubtotal(i.quantity, i.unitCost)),
      );
      const compra = await Compra.create(
        {
          proveedor_id: supplierId,
          tienda_id: storeId,
          usuario_id: usuarioId,
          tipo_documento: documentType,
          numero_documento: documentNumber,
          metodo_pago: paymentMethod,
          total,
        },
        { transaction: t },
      );

      // 4 + 5 + 6. Detalles, inventario y movimientos por cada item
      for (const item of items) {
        const producto = productos.find((p) => p.producto_id === item.productId)!;

        await DetalleCompra.create(
          {
            compra_id: compra.compra_id,
            producto_id: item.productId,
            cantidad: item.quantity,
            precio_compra: item.unitCost.toFixed(2),
            subtotal: calcularSubtotal(item.quantity, item.unitCost),
          },
          { transaction: t },
        );

        // Inventario: crear si no existe o incrementar stock (cantidad)
        let inventario = await Inventario.findOne({
          where: { tienda_id: storeId, producto_id: item.productId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!inventario) {
          inventario = await Inventario.create(
            { tienda_id: storeId, producto_id: item.productId, cantidad: item.quantity },
            { transaction: t },
          );
        } else {
          await inventario.increment("cantidad", {
            by: item.quantity,
            transaction: t,
          });
        }

        // Movimiento ENTRADA trazable a la compra
        await MovimientoInventario.create(
          {
            inventario_id: inventario.inventario_id,
            tipo_movimiento: "ENTRADA_COMPRA",
            cantidad: item.quantity,
            referencia_tipo: "COMPRA",
            referencia_id: compra.compra_id,
            usuario_id: usuarioId,
          },
          { transaction: t },
        );
        void producto; // producto verificado arriba; se usa solo como garantía
      }

      // 7. Commit implícito al retornar
      return compra;
    });
  } catch (error) {
    // El rollback ya lo ejecuta sequelize.transaction al propagar el error;
    // aquí solo traducimos los errores de negocio.
    if (error instanceof UniqueConstraintError) {
      throw new ConflictError(
        "Ya existe una compra con ese documento para el mismo proveedor.",
      );
    }
    throw error;
  }
}

export async function listPurchases(query: ListaComprasQuery) {
  const { supplierId, storeId, page, limit } = query;
  const where: Record<string | symbol, unknown> = {};
  if (supplierId !== undefined) where.proveedor_id = supplierId;
  if (storeId !== undefined) where.tienda_id = storeId;

  const { rows, count } = await Compra.findAndCountAll({
    where: where as WhereOptions,
    include: [
      { model: DetalleCompra, as: "detalles" },
    ],
    order: [["compra_id", "DESC"]],
    offset: (page - 1) * limit,
    limit,
    distinct: true,
  });

  return { data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) };
}

export async function getPurchaseById(id: number): Promise<Compra> {
  const compra = await Compra.findByPk(id, {
    include: [
      { model: DetalleCompra, as: "detalles" },
      { model: Proveedor, as: "proveedor", attributes: ["proveedor_id", "nombre", "rut"] },
      { model: Tienda, as: "tienda", attributes: ["tienda_id", "nombre"] },
    ],
  });
  if (!compra) throw new NotFoundError("Compra no encontrada.");
  return compra;
}
