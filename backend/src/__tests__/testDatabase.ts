import { sequelize } from "../models";

let testDatabaseCheck: Promise<void> | undefined;

export function requireTestDatabase(): Promise<void> {
  testDatabaseCheck ??= assertTestDatabaseAvailable();
  return testDatabaseCheck;
}

async function assertTestDatabaseAvailable(): Promise<void> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      sequelize.authenticate(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("timeout after 4 seconds")),
          4000,
        );
      }),
    ]);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo conectar a inventory_test_db; ejecuta npm run db:test:setup. ${reason}`,
    );
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}