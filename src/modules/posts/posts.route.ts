import { Router } from "express";
import { postsController } from "./posts.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { subscriptionGuard } from "../../middlewares/subscriptionGuard";

const router = Router();

router.get("/", postsController.getAllPosts);
router.get(
  "/premium",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  subscriptionGuard(),
  postsController.getPremiumPosts,
);
router.get("/stats", auth(Role.ADMIN), postsController.getPostsStats);
router.get(
  "/my-posts",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  postsController.getMyPosts,
);
router.get("/:postId", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postsController.getPostById);
router.post("/", auth(Role.USER, Role.ADMIN, Role.AUTHOR), postsController.createPost);
router.patch(
  "/:postId",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  postsController.updatePost,
);
router.delete(
  "/:postId",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  postsController.deletePost,
);

export const postsRoute = router;
