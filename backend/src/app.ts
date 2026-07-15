import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler";

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


app.use(errorHandler);

export default app;
