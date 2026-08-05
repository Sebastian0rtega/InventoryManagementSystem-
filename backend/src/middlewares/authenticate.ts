import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../services/authService";
import { UnauthorizedError } from "../utils/errors";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token ausente, inválido o con formato incorrecto.");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Token ausente.");
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError("Token inválido o expirado.");
  }
}
