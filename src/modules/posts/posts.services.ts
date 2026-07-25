import { CommentStatus, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IGetAllPostsQuery,
  IUpdatePostPayload,
} from "./posts.interface";

const getAllPosts = async (query: IGetAllPostsQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: PostWhereInput[] = [];
  const tags = query.tags ? JSON.parse(query.tags as string) : [];
  const tagsArray = Array.isArray(query.tags) ? tags : [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: false,
  });

  const posts = await prisma.post.findMany({
    where: { AND: andConditions },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
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

  const totalPostCount = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / limit),
    },
  };
};
const getPostsStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPendingComments,
      totalViewCount,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECTED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.PENDING,
        },
      }),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPendingComments,
      totalViewCount: totalViewCount._sum.views || 0,
    };
  });

  return transactionResult;
};
const getPostById = async (postId: string, userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirstOrThrow({
      where: {
        userId,
      },
    });

    const isActive =
      subscription?.status === "ACTIVE" &&
      subscription?.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) > new Date();
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postResult = await tx.post.findFirstOrThrow({
      where: {
        id: postId,
        ...(isActive ? {} : { isPremium: false }),
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return postResult;
  });

  return transactionResult;
};

const getPremiumPosts = async (query: IGetAllPostsQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: PostWhereInput[] = [];
  const tags = query.tags ? JSON.parse(query.tags as string) : [];
  const tagsArray = Array.isArray(query.tags) ? tags : [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: true,
  });

  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
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

  const totalPostsCount = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: posts,
    meta: {
      total: totalPostsCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalPostsCount / limit),
    },
  };
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
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (payload.isPremium && user.subscription?.status !== "ACTIVE") {
    throw new Error(
      "Your are not premium user, subscribe to make premium content",
    );
  }
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
  getPremiumPosts,
};
