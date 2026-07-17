import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";
import sequelize from './config/db';
const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());


app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "inventory-api",
  });
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

app.get('/api/health/database', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'connected', message: 'Conexión a PostgreSQL exitosa.' });
  } catch (error) {
    res.status(500).json({ status: 'disconnected', error: (error as Error).message });
  }
});

app.use(errorHandler);

export default app;
