import { sequelize } from "../models";
import { Inventario } from "../models";

/**
 * Pruebas del dominio transaccional.
 *
 * - Las verificaciones sin conexión (modelos, asociaciones, config) corren siempre.
 * - Las de integración contra inventory_test_db se saltan con un aviso si la
 *   base de prueba no está alcanzable, para que `npm test` siga siendo útil
 *   sin infraestructura levantada.
 */
async function dbDisponible(): Promise<boolean> {
  // Con IP inalcanzable el connect puede colgarse ~20s; acotamos a 4s.
  try {
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

describe("smoke: modelos transaccionales sobre inventory_test_db", () => {
  afterAll(async () => {
    await sequelize.close().catch(() => undefined);
  });

  test("conecta a la base de prueba", async () => {
    if (!(await dbDisponible())) {
      console.warn(
        "[SKIP] inventory_test_db no está alcanzable; levanta PostgreSQL y ejecuta: npm run db:test:setup",
      );
      return;
    }
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    expect(tables).toEqual(
      expect.arrayContaining([
        "proveedores",
        "clientes",
        "inventarios",
        "compras",
        "detalle_compras",
        "ventas",
        "detalle_ventas",
        "movimientos_inventarios",
      ]),
    );
  });

  test("los seeders dejaron datos deterministas de inventario", async () => {
    if (!(await dbDisponible())) {
      console.warn(
        "[SKIP] inventory_test_db no está alcanzable; levanta PostgreSQL y ejecuta: npm run db:test:setup",
      );
      return;
    }
    const registros = await Inventario.findAll({ order: [["inventario_id", "ASC"]] });
    expect(registros.length).toBeGreaterThanOrEqual(3);
    const primera = registros[0];
    expect(primera.tienda_id).toBe(1);
    expect(primera.producto_id).toBe(1);
    expect(Number(primera.cantidad)).toBe(100);
  });

  test("asociaciones cargadas sin duplicados (alias consistentes)", () => {
    // Si una asociación estuviera duplicada, Sequelize lanzaría error al importar
    // los modelos. Además verificamos que los alias existan.
    const assoc = (Inventario as unknown as {
      associations: Record<string, unknown>;
    }).associations;
    expect(assoc).toHaveProperty("tienda");
    expect(assoc).toHaveProperty("producto");
    expect(assoc).toHaveProperty("movimientos");
  });

  test("en NODE_ENV=test la conexión nunca apunta a la base de desarrollo", () => {
    expect(sequelize.getDatabaseName()).not.toBe(process.env.DB_NAME);
    expect(sequelize.getDatabaseName()).toBe("inventory_test_db");
  });
});
