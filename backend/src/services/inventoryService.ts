import { Op, Transaction, WhereOptions } from "sequelize";
import {
  sequelize,
  Inventario,
  MovimientoInventario,
  Producto,
  Tienda,
  Usuario,
} from "../models";
import {
  ForbiddenError,
  InsufficientStockError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";
import { ROLES, JwtPayload } from "./authService";
import { AjusteInventarioBody, ListaInventarioQuery } from "../validators/inventario";

/**
 * DÍA 5 · Inventario y movimientos.
 *
 * Reglas de negocio:
 * - status: NORMAL (stock > min), LOW (0 < stock <= min), OUT (stock = 0).
 * - El stock se ajusta SOLO mediante este servicio, dentro de una transacción
 *   con bloqueo pesimista; una SALIDA nunca puede dejar el stock bajo cero.
 * - Cada cambio de stock genera un movimiento en la bitácora con usuario,
 *   tienda, producto, cantidad, motivo, tipo y referencia origen.
 * - Los movimientos se registran desde servicios, nunca desde el controlador.
 */

export type EstadoStock = "NORMAL" | "LOW" | "OUT";

export function calcularEstado(stock: number, stockMinimo: number): EstadoStock {
  if (stock === 0) return "OUT";
  if (stock <= stockMinimo) return "LOW";
  return "NORMAL";
}

/* ============================================================
 * GET /api/inventory
 * ============================================================ */
export async function listInventory(query: ListaInventarioQuery, userPayload: JwtPayload) {
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  const { search, storeId, status, sort, page, limit } = query;
  const where: Record<string | symbol, unknown> = {};

  // Restricción por rol: SELLER/WAREHOUSE solo ven su tienda asignada
  if (userPayload.rol !== ROLES.ADMIN) {
    where.tienda_id = usuario.tienda_id;
  } else if (storeId !== undefined) {
    where.tienda_id = storeId;
  }

  // Búsqueda por nombre, SKU o código de barras del producto
  let productoWhere: Record<string, unknown> | undefined;
  if (search) {
    productoWhere = {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { codigo_barras: { [Op.iLike]: `%${search}%` } },
      ],
    };
  }

  // Filtro por estado calculado en SQL (cláusula HAVING sobre CASE)
  const havingEstado = status
    ? sequelize.where(
        sequelize.literal(
          `CASE WHEN "Inventario"."cantidad" = 0 THEN 'OUT'
                WHEN "Inventario"."cantidad" <= "Inventario"."stock_minimo" THEN 'LOW'
                ELSE 'NORMAL' END`,
        ),
        status,
      )
    : null;

  const order: Array<[string, "ASC" | "DESC"]> =
    sort === "stock_actual"
      ? [["cantidad", "ASC"]]
      : sort === "-stock_actual"
        ? [["cantidad", "DESC"]]
        : [["inventario_id", "ASC"]];

  const options: Record<string, unknown> = {
    where: where as WhereOptions,
    include: [
      {
        model: Producto,
        as: "producto",
        attributes: ["producto_id", "nombre", "sku", "codigo_barras", "precio_venta", "activo"],
        where: productoWhere,
      },
      { model: Tienda, as: "tienda", attributes: ["tienda_id", "nombre"] },
    ],
    order,
    offset: (page - 1) * limit,
    limit,
    distinct: true,
  };

  if (havingEstado) options.having = havingEstado;

  const { rows, count } = await Inventario.findAndCountAll(options as never);

  const data = rows.map((inv) => ({
    inventario_id: inv.inventario_id,
    tienda_id: inv.tienda_id,
    producto_id: inv.producto_id,
    stock_actual: inv.cantidad,
    stock_minimo: inv.stock_minimo,
    status: calcularEstado(inv.cantidad, inv.stock_minimo),
    producto: inv.producto,
    tienda: inv.tienda,
  }));

  return { data, page, limit, total: count, totalPages: Math.ceil(count / limit) };
}

/* ============================================================
 * POST /api/inventory/adjustments  (ADMIN · WAREHOUSE)
 * ============================================================ */
