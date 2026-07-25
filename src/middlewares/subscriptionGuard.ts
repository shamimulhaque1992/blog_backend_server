import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";

export const subscriptionGuard = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });
    if (!subscription) {
      throw new Error(
        "No subscription found for the user. Please subscribe to access premium content.",
      );
    }

    if (subscription.status !== "ACTIVE") {
      throw new Error(
        "Subscription cancelled or expired. Please renew your subscription to access premium content.",
      );
    }

    next()
  });
};
