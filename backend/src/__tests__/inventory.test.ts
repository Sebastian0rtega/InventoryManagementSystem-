import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize, Inventario, MovimientoInventario, Producto } from "../models";
import app from "../app";
import { env } from "../config/env";
import { calcularEstado } from "../services/inventoryService";
import { ajusteInventarioSchema, listaInventarioQuerySchema } from "../validators/inventario";

/**
 * Pruebas DÍA 5 · Inventario y movimientos.
 * Requieren inventory_test_db con migraciones y seeders aplicados:
 *   npm run db:test:setup
 */

function tokenDe(rol: "ADMIN" | "SELLER" | "WAREHOUSE", id = 1): string {
  return jwt.sign({ id, rol }, env.jwt.secret, { expiresIn: "1h" });
}

const TOKEN_ADMIN = tokenDe("ADMIN", 1);
const TOKEN_SELLER = tokenDe("SELLER", 2);
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
    console.warn("[SKIP] inventory_test_db no está alcanzable; ejecuta npm run db:test:setup.");
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
 * 1. Pruebas unitarias (sin BD)
 * ============================================================ */
describe("DÍA 5 · calcularEstado", () => {
  test("OUT cuando stock = 0", () => {
    expect(calcularEstado(0, 5)).toBe("OUT");
  });

  test("LOW cuando 0 < stock <= stock_minimo", () => {
    expect(calcularEstado(1, 5)).toBe("LOW");
    expect(calcularEstado(5, 5)).toBe("LOW");
  });

  test("NORMAL cuando stock > stock_minimo", () => {
    expect(calcularEstado(6, 5)).toBe("NORMAL");
  });
});

describe("DÍA 5 · Validadores Zod de inventario", () => {
  test("ajuste sin motivo es rechazado", () => {
    const res = ajusteInventarioSchema.safeParse({
      productId: 1,
      tipo: "ENTRADA",
      cantidad: 5,
    });
    expect(res.success).toBe(false);
  });

  test("ajuste con tipo inválido es rechazado", () => {
    const res = ajusteInventarioSchema.safeParse({
      productId: 1,
      tipo: "ROBO",
      cantidad: 5,
      motivo: "prueba",
    });
    expect(res.success).toBe(false);
  });

  test("ajuste válido pasa y cantidad cero se rechaza", () => {
    const ok = ajusteInventarioSchema.safeParse({
      productId: 1,
      tipo: "SALIDA",
      cantidad: 2,
      motivo: "merma encontrada",
    });
    expect(ok.success).toBe(true);

    const cero = ajusteInventarioSchema.safeParse({
      productId: 1,
      tipo: "SALIDA",
      cantidad: 0,
      motivo: "merma encontrada",
    });
    expect(cero.success).toBe(false);
  });

  test("query de listado: status fuera de catálogo es rechazado", () => {
    const res = listaInventarioQuerySchema.safeParse({ status: "AGOTADO" });
    expect(res.success).toBe(false);
  });
});

/* ============================================================
 * 2. Pruebas de integración (requieren BD de pruebas)
 * ============================================================ */
