import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);

export default router;
