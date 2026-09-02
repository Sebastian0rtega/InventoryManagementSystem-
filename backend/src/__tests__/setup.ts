/**
 * Setup global de pruebas.
 * Fuerza NODE_ENV=test para que la config de Sequelize use DB_NAME_TEST
 * (inventory_test_db) y nunca la base de desarrollo.
 */
process.env.NODE_ENV = "test";
process.env.DB_NAME_TEST = process.env.DB_NAME_TEST || "inventory_test_db";