describe("DÍA 5 · GET /api/inventory", () => {
  itDb("ADMIN obtiene listado con status calculado y paginación", async () => {
    const res = await request(app)
      .get("/api/inventory?page=1&limit=10")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    for (const item of res.body.data) {
      expect(["NORMAL", "LOW", "OUT"]).toContain(item.status);
      expect(item.stock_actual).toBeGreaterThanOrEqual(0);
    }
  });

  itDb("filtro status=OUT devuelve solo filas con stock 0", async () => {
    // Dejar un registro con stock 0
    let inv = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 2 } });
    if (!inv) {
      inv = await Inventario.create({ tienda_id: 1, producto_id: 2, cantidad: 0, stock_minimo: 2 });
    } else {
      await inv.update({ cantidad: 0 });
    }

    const res = await request(app)
      .get("/api/inventory?status=OUT")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    for (const item of res.body.data) {
      expect(item.status).toBe("OUT");
    }
  });

  itDb("filtro search por nombre de producto funciona", async () => {
    const prod = await Producto.findOne();
    expect(prod).not.toBeNull();

    const res = await request(app)
      .get(`/api/inventory?search=${encodeURIComponent(prod!.nombre.slice(0, 4))}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  itDb("SELLER solo ve inventario de su tienda", async () => {
    const res = await request(app)
      .get("/api/inventory")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);

    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item.tienda_id).toBe(1);
    }
  });

  itDb("sin token -> 401", async () => {
    const res = await request(app).get("/api/inventory");
    expect(res.status).toBe(401);
  });
});

describe("DÍA 5 · POST /api/inventory/adjustments", () => {
  itDb("ENTRADA incrementa stock y crea movimiento con motivo y usuario", async () => {
    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        storeId: 1,
        productId: 3,
        tipo: "ENTRADA",
        cantidad: 7,
        motivo: "conteo físico: faltante detectado",
      });

    expect(res.status).toBe(201);
    expect(res.body.inventario.stock_actual).toBeGreaterThanOrEqual(7);
    expect(res.body.ajuste.motivo).toBe("conteo físico: faltante detectado");
    expect(res.body.ajuste.usuario.usuario_id).toBe(1);

    const mov = await MovimientoInventario.findByPk(res.body.ajuste.movimiento_id);
    expect(mov).not.toBeNull();
    expect(mov!.tipo_movimiento).toBe("AJUSTE");
    expect(mov!.motivo).toBe("conteo físico: faltante detectado");
    expect(mov!.usuario_id).toBe(1);
  });

  itDb("CRÍTICO · SALIDA no puede dejar stock bajo cero: 409 y sin movimiento", async () => {
    const inv = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 3 } });
    const stockAntes = inv ? inv.cantidad : 0;
    const movsAntes = await MovimientoInventario.count();

    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        storeId: 1,
        productId: 3,
        tipo: "SALIDA",
        cantidad: stockAntes + 100,
        motivo: "intento de salida inválida",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("STOCK_INSUFFICIENT");
    expect(await MovimientoInventario.count()).toBe(movsAntes);

    const invDespues = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 3 } });
    expect(invDespues!.cantidad).toBe(stockAntes);
  });

  itDb("SALIDA válida descuenta stock exactamente hasta 0 permitido", async () => {
    const inv = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 3 } });
    expect(inv).not.toBeNull();
    const stockAntes = inv!.cantidad;
    if (stockAntes === 0) return;

    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        storeId: 1,
        productId: 3,
        tipo: "SALIDA",
        cantidad: stockAntes,
        motivo: "liquidación total del producto",
      });

    expect(res.status).toBe(201);
    expect(res.body.inventario.stock_actual).toBe(0);
    expect(res.body.inventario.status).toBe("OUT");
  });

  itDb("SELLER no puede ajustar inventario: 403", async () => {
    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        productId: 1,
        tipo: "ENTRADA",
        cantidad: 1,
        motivo: "vendedor sin permisos",
      });

    expect(res.status).toBe(403);
  });

  itDb("WAREHOUSE en tienda ajena: 403", async () => {
    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_WAREHOUSE}`)
      .send({
        storeId: 2,
        productId: 1,
        tipo: "ENTRADA",
        cantidad: 1,
        motivo: "bodega en tienda equivocada",
      });

    expect(res.status).toBe(403);
  });

  itDb("motivo ausente -> 400 VALIDATION_ERROR", async () => {
    const res = await request(app)
      .post("/api/inventory/adjustments")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        storeId: 1,
        productId: 1,
        tipo: "ENTRADA",
        cantidad: 1,
      });

    expect(res.status).toBe(400);
  });
});

describe("DÍA 5 · GET /api/inventory/:id/movements (solo lectura)", () => {
  itDb("ADMIN consulta movimientos: 200 con bitácora", async () => {
    const inv = await Inventario.findOne({ where: { tienda_id: 1 } });
    expect(inv).not.toBeNull();

    const res = await request(app)
      .get(`/api/inventory/${inv!.inventario_id}/movements`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.inventario.inventario_id).toBe(inv!.inventario_id);
  });

  itDb("SELLER no puede consultar movimientos: 403", async () => {
    const inv = await Inventario.findOne({ where: { tienda_id: 1 } });
    const res = await request(app)
      .get(`/api/inventory/${inv!.inventario_id}/movements`)
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);

    expect(res.status).toBe(403);
  });

  itDb("POST sobre movimientos no existe: 404 (no se fabrica historial)", async () => {
    const inv = await Inventario.findOne({ where: { tienda_id: 1 } });
    const res = await request(app)
      .post(`/api/inventory/${inv!.inventario_id}/movements`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({ cantidad: 10 });

    expect(res.status).toBe(404);
  });

  itDb("inventario inexistente -> 404", async () => {
    const res = await request(app)
      .get("/api/inventory/999999/movements")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    expect(res.status).toBe(404);
  });
});
