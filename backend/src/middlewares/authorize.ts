import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";

/**
 * Middleware de autorización por rol.
 * Debe ejecutarse DESPUÉS de `authenticate`, ya que lee `req.user.rol`.
 *
 * @param roles Roles permitidos para acceder al recurso.
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRol = req.user?.rol;

    if (!userRol || !roles.includes(userRol)) {
      throw new ForbiddenError(
        `No tienes permisos para realizar esta acción. Requiere rol: ${roles.join(", ")}.`,
      );
    }

    next();
  };
}
