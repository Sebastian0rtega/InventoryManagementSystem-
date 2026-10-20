/**
 * Setup global de pruebas.
 * Fuerza NODE_ENV=test para que la config de Sequelize use DB_NAME_TEST
 * (inventory_test_db) y nunca la base de desarrollo.
 */
process.env.NODE_ENV = "test";
process.env.PORT ??= "3000";
process.env.DB_HOST ??= "127.0.0.1";
process.env.DB_PORT ??= "5432";
process.env.DB_NAME ??= "inventory_db";
process.env.DB_USER ??= "admin";
process.env.DB_PASSWORD ??= "change_me";
process.env.DB_NAME_TEST = process.env.DB_NAME_TEST || "inventory_test_db";
process.env.JWT_SECRET ??= "test-only-secret-at-least-32-characters-long";
