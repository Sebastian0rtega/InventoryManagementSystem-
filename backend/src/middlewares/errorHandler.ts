import { Request, Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  // Errores de negocio lanzados con AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Duplicados detectados por Sequelize a nivel de base de datos → 409
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: "El recurso ya existe (valor duplicado).",
        details: [],
      },
    });
    return;
  }

// Cualquier otro error
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ha ocurrido un error inesperado en el servidor.",
      // Nunca exponer detalles técnicos al cliente (p. ej. mensajes de PostgreSQL).
      details: [],
    },
  });
};
