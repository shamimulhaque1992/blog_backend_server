import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionServices } from "./subscription.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const result = await subscriptionServices.checkout(userId as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Subscription created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"]!;
    await subscriptionServices.handleWebhook(event, signature as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook received",
      data: null,
    });
  },
);

export const subscriptionController = {
  createCheckoutSession,
  handleWebhook,
};
