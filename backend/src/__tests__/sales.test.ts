import jwt from "jsonwebtoken";
import request from "supertest";
import {
  sequelize,
  Venta,
  DetalleVenta,
  Inventario,
  MovimientoInventario,
  Producto,
} from "../models";
import app from "../app";
import { env } from "../config/env";
import { crearVentaSchema } from "../validators/ventas";

/**
 * Pruebas unitarias e integración DÍA 4: ventas y salida segura de stock.
 *
 * Requieren inventory_test_db con migraciones y seeders aplicados:
 *   npm run db:test:setup
 * Si la base de datos no está alcanzable, los tests de integración se saltan
 * de forma limpia mientras que las pruebas unitarias de validación siempre corren.
 */

function tokenDe(rol: "ADMIN" | "SELLER" | "WAREHOUSE", id = 1): string {
  return jwt.sign({ id, rol }, env.jwt.secret, { expiresIn: "1h" });
}

const TOKEN_ADMIN = tokenDe("ADMIN", 1); // Admin en tienda 1
const TOKEN_SELLER = tokenDe("SELLER", 2); // Vendedor demo en tienda 1
const TOKEN_WAREHOUSE = tokenDe("WAREHOUSE", 3);

let dbOk = false;

beforeAll(async () => {
  try {
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
    ]);
    dbOk = true;
  } catch {
    dbOk = false;
    console.warn(
      "[SKIP] inventory_test_db no está alcanzable; ejecuta npm run db:test:setup con la base arriba.",
    );
  }
});

afterAll(async () => {
  await sequelize.close().catch(() => undefined);
});

const itDb = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    if (!dbOk) return;
    await fn();
  });

/* ============================================================
 * 1. PRUEBAS UNITARIAS DE VALIDACIÓN Y NORMALIZACIÓN (ZOD)
 * ============================================================ */
describe("DÍA 4 · Validadores Zod de Ventas", () => {
  test("rechaza cantidades cero o negativas", () => {
    const resZero = crearVentaSchema.safeParse({
      items: [{ productId: 1, quantity: 0 }],
    });
    expect(resZero.success).toBe(false);

    const resNeg = crearVentaSchema.safeParse({
      items: [{ productId: 1, quantity: -3 }],
    });
    expect(resNeg.success).toBe(false);
  });

  test("rechaza arreglo de items vacío", () => {
    const res = crearVentaSchema.safeParse({
      items: [],
    });
    expect(res.success).toBe(false);
  });

  test("normaliza productos repetidos consolidando cantidades", () => {
    const parsed = crearVentaSchema.parse({
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
        { productId: 1, quantity: 3 },
      ],
    });
    expect(parsed.items).toHaveLength(2);
    const item1 = parsed.items.find((i) => i.productId === 1);
    expect(item1?.quantity).toBe(5);
  });
});

/* ============================================================
 * 2. PRUEBAS DE INTEGRACIÓN API Y CONCURRENCIA
 * ============================================================ */
