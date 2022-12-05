import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import fq from 'fastify-plugin'
import AppError from '../lib/AppError.js'

const requireAuthPluginAsync: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook('preHandler', async (request) => {
    if (request.isExpiredToken) {
      throw new AppError('Unauthorized', {
        isExpiredToken: true,
      })
    }
    if (!request.user) {
      throw new AppError('Unauthorized', {
        isExpiredToken: false,
      })
    }
  })
}

const requireAuthPlugin = fq(requireAuthPluginAsync, {
  name: 'requireAuthPlugin',
})

export function createAuthorizedRoute(plugin: FastifyPluginAsyncTypebox) {
  const wrappedPlugin: FastifyPluginAsyncTypebox = async (fastify, opts) => {
    fastify.register(requireAuthPlugin)
    return plugin(fastify, opts)
  }

  return wrappedPlugin
}

export default requireAuthPlugin
