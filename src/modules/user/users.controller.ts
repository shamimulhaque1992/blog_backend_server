import { NextFunction, Request, Response } from "express";
import { userService } from "./user.services";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import jwt from "jsonwebtoken";

const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getProfile(req.user?.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile fetched successfully",
      data: result,
    });
  },
);

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: result,
    });
  },
);

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;
    const result = await userService.updateProfile(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile updated successfully",
      data: result,
    });
  },
);

export const userController = {
  createUser,
  getProfile,
  updateProfile,
};
