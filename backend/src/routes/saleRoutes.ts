import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as saleController from "../controllers/saleController";
import {
  idParamSchema,
  listaVentasQuerySchema,
  crearVentaSchema,
} from "../validators/ventas";

const router = Router();

// Todas las rutas de ventas requieren autenticación previa
router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(crearVentaSchema, "body"),
  saleController.create,
);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(listaVentasQuerySchema, "query"),
  saleController.list,
);

router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(idParamSchema, "params"),
  saleController.get,
);

export default router;
