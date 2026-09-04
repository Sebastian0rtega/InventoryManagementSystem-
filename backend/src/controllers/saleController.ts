import { Request, Response, NextFunction } from "express";
import * as saleService from "../services/saleService";
import { CrearVentaBody, ListaVentasQuery } from "../validators/ventas";

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venta = await saleService.createSale(
      req.body as CrearVentaBody,
      req.user!,
    );
    res.status(201).json(venta);
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await saleService.listSales(
      req.query as unknown as ListaVentasQuery,
      req.user!,
    );
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const venta = await saleService.getSaleById(
      Number(req.params.id),
      req.user!,
    );
    res.status(200).json(venta);
  } catch (err) {
    next(err);
  }
};
