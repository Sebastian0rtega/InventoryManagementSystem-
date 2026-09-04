import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

type Parte = "body" | "query" | "params";

/**
 * Middleware genérico de validación con Zod.
 * Valida y reemplaza req.body / req.query / req.params con la versión
 * normalizada (transforms incluidos). El controlador no valida nada a mano.
 */
export function validar(schema: ZodSchema, parte: Parte = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req[parte]);
    if (!resultado.success) {
      const detalles = resultado.error.issues.map((i) => {
        const campo = i.path.join(".") || parte;
        return `${campo}: ${i.message}`;
      });
      next(new ValidationError("Invalid request data", detalles));
      return;
    }
    // query es un getter en Express 5 pero un objeto asignable en Express 4;
    // usamos cast defensivo para reemplazarlo con los valores normalizados.
    (req as unknown as Record<Parte, unknown>)[parte] = resultado.data;
    next();
  };
}
