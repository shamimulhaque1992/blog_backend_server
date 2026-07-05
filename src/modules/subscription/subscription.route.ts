import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post(
  "/checkout",
  auth(Role.USER, Role.ADMIN, Role.ADMIN),
  subscriptionController.createCheckoutSession,
);

router.post("/webhook", subscriptionController.handleWebhook);

export const subscriptionRoutes = router;
