import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize, Compra, DetalleCompra, Inventario, MovimientoInventario } from "../models";
import app from "../app";
import { env } from "../config/env";

/**
 * Pruebas de integración DÍA 3: compras y entrada de stock atómica.
 *
 * Requieren inventory_test_db con migraciones y seeders aplicados:
 *   npm run db:test:setup
 * Si la base no está alcanzable, la suite se salta con aviso.
 */
function tokenDe(rol: "ADMIN" | "SELLER" | "WAREHOUSE"): string {
  return jwt.sign({ id: 1, rol }, env.jwt.secret, { expiresIn: "1h" });
}

const TOKEN_ADMIN = tokenDe("ADMIN");
const TOKEN_SELLER = tokenDe("SELLER");

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

function bodyCompra(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    supplierId: 1,
    storeId: 1,
    documentType: "FACTURA",
    documentNumber: `F-TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    paymentMethod: "TRANSFERENCIA",
    items: [{ productId: 1, quantity: 5, unitCost: 12000 }],
    ...overrides,
  };
}

let compraId: number;
let docNumero: string;

describe("DÍA 3 · POST /api/purchases", () => {
  itDb("compra válida → 201, total calculado en servidor, stock y movimientos creados", async () => {
    docNumero = `F-OK-${Date.now()}`;
    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send(bodyCompra({ documentNumber: docNumero, items: [
        { productId: 1, quantity: 5, unitCost: 12000 },
        { productId: 2, quantity: 3, unitCost: 2500.5 },
      ] }));

    expect(res.status).toBe(201);
    // Total en servidor con decimal exacto: 5*12000 + 3*2500.5 = 67501.50
    expect(res.body.total).toBe("67501.50");
    compraId = res.body.compra_id;

    const detalles = await DetalleCompra.findAll({ where: { compra_id: compraId } });
    expect(detalles).toHaveLength(2);

    const movimientos = await MovimientoInventario.findAll({
      where: { referencia_tipo: "COMPRA", referencia_id: compraId },
    });
    expect(movimientos).toHaveLength(2);
    movimientos.forEach((m) => expect(m.tipo_movimiento).toBe("ENTRADA_COMPRA"));

    const inv = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    expect(inv).not.toBeNull();
    expect(inv!.cantidad).toBeGreaterThanOrEqual(5);
  });

  itDb("documento duplicado (mismo proveedor+tipo+número) → 409", async () => {
    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send(bodyCompra({ documentNumber: docNumero }));
    expect(res.status).toBe(409);
  });

  itDb("PRUEBA CRÍTICA: producto inexistente en 2° detalle → rollback total", async () => {
    // Tomamos el stock previo del producto 1 para comparar después.
    const invAntes = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    const stockAntes = invAntes ? invAntes.cantidad : 0;
    const comprasAntes = await Compra.count();
    const detallesAntes = await DetalleCompra.count();
    const movimientosAntes = await MovimientoInventario.count();

    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send(bodyCompra({
        documentNumber: `F-ROLLBACK-${Date.now()}`,
        items: [
          { productId: 1, quantity: 7, unitCost: 1000 },  // válido
          { productId: 999999, quantity: 1, unitCost: 500 }, // inexistente
        ],
      }));

    expect(res.status).toBe(404);

    // Nada debe haber quedado creado ni incrementado:
    expect(await Compra.count()).toBe(comprasAntes);
    expect(await DetalleCompra.count()).toBe(detallesAntes);
    expect(await MovimientoInventario.count()).toBe(movimientosAntes);

    const invDespues = await Inventario.findOne({ where: { tienda_id: 1, producto_id: 1 } });
    expect(invDespues ? invDespues.cantidad : 0).toBe(stockAntes);
  });

  itDb("sin token → 401", async () => {
    const res = await request(app).post("/api/purchases").send(bodyCompra());
    expect(res.status).toBe(401);
  });

  itDb("como SELLER → 403", async () => {
    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send(bodyCompra());
    expect(res.status).toBe(403);
  });

  itDb("cantidad 0 o costo negativo → 400", async () => {
    const res = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send(bodyCompra({ items: [{ productId: 1, quantity: 0, unitCost: 100 }] }));
    expect(res.status).toBe(400);

    const res2 = await request(app)
      .post("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send(bodyCompra({ items: [{ productId: 1, quantity: 1, unitCost: -5 }] }));
    expect(res2.status).toBe(400);
  });
});

describe("DÍA 3 · GET /api/purchases", () => {
  itDb("lista con paginación → 200", async () => {
    const res = await request(app)
      .get("/api/purchases?page=1&limit=5")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  itDb("por id incluye detalles → 200", async () => {
    const res = await request(app)
      .get(`/api/purchases/${compraId}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    expect(res.body.detalles).toHaveLength(2);
    expect(res.body.proveedor).toBeDefined();
  });

  itDb("id inexistente → 404", async () => {
    const res = await request(app)
      .get("/api/purchases/999999")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(404);
  });

  itDb("lista como SELLER → 403", async () => {
    const res = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);
    expect(res.status).toBe(403);
  });
});
