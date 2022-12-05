import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

import { searchRoute } from './search/index.js'
import authRoute from './auth/index.js'
import { itemsRoute } from './items/index.js'
import { meRoute } from './me/index.js'
import { bookmarksRoute } from './bookmarks/index.js'

const api: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(authRoute, { prefix: '/auth' })
  fastify.register(meRoute, { prefix: '/me' })
  fastify.register(itemsRoute, { prefix: '/items' })
  fastify.register(searchRoute, { prefix: '/search' })
  fastify.register(bookmarksRoute, { prefix: '/bookmarks' })
}

export default api
