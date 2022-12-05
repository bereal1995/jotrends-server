import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import sanitize from 'sanitize-html'

import algolia from '../../../lib/algolia.js'
import ItemService from '../../../services/ItemService.js'
import UserService from '../../../services/UserService.js'
import { searchSchema } from './schema.js'

export const searchRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  const itemService = ItemService.getInstance()
  const userService = UserService.getInstance()

  fastify.get('/', { schema: searchSchema }, async (request) => {
    const { q, limit, offset } = request.query
    const userId = await userService.getUserId(request)
    const hits = await algolia.search(q, { length: limit, offset })
    const items = await itemService.getItemsByIds(
      hits.list.map((item) => item.id),
      userId,
    )
    const serializedList = hits.list
      .filter((item) => items[item.id])
      .map((hit) => {
        const item = items[hit.id]
        return {
          id: item.id,
          link: item.link!,
          publisher: item.publisher,
          author: item.author === '' ? null : item.author,
          likes: item.itemStats?.likes ?? 0,
          title: item.title,
          body: item.body,
          createdAt: item.createdAt,
          highlight: {
            title: sanitize(hit._highlightResult?.title?.value ?? '') ?? null,
            body: sanitize(hit._highlightResult?.body?.value ?? '') ?? null,
          },
        }
      })

    return { ...hits, list: serializedList }
  })
}
