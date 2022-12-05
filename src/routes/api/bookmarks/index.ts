import { createAuthorizedRoute } from '../../../plugins/requireAuthPlugin.js'
import BookmarkService from '../../../services/BookmarkService.js'
import UserService from '../../../services/UserService.js'
import {
  createBookmarkSchema,
  deleteBookmarkSchema,
  getBookmarksSchema,
} from './schema.js'

export const bookmarksRoute = createAuthorizedRoute(async (fastify) => {
  const bookmarkService = BookmarkService.getInstance()
  const userService = UserService.getInstance()

  fastify.post('/', { schema: createBookmarkSchema }, async (request) => {
    const userId = await userService.getUserId(request)
    return (await bookmarkService.createBookmark({
      userId,
      itemId: request.body.itemId,
    })) as any
  })

  fastify.get('/', { schema: getBookmarksSchema }, async (request) => {
    const userId = await userService.getUserId(request)
    return (await bookmarkService.getBookmarks({
      userId,
      limit: 5,
      cursor: request.query.cursor,
    })) as any
  })

  fastify.delete(
    '/',
    { schema: deleteBookmarkSchema },
    async (request, reply) => {
      const userId = await userService.getUserId(request)
      const { itemId } = request.query
      await bookmarkService.deleteBookmark({
        userId,
        itemId,
      })
      reply.status(204)
    },
  )
})
