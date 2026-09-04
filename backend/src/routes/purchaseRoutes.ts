import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as purchaseController from "../controllers/purchaseController";
import {
  idParamSchema,
  listaComprasQuerySchema,
  crearCompraSchema,
} from "../validators/compras";

const router = Router();

// Todas las rutas de compras requieren autenticación
router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(crearCompraSchema, "body"),
  purchaseController.create,
);
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(listaComprasQuerySchema, "query"),
  purchaseController.list,
);
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(idParamSchema, "params"),
  purchaseController.get,
);

export default router;
