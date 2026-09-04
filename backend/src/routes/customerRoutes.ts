import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as customerController from "../controllers/customerController";
import {
  idParamSchema,
  listaQuerySchema,
  crearClienteSchema,
  actualizarClienteSchema,
} from "../validators/transaccionales";

const router = Router();

// Todas las rutas de clientes requieren autenticacion
router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(listaQuerySchema, "query"),
  customerController.list,
);
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(idParamSchema, "params"),
  customerController.get,
);
router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(crearClienteSchema, "body"),
  customerController.create,
);
router.patch(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.SELLER),
  validar(idParamSchema, "params"),
  validar(actualizarClienteSchema, "body"),
  customerController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  validar(idParamSchema, "params"),
  customerController.remove,
);

export default router;
