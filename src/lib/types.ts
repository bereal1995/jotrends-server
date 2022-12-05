import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'

type FastifyTypebox = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>

export type FastifyPluginAsyncTypebox = (
  fastify: FastifyTypebox,
  opts: any,
) => Promise<void>
