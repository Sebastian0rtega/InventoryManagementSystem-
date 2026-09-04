import { Request, Response, NextFunction } from "express";
import * as supplierService from "../services/supplierService";
import { ListaQuery } from "../validators/transaccionales";

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await supplierService.listSuppliers(req.query as unknown as ListaQuery);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proveedor = await supplierService.getSupplierById(Number(req.params.id));
    res.status(200).json(proveedor);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proveedor = await supplierService.createSupplier(req.body);
    res.status(201).json(proveedor);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proveedor = await supplierService.updateSupplier(Number(req.params.id), req.body);
    res.status(200).json(proveedor);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proveedor = await supplierService.deleteSupplier(Number(req.params.id));
    res.status(200).json({
      success: true,
      message: "Proveedor desactivado (soft delete).",
      data: proveedor,
    });
  } catch (err) {
    next(err);
  }
};
