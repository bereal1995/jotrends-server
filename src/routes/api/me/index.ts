import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

import { clearCookie } from '../../../lib/cookies.js'
import requireAuthPlugin from '../../../plugins/requireAuthPlugin.js'
import UserService from '../../../services/UserService.js'
import {
  getAccountSchema,
  unregisterSchema,
  updatePasswordSchema,
} from './schema.js'

export const meRoute: FastifyPluginAsyncTypebox = async (fastify) => {
  const userService = UserService.getInstance()
  fastify.register(requireAuthPlugin)

  // fastify.get('/', { schema: getAccountSchema }, async (request) => {
  //   return request.user!
  // })

  // fastify.post(
  //   '/change-password',
  //   { schema: updatePasswordSchema },
  //   async (request, reply) => {
  //     const { oldPassword, newPassword } = request.body
  //     await userService.changePassword({
  //       oldPassword,
  //       newPassword,
  //       userId: request.user?.id!,
  //     })

  //     reply.status(204)
  //   },
  // )

  fastify.delete('/', { schema: unregisterSchema }, async (request, reply) => {
    const userId = await userService.getUserId(request)
    await userService.unregister(userId)
    reply.status(204)
    clearCookie(reply)
  })
}
