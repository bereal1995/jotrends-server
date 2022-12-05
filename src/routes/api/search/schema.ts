import { Type } from '@sinclair/typebox'

import { PaginationSchema } from '../../../lib/pagination.js'
import { routeSchema } from '../../../lib/routeSchema.js'
import { Nullable } from '../../../lib/typebox.js'

const SearchQuerySchema = Type.Object({
  q: Type.String(),
  offset: Type.Optional(Type.Integer()),
  limit: Type.Optional(Type.Integer()),
})

const SearchResultItemSchema = Type.Object({
  id: Type.Number(),
  link: Type.String(),
  title: Type.String(),
  body: Type.String(),
  publisher: Type.Object({
    name: Type.String(),
    favicon: Nullable(Type.String()),
    domain: Type.String(),
  }),
  author: Nullable(Type.String()),
  highlight: Type.Object({
    title: Type.String(),
    body: Type.String(),
  }),
  likes: Type.Number(),
})

export const searchSchema = routeSchema({
  querystring: SearchQuerySchema,
  response: {
    200: PaginationSchema(SearchResultItemSchema),
  },
  tags: ['search'],
})
