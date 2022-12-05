import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import {
  AccessTokenPayload,
  sb_validateToken,
  validateToken,
} from '../lib/tokens.js'

const { JsonWebTokenError } = jwt

const authPluginAsync: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.decorateRequest('user', null)
  fastify.decorateRequest('isExpiredToken', false)
  fastify.addHook('preHandler', async (request) => {
    // const token =
    //   request.headers.authorization?.split('Bearer ')[1] ??
    //   request.cookies.access_token

    const sb_token =
      request.cookies['supabase-auth-token'] &&
      JSON.parse(request.cookies['supabase-auth-token'])[0]

    // if (request.cookies.refresh_token && !token) {
    //   request.isExpiredToken = true
    //   return
    // }
    if (!sb_token) return

    try {
      // const decoded = await validateToken<AccessTokenPayload>(token)
      const sb_decoded = await sb_validateToken(sb_token)

      request.user = {
        // id: decoded.userId,
        // username: decoded.username,
        authId: sb_decoded?.sub,
      }
    } catch (e: any) {
      if (e instanceof JsonWebTokenError) {
        if (e.name === 'TokenExpiredError') {
          request.isExpiredToken = true
        }
      }
    }
  })
}

export const authPlugin = fp(authPluginAsync, {
  name: 'authPlugin',
})

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id?: number
      username?: string
      authId: string
    } | null
    isExpiredToken: boolean
  }
}
