import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./users.controller";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Users route");
});

router.get(
  "/me",
  auth(Role.ADMIN, Role.USER, Role.ADMIN),
  userController.getProfile,
);

router.put(
  "/my-profile",
  auth(Role.ADMIN, Role.USER, Role.ADMIN),
  userController.updateProfile,
);
router.post("/register", userController.createUser);

export const userRouter = router;
