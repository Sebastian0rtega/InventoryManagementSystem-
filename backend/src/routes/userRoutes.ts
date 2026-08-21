import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import * as userController from "../controllers/userController";
import { ROLES } from "../services/authService";

const router = Router();

// Todas las rutas de usuarios requieren autenticación.
router.use(authenticate);

router.get("/", authorize(ROLES.ADMIN), userController.listUsers);
router.get("/:id", userController.getUser);
router.post("/", authorize(ROLES.ADMIN), userController.createUser);
router.patch("/:id/status", authorize(ROLES.ADMIN), userController.updateUserStatus);
router.patch("/:id", userController.updateUser);

export default router;
