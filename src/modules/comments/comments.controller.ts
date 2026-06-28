import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const getCommentsByAuthor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
const getCommentsByCommentId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
const moderateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const commentController = {
  getCommentsByAuthor,
  getCommentsByCommentId,
  createComment,
  updateComment,
  deleteComment,
  moderateComment,
};
