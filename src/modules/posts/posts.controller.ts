import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postsServices } from "./posts.services";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await postsServices.getAllPosts(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts fetched successfully",
      data: result,
    });
  },
);
const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postsServices.getPostsStats();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts stats fetched successfully",
      data: result,
    });
  },
);
const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const result = await postsServices.getPostById(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post fetched successfully",
      data: result,
    });
  },
);
const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const userId = req.user?.id as string;
    const result = await postsServices.createPost(payload, userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully",
      data: result,
    });
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await postsServices.getMyPosts(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My posts fetched successfully",
      data: result,
    });
  },
);
const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId, role } = req.user!;

    const { postId } = req.params;
    const payload = req.body;
    const result = await postsServices.updatePost(
      payload,
      postId as string,
      userId,
      role === "ADMIN",
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post updated successfully",
      data: result,
    });
  },
);
const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId, role } = req.user!;
    const { postId } = req.params;
    await postsServices.deletePost(postId as string, userId, role === "ADMIN");

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post deleted successfully",
      data: null,
    });
  },
);

export const postsController = {
  getAllPosts,
  getPostsStats,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
};
