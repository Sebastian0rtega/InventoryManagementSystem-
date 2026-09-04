import { Request, Response, NextFunction } from "express";
import * as customerService from "../services/customerService";
import { ListaQuery } from "../validators/transaccionales";

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resultado = await customerService.listCustomers(req.query as unknown as ListaQuery);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await customerService.getCustomerById(Number(req.params.id));
    res.status(200).json(cliente);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await customerService.createCustomer(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await customerService.updateCustomer(Number(req.params.id), req.body);
    res.status(200).json(cliente);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cliente = await customerService.deleteCustomer(Number(req.params.id));
    res.status(200).json({
      success: true,
      message: "Cliente desactivado (soft delete).",
      data: cliente,
    });
  } catch (err) {
    next(err);
  }
};
