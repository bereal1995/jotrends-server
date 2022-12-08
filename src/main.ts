import Fastify from 'fastify'
import routes from './routes/index.js'
import fastifySwagger from '@fastify/swagger'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

import { swaggerConfig } from './config/swagger.js'
import 'dotenv/config.js'
import { authPlugin } from './plugins/authPlugin.js'
import { isAppError } from './lib/AppError.js'
import packageJson from './lib/packageJSON.js'

const server = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>()

if (process.env.NODE_ENV === 'development') {
  server.register(cors, {
    origin: /localhost/,
    allowedHeaders: ['Cookie', 'Content-Type'],
    credentials: true,
  })
} else {
  server.register(cors, {
    origin: /hhtrends.com/,
    allowedHeaders: ['Cookie', 'Content-Type'],
    credentials: true,
  })
}

if (process.env.NODE_ENV !== 'production') {
  await server.register(fastifySwagger, swaggerConfig)
}
server.register(fastifyCookie, {})

server.setErrorHandler(async (error, request, reply) => {
  reply.statusCode = error.statusCode ?? 500
  if (isAppError(error)) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      payload: error.payload,
    }
  }
  if (error.statusCode === 400) {
    return {
      name: 'BadRequest',
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  return error
})

server.get('/', async () => {
  return { version: packageJson.version }
})

server.register(authPlugin)
server.register(routes)

server.listen({ port: 8080, host: '0.0.0.0' })
