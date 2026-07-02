import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IModerateCommentPayload,
} from "./comment.interface";

const getCommentsByAuthor = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: authorId },
  });

  const result = await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return result;
};
const getCommentByCommentId = async (commentId: string) => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
  return result;
};
const createComment = async (
  payload: ICreateCommentPayload,

  authorId: string,
) => {
  const result = await prisma.comment.create({
    data: { ...payload, authorId: authorId },
  });

  return result;
};
const updateComment = async (
  commentId: string,
  authorId: string,
  payload: Partial<ICreateCommentPayload>,
) => {
  await prisma.comment.findFirstOrThrow({
    where: {
      id: commentId,
      authorId,
    },
  });
  const result = await prisma.comment.update({
    where: {
      id: commentId,
      authorId,
    },
    data: payload,
  });

  return result;
};
const deleteComment = async (commentId: string, authorId: string) => {
  await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
      authorId,
    },
  });
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  return null;
};
const moderateComment = async (
  commentId: string,
  payload: IModerateCommentPayload,
) => {
  const updatableComment = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });
  if (updatableComment.status === payload.status) {
    throw new Error("Comment is already in the same status");
  }
  const result = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: payload,
  });
  return result;
};

export const commentServices = {
  getCommentsByAuthor,
  getCommentByCommentId,
  createComment,
  updateComment,
  deleteComment,
  moderateComment,
};
