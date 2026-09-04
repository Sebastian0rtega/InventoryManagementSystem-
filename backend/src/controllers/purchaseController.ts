import { Request, Response, NextFunction } from "express";
import * as purchaseService from "../services/purchaseService";
import { CrearCompraBody, ListaComprasQuery } from "../validators/compras";

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const compra = await purchaseService.createPurchase(
      req.body as CrearCompraBody,
      req.user!.id,
    );
    res.status(201).json(compra);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await purchaseService.listPurchases(req.query as unknown as ListaComprasQuery);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const compra = await purchaseService.getPurchaseById(Number(req.params.id));
    res.status(200).json(compra);
  } catch (err) {
    next(err);
  }
};
