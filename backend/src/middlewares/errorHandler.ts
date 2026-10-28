import { Request, Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AppError } from "../utils/errors";
import { writeOperationalLog } from "../utils/operationalLogger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Errores de negocio lanzados con AppError
  if (err instanceof AppError) {
    res.locals.errorCode = err.code;
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
    res.locals.errorCode = "CONFLICT";
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

  res.locals.errorCode = "INTERNAL_SERVER_ERROR";
  writeOperationalLog({
    level: "error",
    event: "http.unhandled_error",
    requestId: res.locals.requestId,
    method: req.method,
    route: req.route?.path ? `${req.baseUrl}${req.route.path}` : "unmatched",
    status: 500,
    durationMs: Date.now() - (res.locals.startedAt ?? Date.now()),
    errorCode: "INTERNAL_SERVER_ERROR",
    errorMessage: err.message,
    stack: err.stack,
  });
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
