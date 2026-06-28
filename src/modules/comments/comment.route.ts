import { Router } from "express";
import { commentController } from "./comments.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/comments/author/:authorId", commentController.getCommentsByAuthor);
router.get(
  "/comments/comments/:commentId",
  commentController.getCommentsByCommentId,
);
router.post(
  "/comments",
  auth(Role.USER, Role.ADMIN),
  commentController.createComment,
);
router.patch(
  "/comments/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.updateComment,
);
router.delete(
  "/comments/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.deleteComment,
);
router.patch(
  "/comments/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.moderateComment,
);

export const commentRoute = router;