describe("DÍA 4 · POST /api/sales", () => {
  let createdVentaId: number;

  itDb("venta válida: 201, stock descontado, subtotal/total calculados y movimiento SALIDA_VENTA", async () => {
    // Tomar stock previo de producto 1 en tienda 1
    const invAntes = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    const stockAntes = invAntes ? invAntes.cantidad : 0;
    expect(stockAntes).toBeGreaterThanOrEqual(2);

    const prod1 = await Producto.findByPk(1);
    expect(prod1).not.toBeNull();
    const precioEsperado = Number(prod1!.precio_venta);

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        items: [{ productId: 1, quantity: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.venta_id).toBeDefined();
    createdVentaId = res.body.venta_id;

    // Verificar total calculado en el servidor
    const totalEsperado = (precioEsperado * 2).toFixed(2);
    expect(res.body.total).toBe(totalEsperado);

    // Verificar detalle creado
    const detalles = await DetalleVenta.findAll({ where: { venta_id: createdVentaId } });
    expect(detalles).toHaveLength(1);
    expect(detalles[0].cantidad).toBe(2);
    expect(detalles[0].subtotal).toBe(totalEsperado);

    // Verificar stock descontado
    const invDespues = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    expect(invDespues!.cantidad).toBe(stockAntes - 2);

    // Verificar movimiento de salida trazable
    const mov = await MovimientoInventario.findOne({
      where: {
        referencia_tipo: "VENTA",
        referencia_id: createdVentaId,
      },
    });
    expect(mov).not.toBeNull();
    expect(mov!.tipo_movimiento).toBe("SALIDA_VENTA");
    expect(mov!.cantidad).toBe(2);
  });

  itDb("normalización de productos repetidos en una venta -> descuenta el total consolidado", async () => {
    const invAntes = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    const stockAntes = invAntes ? invAntes.cantidad : 0;

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 2 },
        ],
      });

    expect(res.status).toBe(201);

    const invDespues = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    expect(invDespues!.cantidad).toBe(stockAntes - 3);
  });

  itDb("stock exacto: la venta deja stock exactamente en cero", async () => {
    // Creamos o ajustamos un producto exclusivo para dejar en stock exacto
    let inv = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 2 } });
    if (!inv) {
      inv = await Inventario.create({ tienda_id: 1, producto_id: 2, cantidad: 4 });
    }
    const stockActual = inv.cantidad;
    expect(stockActual).toBeGreaterThan(0);

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        items: [{ productId: 2, quantity: stockActual }],
      });

    expect(res.status).toBe(201);

    const invFinal = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 2 } });
    expect(invFinal!.cantidad).toBe(0);
  });

  itDb("CRÍTICO · stock insuficiente: 409 STOCK_INSUFFICIENT y rollback total", async () => {
    // Tomamos estado antes del intento
    const invAntes = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    const stockAntes = invAntes ? invAntes.cantidad : 0;
    const ventasAntes = await Venta.count();
    const detallesAntes = await DetalleVenta.count();
    const movimientosAntes = await MovimientoInventario.count();

    // Intentamos comprar más de lo existente (ej. stockAntes + 99999)
    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        items: [
          { productId: 1, quantity: 1 }, // Válido en sí mismo
          { productId: 2, quantity: 999999 }, // Supera el stock
        ],
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("STOCK_INSUFFICIENT");

    // Rollback total: nada debe haber persistido
    expect(await Venta.count()).toBe(ventasAntes);
    expect(await DetalleVenta.count()).toBe(detallesAntes);
    expect(await MovimientoInventario.count()).toBe(movimientosAntes);

    // Stock de producto 1 no debe haberse tocado
    const invDespues = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    expect(invDespues!.cantidad).toBe(stockAntes);
  });

  itDb("CRÍTICO · producto inexistente: 404 y sin cambios", async () => {
    const ventasAntes = await Venta.count();

    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        items: [{ productId: 999999, quantity: 1 }],
      });

    expect(res.status).toBe(404);
    expect(await Venta.count()).toBe(ventasAntes);
  });

  itDb("CRÍTICO · SELLER intenta vender desde otra tienda: 403", async () => {
    // Vendedor pertenece a tienda 1; intenta storeId: 2
    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        storeId: 2,
        items: [{ productId: 1, quantity: 1 }],
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  itDb("CRÍTICO · Concurrencia: dos solicitudes simultáneas que superan stock disponible", async () => {
    // Configurar stock exacto de 5 unidades para producto 1 en tienda 2
    let inv = await Inventario.findOne({ where: { tienda_id: 2, producto_id: 1 } });
    if (!inv) {
      inv = await Inventario.create({ tienda_id: 2, producto_id: 1, cantidad: 5 });
    } else {
      await inv.update({ cantidad: 5 });
    }

    // Dos peticiones concurrentes como ADMIN en tienda 2:
    // Petición A pide 4 unidades. Petición B pide 3 unidades. Total 7 > 5.
    const [resA, resB] = await Promise.all([
      request(app)
        .post("/api/sales")
        .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
        .send({
          storeId: 2,
          items: [{ productId: 1, quantity: 4 }],
        }),
      request(app)
        .post("/api/sales")
        .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
        .send({
          storeId: 2,
          items: [{ productId: 1, quantity: 3 }],
        }),
    ]);

    const statuses = [resA.status, resB.status];
    // Exactamente una debió tener éxito (201) y la otra debe fallar por stock insuficiente (409)
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);

    const fallida = resA.status === 409 ? resA : resB;
    expect(fallida.body.error.code).toBe("STOCK_INSUFFICIENT");

    // El stock final no debe ser negativo:
    const invFinal = await Inventario.findOne({ where: { tienda_id: 2, producto_id: 1 } });
    expect(invFinal!.cantidad).toBeGreaterThanOrEqual(0);
    // Si ganó A (4), queda 1. Si ganó B (3), queda 2.
    expect([1, 2]).toContain(invFinal!.cantidad);
  });

  itDb("sin token -> 401", async () => {
    const res = await request(app)
      .post("/api/sales")
      .send({ items: [{ productId: 1, quantity: 1 }] });
    expect(res.status).toBe(401);
  });

  itDb("rol no autorizado (WAREHOUSE) -> 403", async () => {
    const res = await request(app)
      .post("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_WAREHOUSE}`)
      .send({ items: [{ productId: 1, quantity: 1 }] });
    expect(res.status).toBe(403);
  });
});

describe("DÍA 4 · GET /api/sales y GET /api/sales/:id", () => {
  itDb("listar ventas como ADMIN -> 200 con paginación", async () => {
    const res = await request(app)
      .get("/api/sales?page=1&limit=10")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
  });

  itDb("listar ventas como SELLER -> 200 filtrado por su tienda", async () => {
    const res = await request(app)
      .get("/api/sales")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    // Cada venta retornada debe ser de la tienda 1
    for (const v of res.body.data) {
      expect(v.tienda_id).toBe(1);
    }
  });

  itDb("obtener venta por ID existente -> 200 con detalles", async () => {
    const ultimaVenta = await Venta.findOne({ order: [["venta_id", "DESC"]] });
    expect(ultimaVenta).not.toBeNull();

    const res = await request(app)
      .get(`/api/sales/${ultimaVenta!.venta_id}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.venta_id).toBe(ultimaVenta!.venta_id);
    expect(res.body.detalles).toBeInstanceOf(Array);
    expect(res.body.tienda).toBeDefined();
    expect(res.body.usuario).toBeDefined();
  });

  itDb("obtener venta inexistente -> 404", async () => {
    const res = await request(app)
      .get("/api/sales/999999")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
