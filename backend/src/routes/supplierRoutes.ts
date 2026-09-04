import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validar } from "../middlewares/validate";
import { ROLES } from "../services/authService";
import * as supplierController from "../controllers/supplierController";
import {
  idParamSchema,
  listaQuerySchema,
  crearProveedorSchema,
  actualizarProveedorSchema,
} from "../validators/transaccionales";

const router = Router();

// Todas las rutas de proveedores requieren autenticacion
router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(listaQuerySchema, "query"),
  supplierController.list,
);
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.WAREHOUSE),
  validar(idParamSchema, "params"),
  supplierController.get,
);
router.post(
  "/",
  authorize(ROLES.ADMIN),
  validar(crearProveedorSchema, "body"),
  supplierController.create,
);
router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  validar(idParamSchema, "params"),
  validar(actualizarProveedorSchema, "body"),
  supplierController.update,
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  validar(idParamSchema, "params"),
  supplierController.remove,
);

export default router;
