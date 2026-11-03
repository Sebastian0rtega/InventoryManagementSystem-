import app from "./app";
import { env } from "./config/env";
import sequelize from "./config/db";
import { writeOperationalLog } from "./utils/operationalLogger";

const shutdownTimeoutMs = 15_000;
let isShuttingDown = false;

const server = app.listen(env.port, () => {
  writeOperationalLog({
    level: "info",
    event: "server.started",
    nodeEnv: env.nodeEnv,
    port: env.port,
  });
});

const shutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  writeOperationalLog({
    level: "info",
    event: "server.shutdown_started",
    signal,
    timeoutMs: shutdownTimeoutMs,
  });

  const forceShutdownTimer = setTimeout(() => {
    writeOperationalLog({
      level: "error",
      event: "server.shutdown_timeout",
      signal,
      timeoutMs: shutdownTimeoutMs,
    });
    server.closeAllConnections();
    process.exit(1);
  }, shutdownTimeoutMs);
  forceShutdownTimer.unref();

  server.close((serverError) => {
    if (serverError) {
      writeOperationalLog({
        level: "error",
        event: "server.http_close_failed",
        errorMessage: serverError.message,
      });
      process.exitCode = 1;
    }

    void sequelize
      .close()
      .then(() => {
        writeOperationalLog({
          level: "info",
          event: "server.shutdown_complete",
          signal,
        });
      })
      .catch((error: unknown) => {
        writeOperationalLog({
          level: "error",
          event: "server.database_close_failed",
          errorMessage:
            error instanceof Error ? error.message : String(error),
        });
        process.exitCode = 1;
      })
      .finally(() => clearTimeout(forceShutdownTimer));
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
