import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categoryService";

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.listCategories();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await categoryService.getCategoryById(id);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body.nombre);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await categoryService.updateCategory(id, req.body.nombre);
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await categoryService.deleteCategory(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
