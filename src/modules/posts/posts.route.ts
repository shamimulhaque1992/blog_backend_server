import { Router } from "express";
import { postsController } from "./posts.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/posts", postsController.getAllPosts);
router.get("/posts/stats", auth(Role.ADMIN), postsController.getPostsStats);
router.get(
  "/posts/my-posts",
  auth(Role.USER, Role.ADMIN),
  postsController.getAllPosts,
);
router.get("/posts/:postId", postsController.getPostById);
router.post("/posts", auth(Role.USER, Role.ADMIN), postsController.createPost);
router.patch(
  "/posts/:postId",
  auth(Role.USER, Role.ADMIN),
  postsController.updatePost,
);
router.delete("/posts/:postId", auth(Role.USER, Role.ADMIN), postsController.deletePost);

export const postsRoute = router;
