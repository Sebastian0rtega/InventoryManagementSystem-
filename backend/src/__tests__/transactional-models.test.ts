import { sequelize } from "../models";
import { Inventario } from "../models";
import { requireTestDatabase } from "./testDatabase";

/**
 * Pruebas del dominio transaccional.
 *
 * Las pruebas de integración requieren inventory_test_db y fallan si no está disponible.
 */

describe("smoke: modelos transaccionales sobre inventory_test_db", () => {
  afterAll(async () => {
    await sequelize.close().catch(() => undefined);
  });

  test("conecta a la base de prueba", async () => {
    await requireTestDatabase();
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

  test("los seeders crearon inventario inicial para producto 1 en tienda 1", async () => {
    await requireTestDatabase();
    const inventarioInicial = await Inventario.findOne({
      where: { tienda_id: 1, producto_id: 1 },
    });
    expect(inventarioInicial).not.toBeNull();
    expect(inventarioInicial?.tienda_id).toBe(1);
    expect(inventarioInicial?.producto_id).toBe(1);
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
