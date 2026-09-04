import jwt from "jsonwebtoken";
import request from "supertest";
import { sequelize } from "../models";
import app from "../app";
import { env } from "../config/env";

/**
 * Pruebas de integración DÍA 2: CRUD de proveedores y clientes.
 *
 * Requieren inventory_test_db con migraciones y seeders aplicados:
 *   npm run db:test:setup
 *
 * Si la base no está alcanzable, la suite se salta con aviso (igual
 * que la smoke del DÍA 1) para que `npm test` siga siendo útil.
 *
 * Los tokens se firman localmente con el JWT_SECRET del entorno de test;
 * authenticate() solo verifica la firma y el payload { id, rol }.
 */
function tokenDe(rol: "ADMIN" | "SELLER" | "WAREHOUSE"): string {
  return jwt.sign({ id: 1, rol }, env.jwt.secret, { expiresIn: "1h" });
}

const TOKEN_ADMIN = tokenDe("ADMIN");
const TOKEN_SELLER = tokenDe("SELLER");
const TOKEN_WAREHOUSE = tokenDe("WAREHOUSE");

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

let proveedorId: number;
let clienteId: number;

describe("DÍA 2 · /api/suppliers", () => {
  itDb("POST crea proveedor y normaliza RUT/email/nombre → 201", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        nombre: "  Distribuidora   Test SpA ",
        rut: "77.111.222-3",
        email: "TEST@Distribuidora.Cl",
      });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe("Distribuidora Test SpA");
    expect(res.body.rut).toBe("77111222-3");
    expect(res.body.email).toBe("test@distribuidora.cl");
    expect(res.body.activo).toBe(true);
    proveedorId = res.body.proveedor_id;
  });

  itDb("POST con RUT inválido (dv incorrecto) → 400", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({ nombre: "Proveedor Malo", rut: "11111111-2", email: "malo@prov.cl" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  itDb("POST duplicado (mismo RUT) → 409", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({
        nombre: "Otra Distribuidora",
        rut: "77111222-3",
        email: "otra@dist.cl",
      });
    expect(res.status).toBe(409);
  });

  itDb("GET lista con paginación y filtro por estado → 200", async () => {
    const res = await request(app)
      .get("/api/suppliers?activo=true&page=1&limit=5")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  itDb("GET búsqueda por texto q → 200", async () => {
    const res = await request(app)
      .get("/api/suppliers?q=Test")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  itDb("GET sin token → 401", async () => {
    const res = await request(app).get("/api/suppliers");
    expect(res.status).toBe(401);
  });

  itDb("POST como SELLER → 403", async () => {
    const res = await request(app)
      .post("/api/suppliers")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({ nombre: "No Autorizado", rut: "12345678-5", email: "na@prov.cl" });
    expect(res.status).toBe(403);
  });

  itDb("GET por id inexistente → 404", async () => {
    const res = await request(app)
      .get("/api/suppliers/99999")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(404);
  });

  itDb("PATCH actualiza teléfono → 200", async () => {
    const res = await request(app)
      .patch(`/api/suppliers/${proveedorId}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`)
      .send({ telefono: "+56911112222" });
    expect(res.status).toBe(200);
    expect(res.body.telefono).toBe("+56911112222");
  });

  itDb("DELETE desactiva (soft delete) → 200 y activo=false", async () => {
    const res = await request(app)
      .delete(`/api/suppliers/${proveedorId}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    expect(res.body.data.activo).toBe(false);

    // El registro sigue existiendo en la base (no se eliminó físicamente)
    const { Proveedor } = await import("../models");
    const enDb = await Proveedor.findByPk(proveedorId);
    expect(enDb).not.toBeNull();
  });

  itDb("GET lista como WAREHOUSE (permitido) → 200", async () => {
    const res = await request(app)
      .get("/api/suppliers")
      .set("Authorization", `Bearer ${TOKEN_WAREHOUSE}`);
    expect(res.status).toBe(200);
  });

  itDb("PATCH como WAREHOUSE (no permitido) → 403", async () => {
    const res = await request(app)
      .patch(`/api/suppliers/${proveedorId}`)
      .set("Authorization", `Bearer ${TOKEN_WAREHOUSE}`)
      .send({ telefono: "+56900000000" });
    expect(res.status).toBe(403);
  });
});

describe("DÍA 2 · /api/customers", () => {
  itDb("POST crea cliente y normaliza RUT/email/nombre → 201", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        nombre: "  Camila   Rojas ",
        rut: "14.234.567-8",
        email: "Camila@Correo.COM",
      });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe("Camila Rojas");
    expect(res.body.rut).toBe("14234567-8");
    expect(res.body.email).toBe("camila@correo.com");
    clienteId = res.body.cliente_id;
  });

  itDb("POST email duplicado (case-insensitive) → 409", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`)
      .send({
        nombre: "Otro Cliente",
        rut: "15345678-4",
        email: "CAMILA@correo.com",
      });
    expect(res.status).toBe(409);
  });

  itDb("POST como WAREHOUSE (no permitido) → 403", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${TOKEN_WAREHOUSE}`)
      .send({ nombre: "Warehouse Malo", rut: "18543210-K", email: "wh@correo.cl" });
    expect(res.status).toBe(403);
  });

  itDb("GET lista y búsqueda como SELLER → 200", async () => {
    const res = await request(app)
      .get("/api/customers?q=camila")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  itDb("GET filtro activo=false tras desactivar → 200", async () => {
    await request(app)
      .delete(`/api/customers/${clienteId}`)
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);

    const res = await request(app)
      .get("/api/customers?activo=false")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(200);
    const ids = res.body.data.map((c: { cliente_id: number }) => c.cliente_id);
    expect(ids).toContain(clienteId);
  });

  itDb("DELETE como SELLER → 403", async () => {
    const res = await request(app)
      .delete("/api/customers/99999")
      .set("Authorization", `Bearer ${TOKEN_SELLER}`);
    expect(res.status).toBe(403);
  });

  itDb("GET por id inexistente → 404", async () => {
    const res = await request(app)
      .get("/api/customers/99999")
      .set("Authorization", `Bearer ${TOKEN_ADMIN}`);
    expect(res.status).toBe(404);
  });
});
