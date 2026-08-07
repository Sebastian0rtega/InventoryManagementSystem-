/**
 * Clase base para errores que se devolverán en la API.
 * Obliga a usar el formato de error estandarizado de la aplicación:
 *
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid request data",
 *     "details": []
 *   }
 * }
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(statusCode: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/** Error de datos de entrada inválidos (400). */
export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details: unknown[] = []) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

/** Error de autenticación / credenciales (401). */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details: unknown[] = []) {
    super(401, "UNAUTHORIZED", message, details);
  }
}

/** Error de permisos insuficientes (403). */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details: unknown[] = []) {
    super(403, "FORBIDDEN", message, details);
  }
}

/** Error de recurso no encontrado (404). */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details: unknown[] = []) {
    super(404, "NOT_FOUND", message, details);
  }
}

/** Error de conflicto (409), p. ej. correo duplicado. */
export class ConflictError extends AppError {
  constructor(message = "Conflict", details: unknown[] = []) {
    super(409, "CONFLICT", message, details);
  }
}
