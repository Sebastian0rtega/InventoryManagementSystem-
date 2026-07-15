import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Seguridad base y parsing de peticiones
app.use(helmet());
app.use(cors());
app.use(express.json());

// Endpoint de salud obligatorio del Sprint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'inventory-api'
  });
});

// Manejador de rutas inexistentes (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `La ruta ${req.originalUrl} no existe en este servidor.`
    }
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;