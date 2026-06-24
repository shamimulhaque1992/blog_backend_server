import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authServices } from "./auth.service";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = await authServices.loginUser(
      req.body,
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      data: { accessToken, refreshToken },
    });
  },
);

export const authController = {
  loginUser,
};
