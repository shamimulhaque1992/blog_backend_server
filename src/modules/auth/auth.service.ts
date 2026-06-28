import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUsr } from "./auth.interface";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUsr) => {
  const { email, password } = payload;
  //   check whether the user exists or not
  const isUserExists = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  // decode and compare the password
  const isMatchPassword = await bcrypt.compare(
    password,
    isUserExists?.password as string,
  );
  if (!isMatchPassword) {
    throw new Error("Password did not match");
  }
  const userPayload = {
    id: isUserExists.id,
    email: isUserExists.email,
    name: isUserExists.name,
    role: isUserExists.role,
  };
  // create the token
  const accessToken = jwtUtils.createToken(
    userPayload,
    config.jwt_access_token_secret,
    config.jwt_access_token_expiry as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    userPayload,
    config.jwt_refresh_token_secret,
    config.jwt_refresh_token_expiry as SignOptions,
  );

  // send the token in response

  return {
    accessToken,
    refreshToken,
    ...userPayload,
  };
};

const refreshToken = async (token: string) => {
  // verify the token
  const verifiedToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_token_secret,
  );

  if (!verifiedToken.success) {
    throw new Error(verifiedToken.error);
  }

  const { id, email, name, role } = verifiedToken.data as JwtPayload;
  console.log("🚀 ~ refreshToken ~ verifiedToken.data:", verifiedToken.data);

  // check whether the user exists or not
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (!user) {
    throw new Error("User does not exist");
  }

  if (user.activeStatus === "BLOCKED") {
    throw new Error("User is blocked");
  }

  // create the token

  const jwtPayload = { id, email, name, role };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_token_secret,
    config.jwt_access_token_expiry as SignOptions,
  );
  return {
    accessToken,
  };
};

export const authServices = {
  loginUser,
  refreshToken,
};
