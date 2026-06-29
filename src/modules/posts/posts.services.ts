import { prisma } from "../../lib/prisma";
import { ICreatePostPayload, IUpdatePostPayload } from "./posts.interface";

const getAllPosts = async () => {
  const result = prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  return result;
};
const getPostsStats = async () => {};
const getPostById = async (postId: string) => {
  const result = prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });
  const updatedPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return updatedPost;
};

const getMyPosts = async (userId: string) => {
  const result = prisma.post.findMany({
    where: {
      authorId: userId,
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};
const createPost = async (payload: ICreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};
const updatePost = async (
  payload: IUpdatePostPayload,
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Unauthorized to update this post");
  }
  const result = prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });

  return result;
};
const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: Boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Unauthorized to delete this post");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

export const postsServices = {
  getAllPosts,
  getPostsStats,
  getPostById,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
};
