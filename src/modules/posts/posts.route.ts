import { Router } from "express";
import { postsController } from "./posts.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", postsController.getAllPosts);
router.get("/stats", auth(Role.ADMIN), postsController.getPostsStats);
router.get(
  "/my-posts",
  auth(Role.USER, Role.ADMIN),
  postsController.getMyPosts,
);
router.get("/:postId", postsController.getPostById);
router.post("/", auth(Role.USER, Role.ADMIN), postsController.createPost);
router.patch(
  "/:postId",
  auth(Role.USER, Role.ADMIN),
  postsController.updatePost,
);
router.delete("/:postId", auth(Role.USER, Role.ADMIN), postsController.deletePost);

export const postsRoute = router;
