import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import { ForbiddenError, ValidationError } from "../utils/errors";
import { ROLES } from "../services/authService";

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const result = await userService.listUsers(page, pageSize);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError("Invalid request data", [
        "El ID debe ser un número entero válido.",
      ]);
    }
    const user = await userService.getUserById(id);

    // Acceso: ADMIN o propietari
    if (req.user?.rol !== ROLES.ADMIN && req.user?.id !== user.usuario_id) {
      throw new ForbiddenError("No tienes permisos para ver este usuario.");
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError("Invalid request data", [
        "El ID debe ser un número entero válido.",
      ]);
    }
    if (!req.user) {
      throw new ForbiddenError("No autenticado.");
    }
    const user = await userService.updateUser(
      id,
      req.user.id,
      req.user.rol,
      req.body,
    );
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError("Invalid request data", [
        "El ID debe ser un número entero válido.",
      ]);
    }
    const user = await userService.updateUserStatus(id, req.body.activo);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
