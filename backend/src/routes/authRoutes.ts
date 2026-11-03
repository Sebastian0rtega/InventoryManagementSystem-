import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { loginRateLimit } from "../middlewares/loginRateLimit";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.register);
router.post("/login", loginRateLimit, authController.login);
router.get("/me", authenticate, authController.me);

export default router;
