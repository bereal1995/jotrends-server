import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import api from './api/index.js'

const routes: FastifyPluginAsyncTypebox = async (fastify, opts) => {
  fastify.register(api, { prefix: '/api' })
}

export default routes
