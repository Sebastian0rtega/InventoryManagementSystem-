import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import { requestId } from "./middlewares/requestId";
import { requestLogger } from "./middlewares/requestLogger";
import { writeOperationalLog } from "./utils/operationalLogger";
import sequelize from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import customerRoutes from "./routes/customerRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import saleRoutes from "./routes/saleRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "./docs/openapi";

const app = express();

app.use(requestId);
app.use(requestLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/inventory", inventoryRoutes);



/**
 * DÍA 6 · Documentación OpenAPI.
 * UI interactiva en /api/docs · JSON crudo en /api/docs.json.
 */
app.get("/api/docs.json", (_req: Request, res: Response) => {
  res.status(200).json(openapiSpec);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { customSiteTitle: "Inventory API Docs" }),
);

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "inventory-api",
  });
});

app.get("/api/health/database", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: "connected",
      message: "Conexión a PostgreSQL exitosa.",
    });
  } catch (error) {
    res.locals.errorCode = "DATABASE_UNAVAILABLE";
    writeOperationalLog({
      level: "error",
      event: "health.database_unavailable",
      requestId: res.locals.requestId,
      method: "GET",
      route: "/api/health/database",
      status: 503,
      durationMs: Date.now() - res.locals.startedAt,
      errorCode: "DATABASE_UNAVAILABLE",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    res.status(503).json({
      status: "disconnected",
      message: "No se pudo conectar a la base de datos.",
    });
  }
});

app.use((req: Request, res: Response) => {
  res.locals.errorCode = "NOT_FOUND";
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `La ruta ${req.originalUrl} no existe en este servidor.`,
    },
  });
});


app.use(errorHandler);

export default app;
