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

  test("los seeders dejaron datos deterministas de inventario", async () => {
    await requireTestDatabase();
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
