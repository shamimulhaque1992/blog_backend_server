import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? (req.headers.authorization as string).split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error("No token provided");
    }

    const verifiedToken = jwtUtils.verifyToken(
      token as string,
      config.jwt_access_token_secret,
    );
    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }
    const { id, email, name, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new Error("You do not have permission to access this resource");
    }

    const user = await prisma.user.findUnique({
      where: { id, name, email, role },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.activeStatus === "BLOCKED") {
      throw new Error("User is blocked");
    }
    req.user = {
      email,
      name,
      id,
      role,
    };
    next();
  });
};
