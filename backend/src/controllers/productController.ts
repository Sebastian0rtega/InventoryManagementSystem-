import { Request, Response, NextFunction } from "express";
import * as productService from "../services/productService";

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await productService.listProducts(req.query as Record<string, unknown>);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "El ID debe ser un número entero válido." });
      return;
    }
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "El ID debe ser un número entero válido." });
      return;
    }
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "El ID debe ser un número entero válido." });
      return;
    }
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
