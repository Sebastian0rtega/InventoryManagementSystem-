import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { ROLES } from "../services/authService";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// Todas las rutas de categorias requieren autenticacion
router.use(authenticate);

router.get("/", categoryController.list);
router.get("/:id", categoryController.get);
router.post("/", authorize(ROLES.ADMIN), categoryController.create);
router.patch("/:id", authorize(ROLES.ADMIN), categoryController.update);
router.delete("/:id", authorize(ROLES.ADMIN), categoryController.remove);

export default router;
