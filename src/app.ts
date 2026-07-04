import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import { userRouter } from "./modules/user/users.route";
import { authRouter } from "./modules/auth/auth.route";
import { postsRoute } from "./modules/posts/posts.route";
import { commentRoute } from "./modules/comments/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globaErrorHandler";

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
  res.send({ message: "server is running" });
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use("/api/posts", postsRoute);
app.use("/api/comments", commentRoute);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
