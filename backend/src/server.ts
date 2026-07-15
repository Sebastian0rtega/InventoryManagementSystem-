import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(
    ` Servidor ejecutándose en modo [${env.nodeEnv}] en http://localhost:${env.port}`,
  );
});

// Manejo seguro del cierre del proceso (Graceful Shutdown)
process.on("SIGTERM", () => {
  console.log("Señal SIGTERM recibida. Cerrando servidor de manera segura...");
  server.close(() => {
    console.log("Servidor HTTP cerrado.");
  });
});
