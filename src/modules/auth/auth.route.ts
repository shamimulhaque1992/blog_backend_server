import { Router } from "express";
import { userController } from "../user/users.controller";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.loginUser);

export const authRouter = router;
