import { Request, Response, NextFunction } from "express";
import * as inventoryService from "../services/inventoryService";
import {
  AjusteInventarioBody,
  ListaInventarioQuery,
} from "../validators/inventario";

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await inventoryService.listInventory(
      req.query as unknown as ListaInventarioQuery,
      req.user!,
    );
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const movements = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const resultado = await inventoryService.listMovements(
      Number(req.params.id),
      req.user!,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
    );
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const adjust = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // El controlador NUNCA escribe movimientos: delega 100% en el servicio
    const resultado = await inventoryService.adjustInventory(
      req.body as AjusteInventarioBody,
      req.user!,
    );
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};
