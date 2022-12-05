import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

import { createAuthorizedRoute } from '../../../../plugins/requireAuthPlugin.js'
import CommentService from '../../../../services/CommentService.js'
import UserService from '../../../../services/UserService.js'
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentSchema,
  getCommentsSchema,
  getSubCommentsSchema,
  likeCommentSchema,
  unlikeCommentSchema,
  updateCommentSchema,
} from './schema.js'

export const commentsRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  const commentService = CommentService.getInstance()
  const userService = UserService.getInstance()

  fastify.get('/', { schema: getCommentsSchema }, async (request) => {
    const userId = await userService.getUserId(request)
    return (await commentService.getComments({
      itemId: request.params.id,
      userId,
    })) as any
  })

  fastify.get(
    '/:commentId',
    {
      schema: getCommentSchema,
    },
    async (request) => {
      return (await commentService.getComment({
        commentId: request.params.commentId,
        withSubComments: true,
      })) as any
    },
  )

  fastify.get(
    '/:commentId/subcomments',
    { schema: getSubCommentsSchema },
    async (request) => {
      const userId = await userService.getUserId(request)
      return (await commentService.getSubComments({
        commentId: request.params.commentId,
        userId,
      })) as any
    },
  )
  fastify.register(authorizedCommentRoute)
}

const authorizedCommentRoute = createAuthorizedRoute(async (fastify) => {
  const commentService = CommentService.getInstance()
  const userService = UserService.getInstance()

  fastify.post('/', { schema: createCommentSchema }, async (request) => {
    const { text, parentCommentId } = request.body
    const { id: itemId } = request.params
    const userId = await userService.getUserId(request)
    return (await commentService.createComment({
      parentCommentId: parentCommentId ?? undefined,
      text,
      itemId,
      userId,
    })) as any
  })

  fastify.post(
    '/:commentId/likes',
    { schema: likeCommentSchema },
    async (request) => {
      const { commentId } = request.params
      const userId = await userService.getUserId(request)
      const likes = await commentService.likeComment({ commentId, userId })
      return {
        id: commentId,
        likes,
      }
    },
  )

  fastify.delete(
    '/:commentId/likes',
    { schema: unlikeCommentSchema },
    async (request) => {
      const { commentId } = request.params
      const userId = await userService.getUserId(request)
      const likes = await commentService.unlikeComment({ commentId, userId })
      return {
        id: commentId,
        likes,
      }
    },
  )

  fastify.delete(
    '/:commentId',
    { schema: deleteCommentSchema },
    async (request, response) => {
      const { commentId } = request.params
      const userId = await userService.getUserId(request)
      await commentService.deleteComment({ commentId, userId })
      response.status(204)
    },
  )

  fastify.patch(
    '/:commentId',
    { schema: updateCommentSchema },
    async (request) => {
      const { commentId } = request.params
      const userId = await userService.getUserId(request)
      const { text } = request.body
      return (await commentService.updateComment({
        commentId,
        userId,
        text,
      })) as any
    },
  )
})