export async function adjustInventory(body: AjusteInventarioBody, userPayload: JwtPayload) {
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  const { storeId: requestedStoreId, productId, tipo, cantidad, motivo } = body;

  // Control de acceso por tienda: SELLER/WAREHOUSE anclados a su tienda asignada
  const isAdmin = userPayload.rol === ROLES.ADMIN;
  let targetStoreId: number;

  if (requestedStoreId !== undefined) {
    if (!isAdmin && requestedStoreId !== usuario.tienda_id) {
      throw new ForbiddenError("No tiene permisos para ajustar inventario de otra tienda.");
    }
    targetStoreId = requestedStoreId;
  } else {
    targetStoreId = usuario.tienda_id;
  }

  const tienda = await Tienda.findByPk(targetStoreId);
  if (!tienda) {
    throw new NotFoundError("La tienda indicada no existe.");
  }

  const producto = await Producto.findByPk(productId);
  if (!producto) {
    throw new NotFoundError("El producto indicado no existe.");
  }
  if (!producto.activo) {
    throw new ValidationError("Invalid request data", [
      `El producto '${producto.nombre}' se encuentra desactivado.`,
    ]);
  }

  return await sequelize.transaction(async (t: Transaction) => {
    // Bloqueo pesimista de la fila de inventario
    let inventario = await Inventario.findOne({
      where: { tienda_id: targetStoreId, producto_id: productId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!inventario) {
      if (tipo === "SALIDA") {
        throw new InsufficientStockError(
          `Stock insuficiente para el producto '${producto.nombre}'. Solicitado: ${cantidad}, disponible: 0.`,
        );
      }
      inventario = await Inventario.create(
        { tienda_id: targetStoreId, producto_id: productId, cantidad: 0, stock_minimo: 0 },
        { transaction: t },
      );
    }

    if (tipo === "SALIDA") {
      // Regla crítica: una SALIDA manual nunca puede dejar el stock bajo cero
      if (inventario.cantidad < cantidad) {
        throw new InsufficientStockError(
          `Stock insuficiente para el producto '${producto.nombre}'. Solicitado: ${cantidad}, disponible: ${inventario.cantidad}.`,
        );
      }
      await inventario.decrement("cantidad", { by: cantidad, transaction: t });
    } else {
      await inventario.increment("cantidad", { by: cantidad, transaction: t });
    }

    // Bitácora: el movimiento SIEMPRE se registra desde el servicio, nunca del controlador
    const movimiento = await MovimientoInventario.create(
      {
        inventario_id: inventario.inventario_id,
        tipo_movimiento: "AJUSTE",
        cantidad,
        motivo,
        referencia_tipo: "AJUSTE_MANUAL",
        referencia_id: null,
        usuario_id: usuario.usuario_id,
      },
      { transaction: t },
    );

    await inventario.reload({ transaction: t });

    return {
      ajuste: {
        movimiento_id: movimiento.movimiento_id,
        tipo,
        cantidad,
        motivo,
        usuario: { usuario_id: usuario.usuario_id, nombre: usuario.nombre },
        tienda: { tienda_id: tienda.tienda_id, nombre: tienda.nombre },
        producto: { producto_id: producto.producto_id, nombre: producto.nombre, sku: producto.sku },
        fecha: movimiento.created_at,
      },
      inventario: {
        inventario_id: inventario.inventario_id,
        stock_actual: inventario.cantidad,
        stock_minimo: inventario.stock_minimo,
        status: calcularEstado(inventario.cantidad, inventario.stock_minimo),
      },
    };
  });
}

/* ============================================================
 * GET /api/inventory/:id/movements  (ADMIN · WAREHOUSE, solo lectura)
 * ============================================================ */
export async function listMovements(
  inventarioId: number,
  userPayload: JwtPayload,
  page: number,
  limit: number,
) {
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  const inventario = await Inventario.findByPk(inventarioId, {
    include: [
      { model: Producto, as: "producto", attributes: ["producto_id", "nombre", "sku"] },
      { model: Tienda, as: "tienda", attributes: ["tienda_id", "nombre"] },
    ],
  });
  if (!inventario) {
    throw new NotFoundError("Inventario no encontrado.");
  }

  // SELLER/WAREHOUSE solo consultan movimientos de su tienda
  if (userPayload.rol !== ROLES.ADMIN && inventario.tienda_id !== usuario.tienda_id) {
    throw new ForbiddenError("No tiene permisos para consultar movimientos de otra tienda.");
  }

  const { rows, count } = await MovimientoInventario.findAndCountAll({
    where: { inventario_id: inventarioId },
    include: [{ model: Usuario, as: "usuario", attributes: ["usuario_id", "nombre", "email"] }],
    order: [["movimiento_id", "DESC"]],
    offset: (page - 1) * limit,
    limit,
    distinct: true,
  });

  return {
    inventario: {
      inventario_id: inventario.inventario_id,
      producto: inventario.producto,
      tienda: inventario.tienda,
      stock_actual: inventario.cantidad,
      stock_minimo: inventario.stock_minimo,
      status: calcularEstado(inventario.cantidad, inventario.stock_minimo),
    },
    data: rows,
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
}
