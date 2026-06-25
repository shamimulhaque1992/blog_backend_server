import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { RegisterUserPayload } from "./user.interface";

const getProfile = async (userId: string) => {
  const userProfile = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
    include: {
      profile: true,
    },
  });

  return userProfile;
};

const createUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUsr = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profile: { create: { profilePhoto } },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: createdUsr.id, email: createdUsr.email || email },
    omit: { password: true },
    include: {
      profile: true,
    },
  });

  return user;
};

export const userService = {
  createUser,
  getProfile,
};
