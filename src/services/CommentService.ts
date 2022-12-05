import { Comment, CommentLike } from '@prisma/client'

import db from '../lib/db.js'
import AppError from '../lib/AppError.js'

class CommentService {
  private static instance: CommentService
  public static getInstance() {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService()
    }
    return CommentService.instance
  }

  async getComments({
    itemId,
    userId,
  }: {
    itemId: number
    userId?: number | null
  }) {
    const comments = await db.comment.findMany({
      where: {
        itemId,
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
        mentionUser: true,
      },
    })
    const commentLikedMap = userId
      ? await this.getCommentLikedMap({
          commentIds: comments.map((c) => c.id),
          userId,
        })
      : {}
    const commentsWithIsLiked = comments.map((c) => ({
      ...c,
      isLiked: !!commentLikedMap[c.id],
    }))

    return this.groupSubComments(this.redact(commentsWithIsLiked))
  }

  redact(comments: Comment[]) {
    return comments.map((c) => {
      if (!c.deletedAt)
        return {
          ...c,
          isDeleted: false,
        }
      const someDate = new Date(0)
      return {
        ...c,
        likes: 0,
        createdAt: someDate,
        updatedAt: someDate,
        subCommentsCount: 0,
        text: '',
        user: {
          id: -1,
          username: 'deleted',
        },
        mentionUser: null,
        subComments: [],
        isDeleted: true,
      }
    })
  }

  async groupSubComments<T extends Comment>(comments: T[]) {
    const rootComments = comments.filter((c) => c.parentCommentId === null)
    const subCommentsMap = new Map<number, T[]>()
    comments.forEach((c) => {
      if (!c.parentCommentId) return
      if (c.deletedAt !== null) return
      const array = subCommentsMap.get(c.parentCommentId) ?? []
      array.push(c)
      subCommentsMap.set(c.parentCommentId, array)
    })
    const merged = rootComments
      .map((c) => ({
        ...c,
        subComments: subCommentsMap.get(c.id) ?? [],
      }))
      .filter((c) => c.deletedAt === null || c.subComments.length !== 0)
    return merged
  }

  async getComment({
    commentId,
    withSubComments = false,
    userId = null,
  }: {
    commentId: number
    withSubComments?: boolean
    userId?: number | null
  }) {
    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        user: true,
        mentionUser: true,
      },
    })
    const commentLike = userId
      ? await db.commentLike.findUnique({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        })
      : null
    if (!comment || comment.deletedAt) {
      throw new AppError('NotFound')
    }
    if (withSubComments) {
      const subComments = await this.getSubComments({ commentId, userId })
      return {
        subComments,
        ...comment,
        isLiked: !!commentLike,
        isDeleted: false,
      }
    }
    return { ...comment, isLiked: !!commentLike, isDeleted: false }
  }

  async getSubComments({
    commentId,
    userId = null,
  }: {
    commentId: number
    userId?: number | null
  }) {
    const subComments = await db.comment.findMany({
      where: {
        parentCommentId: commentId,
        deletedAt: null,
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
        mentionUser: true,
      },
    })
    const commentLikeMap = userId
      ? await this.getCommentLikedMap({
          userId,
          commentIds: subComments.map((sc) => sc.id),
        })
      : {}

    return subComments.map((sc) => ({
      ...sc,
      isLiked: !!commentLikeMap[sc.id],
      isDeleted: false,
    }))
  }
  async createComment({
    itemId,
    text,
    parentCommentId,
    userId,
  }: CreateCommentParams) {
    if (text.length > 300 || text.length < 1) {
      throw new AppError('BadRequest', {
        message: 'text is invalid',
      })
    }
    const parentComment = parentCommentId
      ? await this.getComment({
          commentId: parentCommentId,
        })
      : null

    const rootParentCommentId = parentComment?.parentCommentId
    const targetParentCommentId = rootParentCommentId ?? parentCommentId
    const shouldMention =
      !!rootParentCommentId && userId !== parentComment?.userId

    const comment = await db.comment.create({
      data: {
        itemId,
        text,
        userId,
        parentCommentId: targetParentCommentId,
        mentionUserId: shouldMention ? parentComment?.userId : null,
      },
      include: {
        user: true,
        mentionUser: true,
      },
    })
    if (parentCommentId) {
      const subCommentsCount = await db.comment.count({
        where: {
          parentCommentId: targetParentCommentId,
        },
      })
      await db.comment.update({
        where: {
          id: targetParentCommentId,
        },
        data: {
          subCommentsCount,
        },
      })
    }
    await this.countAndSyncComments(itemId)

    return { ...comment, isDeleted: false, subComments: [], isLiked: false }
  }
  async likeComment({ userId, commentId }: CommentParams) {
    // const alreadyLiked = await db.commentLike.findUnique({
    //   where: {
    //     commentId_userId: {
    //       commentId,
    //       userId,
    //     },
    //   },
    // })
    try {
      await db.commentLike.create({
        data: {
          userId,
          commentId,
        },
      })
    } catch (e) {}
    const count = await this.countAndSyncCommentLikes(commentId)
    return count
  }
  async unlikeComment({ userId, commentId }: CommentParams) {
    try {
      await db.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      })
    } catch (error) {}
    const count = await this.countAndSyncCommentLikes(commentId)
    return count
  }

  async countAndSyncCommentLikes(commentId: number) {
    const count = await db.commentLike.count({
      where: {
        commentId,
      },
    })
    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        likes: count,
      },
    })

    return count
  }

  async countAndSyncComments(itemId: number) {
    const count = await db.comment.count({
      where: {
        itemId,
      },
    })
    await db.itemStats.update({
      where: {
        itemId,
      },
      data: {
        commentsCount: count,
      },
    })
    return count
  }

  async deleteComment({ userId, commentId }: CommentParams) {
    const comment = await this.getComment({ commentId })
    if (comment.userId !== userId) {
      throw new AppError('Forbidden')
    }
    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }
  async updateComment({ userId, commentId, text }: UpdateCommentParams) {
    const comment = await this.getComment({ commentId })
    if (comment.userId !== userId) {
      throw new AppError('Forbidden')
    }
    const updatedComment = await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        text,
      },
      include: {
        user: true,
      },
    })
    return this.getComment({ commentId, withSubComments: true })
  }

  async getCommentLikedMap({
    commentIds,
    userId,
  }: {
    commentIds: number[]
    userId: number
  }) {
    const list = await db.commentLike.findMany({
      where: {
        userId,
        commentId: {
          in: commentIds,
        },
      },
    })

    return list.reduce((acc, cur) => {
      acc[cur.commentId] = cur
      return acc
    }, {} as Record<number, CommentLike>)
  }
}

interface CreateCommentParams {
  itemId: number
  text: string
  parentCommentId?: number
  userId: number
}

interface CommentParams {
  userId: number
  commentId: number
}

interface UpdateCommentParams extends CommentParams {
  text: string
}

export default CommentService
