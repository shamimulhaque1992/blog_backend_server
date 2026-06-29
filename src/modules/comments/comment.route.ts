import { Router } from "express";
import { commentController } from "./comments.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/author/:authorId", commentController.getCommentsByAuthor);
router.get("/:commentId", commentController.getCommentsByCommentId);
router.post("/", auth(Role.USER, Role.ADMIN), commentController.createComment);
router.patch(
  "/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.updateComment,
);
router.delete(
  "/:commentId",
  auth(Role.USER, Role.ADMIN),
  commentController.deleteComment,
);
router.patch(
  "/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.moderateComment,
);

export const commentRoute = router;
