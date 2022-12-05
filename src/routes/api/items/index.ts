import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

import { createAuthorizedRoute } from '../../../plugins/requireAuthPlugin.js'
import ItemService from '../../../services/ItemService.js'
import UserService from '../../../services/UserService.js'
import { commentsRoute } from './comments/index.js'
import {
  deleteItemSchema,
  getItemSchema,
  getItemsSchema,
  likeItemSchema,
  unlikeItemSchema,
  updateItemSchema,
  writeItemSchema,
} from './schema.js'

export const itemsRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  const itemService = ItemService.getInstance()
  const userService = UserService.getInstance()

  fastify.register(authorizedItemRoute)
  fastify.get('/:id', { schema: getItemSchema }, async (request) => {
    const { id } = request.params
    const userId = await userService.getUserId(request)
    const item = await itemService.getItem(id, userId)
    return item as any
  })

  fastify.get('/', { schema: getItemsSchema }, async (request) => {
    const { cursor, mode, startDate, endDate } = request.query
    const userId = await userService.getUserId(request)

    return itemService.getItems({
      mode: mode ?? 'recent',
      cursor: cursor ?? undefined,
      userId,
      limit: 20,
      startDate,
      endDate,
    }) as any
  })

  fastify.register(commentsRoute, { prefix: '/:id/comments' })
}

const authorizedItemRoute = createAuthorizedRoute(async (fastify) => {
  const itemService = ItemService.getInstance()
  const userService = UserService.getInstance()

  fastify.post('/', { schema: writeItemSchema }, async (request) => {
    const userId = await userService.getUserId(request)
    const item = await itemService.createItem(userId, request.body)
    return item as any
  })

  fastify.patch('/:id', { schema: updateItemSchema }, async (request) => {
    const { id: itemId } = request.params
    const userId = await userService.getUserId(request)
    const { title, body } = request.body
    return (await itemService.updateItem({
      itemId,
      userId,
      title,
      body,
    })) as any
  })

  fastify.delete(
    '/:id',
    { schema: deleteItemSchema },
    async (request, response) => {
      const { id: itemId } = request.params
      const userId = await userService.getUserId(request)
      await itemService.deleteItem({ itemId, userId })
      response.status(204)
    },
  )

  fastify.post(
    '/:id/likes',
    { schema: likeItemSchema },
    async (request, response) => {
      const { id: itemId } = request.params
      const userId = await userService.getUserId(request)
      const itemStats = await itemService.likeItem({ itemId, userId })
      return { id: itemId, itemStats, isLiked: true }
    },
  )
  fastify.delete(
    '/:id/likes',
    { schema: unlikeItemSchema },
    async (request, response) => {
      const { id: itemId } = request.params
      const userId = await userService.getUserId(request)
      const itemStats = await itemService.unlikeItem({ itemId, userId })
      return { id: itemId, itemStats, isLiked: false }
    },
  )
})
