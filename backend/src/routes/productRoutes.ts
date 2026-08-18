import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { ROLES } from "../services/authService";
import * as productController from "../controllers/productController";

const router = Router();

// Todas las rutas de productos requieren autenticación
router.use(authenticate);

router.get("/", productController.list);
router.get("/:id", productController.get);
router.post("/", authorize(ROLES.ADMIN), productController.create);
router.patch("/:id", authorize(ROLES.ADMIN), productController.update);
router.delete("/:id", authorize(ROLES.ADMIN), productController.remove);

export default router;
