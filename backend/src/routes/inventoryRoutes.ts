import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as inventoryController from "../controllers/inventoryController";
import {
  ajusteInventarioSchema,
  idParamSchema,
  listaInventarioQuerySchema,
} from "../validators/inventario";

const router = Router();

// Todas las rutas de inventario requieren autenticación
router.use(authenticate);

/**
 * GET /api/inventory — listado de stock por tienda.
 * Autenticado; SELLER/WAREHOUSE limitados a su tienda (se fuerza en el servicio).
 */
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER, ROLES.WAREHOUSE),
  validar(listaInventarioQuerySchema, "query"),
  inventoryController.list,
);

/**
 * POST /api/inventory/adjustments — ajuste manual de stock (ADMIN · WAREHOUSE).
 * El movimiento queda registrado en la bitácora desde el servicio.
 */
router.post(
  "/adjustments",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(ajusteInventarioSchema, "body"),
  inventoryController.adjust,
);

/**
 * GET /api/inventory/:id/movements — bitácora de movimientos (ADMIN · WAREHOUSE).
 * SOLO LECTURA: no existe POST/PUT/DELETE para movimientos; el historial
 * se genera exclusivamente desde los servicios de negocio.
 */
router.get(
  "/:id/movements",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(idParamSchema, "params"),
  inventoryController.movements,
);

export default router;
