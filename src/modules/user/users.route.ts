import { Request, Response, Router } from "express";
import { userController } from "./users.controller";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Users route");
});

router.post("/register", userController.createUser);

export const userRouter = router;
