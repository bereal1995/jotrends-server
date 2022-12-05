import { Type } from '@sinclair/typebox'

import { routeSchema } from '../../../../lib/routeSchema.js'
import { Nullable } from '../../../../lib/typebox.js'
import { UserSchema } from '../../../../schema/userSchema.js'
import { ItemParamsSchema } from '../schema.js'

const CreateCommentBodySchema = Type.Object({
  text: Type.String(),
  parentCommentId: Type.Optional(Nullable(Type.Integer())),
})

const CommentParamsSchema = Type.Object({
  id: Type.Integer(),
  commentId: Type.Integer(),
})

const UpdateCommentBodySchema = Type.Object({
  text: Type.String(),
})

export let CommentSchema = Type.Object({
  id: Type.Integer(),
  text: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  likes: Type.Number(),
  subCommentsCount: Type.Number(),
  user: UserSchema,
  mentionUser: Type.Optional(Nullable(UserSchema)),
  isDeleted: Type.Boolean(),
  isLiked: Type.Boolean(),
})

const CommentLikeSchema = Type.Object({
  id: Type.Integer(),
  likes: Type.Number(),
})

CommentSchema = Type.Object({
  id: Type.Integer(),
  text: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  likes: Type.Number(),
  subCommentsCount: Type.Number(),
  user: UserSchema,
  mentionUser: Type.Optional(Nullable(UserSchema)),
  subComments: Type.Optional(Type.Array(CommentSchema)),
  isDeleted: Type.Boolean(),
  isLiked: Type.Boolean(),
})

export const getCommentsSchema = routeSchema({
  params: ItemParamsSchema,
  response: {
    200: Type.Array(CommentSchema),
  },
  tags: ['comments'],
})
export const getCommentSchema = routeSchema({
  params: CommentParamsSchema,
  response: {
    200: CommentSchema,
  },
  tags: ['comments'],
})
export const getSubCommentsSchema = routeSchema({
  params: CommentParamsSchema,
  response: {
    200: Type.Array(CommentSchema),
  },
  tags: ['comments'],
})
export const createCommentSchema = routeSchema({
  params: ItemParamsSchema,
  body: CreateCommentBodySchema,
  response: {
    200: CommentSchema,
  },
  tags: ['comments'],
})
export const likeCommentSchema = routeSchema({
  params: CommentParamsSchema,
  response: {
    200: CommentLikeSchema,
  },
  tags: ['comments'],
})
export const unlikeCommentSchema = routeSchema({
  params: CommentParamsSchema,
  response: {
    200: CommentLikeSchema,
  },
  tags: ['comments'],
})
export const updateCommentSchema = routeSchema({
  params: CommentParamsSchema,
  body: UpdateCommentBodySchema,
  response: {
    200: CommentSchema,
  },
  tags: ['comments'],
})
export const deleteCommentSchema = routeSchema({
  params: CommentParamsSchema,
  response: {
    204: {},
  },
  tags: ['comments'],
})
