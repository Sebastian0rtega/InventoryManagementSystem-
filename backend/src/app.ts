import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import sequelize from './config/db';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import supplierRoutes from "./routes/supplierRoutes";
import customerRoutes from "./routes/customerRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import saleRoutes from "./routes/saleRoutes";

const app = express();


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



app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "inventory-api",
  });
});

app.get('/api/health/database', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'connected', message: 'Conexión a PostgreSQL exitosa.' });
  } catch (error) {
    res.status(500).json({ status: 'disconnected', error: (error as Error).message });
  }
});

app.use((req: Request, res: Response) => {
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
