import { Transaction, WhereOptions } from "sequelize";
import {
  sequelize,
  Venta,
  DetalleVenta,
  Inventario,
  MovimientoInventario,
  Producto,
  Cliente,
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
import { calcularSubtotal, calcularTotal } from "../utils/money";
import { ROLES, JwtPayload } from "./authService";
import { CrearVentaBody, ListaVentasQuery } from "../validators/ventas";

/**
 * DÍA 4 · Ventas y salida segura de stock.
 *
 * Transaccionalidad total (ACID) y protección de concurrencia:
 * - Selección de inventario con bloqueo pesimista `SELECT FOR UPDATE` (`lock: t.LOCK.UPDATE`).
 * - Ordenamiento determinista de productos para prevenir interbloqueos (deadlocks).
 * - Validación estricta de stock disponible: si falta stock en cualquier producto,
 *   se dispara `InsufficientStockError` que genera ROLLBACK inmediato (409 STOCK_INSUFFICIENT).
 * - Descuento atómico de unidades en inventario.
 * - Registro de movimiento `SALIDA_VENTA` por cada detalle.
 * - Control de acceso por tienda: SELLER solo vende en su tienda asignada (403 si intenta otra).
 */

export async function createSale(
  body: CrearVentaBody,
  userPayload: JwtPayload,
): Promise<Venta> {
  const { customerId, storeId: requestedStoreId, items } = body;

  // 1. Obtener usuario autenticado para validar estado y tienda asignada
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  // 2. Determinar tienda de la venta y verificar permisos
  // Regla: La tienda se toma del usuario autenticado, salvo que sea ADMIN.
  // SELLER intentando vender en otra tienda -> 403 FORBIDDEN.
  const isAdmin = userPayload.rol === ROLES.ADMIN;
  let targetStoreId: number;

  if (requestedStoreId !== undefined) {
    if (!isAdmin && requestedStoreId !== usuario.tienda_id) {
      throw new ForbiddenError("No tiene permisos para registrar ventas en otra tienda.");
    }
    targetStoreId = requestedStoreId;
  } else {
    targetStoreId = usuario.tienda_id;
  }

  const tienda = await Tienda.findByPk(targetStoreId);
  if (!tienda) {
    throw new NotFoundError("La tienda indicada no existe.");
  }

  // 3. Validar cliente si fue especificado
  if (customerId !== undefined) {
    const cliente = await Cliente.findByPk(customerId);
    if (!cliente) {
      throw new NotFoundError("El cliente indicado no existe.");
    }
    if (!cliente.activo) {
      throw new ValidationError("Invalid request data", [
        "El cliente indicado se encuentra inactivo.",
      ]);
    }
  }

  // 4. Validar productos antes de iniciar la transacción (falla rápido sin abrir tx)
  const productIds = items.map((i) => i.productId);
  const productos = await Producto.findAll({
    where: { producto_id: productIds },
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

  // 5. Transacción atómica con bloqueo pesimista
  return await sequelize.transaction(async (t: Transaction) => {
    // Ordenar items por productId ASC para evitar deadlocks en llamadas concurrentes
    const sortedItems = [...items].sort((a, b) => a.productId - b.productId);

    interface ItemCalculado {
      inventario: Inventario;
      productId: number;
      quantity: number;
      precioUnitario: number;
      subtotal: string;
    }

    const calculados: ItemCalculado[] = [];

    // Bloquear filas de inventario y verificar disponibilidad de stock
    for (const item of sortedItems) {
      const producto = productos.find((p) => p.producto_id === item.productId)!;
      const precioUnitario =
        item.unitPrice !== undefined ? item.unitPrice : Number(producto.precio_venta);
      const subtotal = calcularSubtotal(item.quantity, precioUnitario);

      const inventario = await Inventario.findOne({
        where: { tienda_id: targetStoreId, producto_id: item.productId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const stockDisponible = inventario ? inventario.cantidad : 0;
      if (!inventario || stockDisponible < item.quantity) {
        throw new InsufficientStockError(
          `Stock insuficiente para el producto '${producto.nombre}'. Solicitado: ${item.quantity}, disponible: ${stockDisponible}.`,
          [
            {
              productId: item.productId,
              productName: producto.nombre,
              requested: item.quantity,
              available: stockDisponible,
            },
          ],
        );
      }

      calculados.push({
        inventario,
        productId: item.productId,
        quantity: item.quantity,
        precioUnitario,
        subtotal,
      });
    }

    // Calcular total de la venta en el servidor
    const total = calcularTotal(calculados.map((c) => c.subtotal));

    // Crear cabecera de la venta
    const venta = await Venta.create(
      {
        cliente_id: customerId ?? null,
        tienda_id: targetStoreId,
        usuario_id: usuario.usuario_id,
        fecha_venta: new Date(),
        total,
      },
      { transaction: t },
    );

    // Crear detalles, decrementar stock y registrar movimientos SALIDA
    for (const c of calculados) {
      await DetalleVenta.create(
        {
          venta_id: venta.venta_id,
          producto_id: c.productId,
          cantidad: c.quantity,
          precio_venta: c.precioUnitario.toFixed(2),
          subtotal: c.subtotal,
        },
        { transaction: t },
      );

      await c.inventario.decrement("cantidad", {
        by: c.quantity,
        transaction: t,
      });

      await MovimientoInventario.create(
        {
          inventario_id: c.inventario.inventario_id,
          tipo_movimiento: "SALIDA_VENTA",
          cantidad: c.quantity,
          referencia_tipo: "VENTA",
          referencia_id: venta.venta_id,
          usuario_id: usuario.usuario_id,
        },
        { transaction: t },
      );
    }

    return venta;
  });
}

export async function listSales(query: ListaVentasQuery, userPayload: JwtPayload) {
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  const { storeId, customerId, page, limit } = query;
  const where: Record<string | symbol, unknown> = {};

  // Restricción por rol: SELLER solo ve ventas de su tienda asignada
  if (userPayload.rol !== ROLES.ADMIN) {
    where.tienda_id = usuario.tienda_id;
  } else if (storeId !== undefined) {
    where.tienda_id = storeId;
  }

  if (customerId !== undefined) {
    where.cliente_id = customerId;
  }

  const { rows, count } = await Venta.findAndCountAll({
    where: where as WhereOptions,
    include: [
      { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
      { model: Cliente, as: "cliente", attributes: ["cliente_id", "nombre", "rut"] },
      { model: Tienda, as: "tienda", attributes: ["tienda_id", "nombre"] },
      { model: Usuario, as: "usuario", attributes: ["usuario_id", "nombre", "email"] },
    ],
    order: [["venta_id", "DESC"]],
    offset: (page - 1) * limit,
    limit,
    distinct: true,
  });

  return {
    data: rows,
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
}

export async function getSaleById(id: number, userPayload: JwtPayload): Promise<Venta> {
  const usuario = await Usuario.findByPk(userPayload.id);
  if (!usuario || !usuario.activo) {
    throw new UnauthorizedError("Usuario no autenticado o inactivo.");
  }

  const venta = await Venta.findByPk(id, {
    include: [
      { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
      { model: Cliente, as: "cliente", attributes: ["cliente_id", "nombre", "rut"] },
      { model: Tienda, as: "tienda", attributes: ["tienda_id", "nombre"] },
      { model: Usuario, as: "usuario", attributes: ["usuario_id", "nombre", "email"] },
    ],
  });

  if (!venta) {
    throw new NotFoundError("Venta no encontrada.");
  }

  // Si el usuario es SELLER y la venta no pertenece a su tienda, responder 403
  if (userPayload.rol !== ROLES.ADMIN && venta.tienda_id !== usuario.tienda_id) {
    throw new ForbiddenError("No tiene permisos para consultar ventas de otra tienda.");
  }

  return venta;
}
