import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.get("/", async (req: Request, res: Response) => {
  const user = await prisma.user.findMany();
  console.log("🚀 ~ user:", user);
  res.send({ data: user });
});

app.post("/api/users/register", async (req: Request, res: Response) => {
  const { name, email, password, profilePhoto } = req.body;

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
    data: { name, email, password: hashedPassword },
  });

  await prisma.profile.create({
    data: {
      userId: createdUsr.id,
      profilePhoto,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: createdUsr.id, email: createdUsr.email || email },
    omit: { password: true },
    include: {
      profileId: true,
    },
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: user,
  });
});
export default app;
