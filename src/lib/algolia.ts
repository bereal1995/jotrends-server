import 'dotenv/config.js'
import algoliasearch from 'algoliasearch'

import { PaginationType } from './pagination.js'
import { Publisher } from '@prisma/client'
import { ItemType } from '../routes/api/items/schema.js'

if (!process.env.ALGOLIA_APP_ID) {
  throw new Error('ALGOLIA_APP_ID is not set')
}

if (!process.env.ALGOLIA_ADMIN_KEY) {
  throw new Error('ALGOLIA_ADMIN_KEY is not set')
}

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY,
)

const index = client.initIndex('jotrends_items')

const algolia = {
  async search(query: string, { offset = 0, length = 20 }: SearchOption = {}) {
    const result = await index.search<ItemType>(query, {
      length: length,
      offset,
    })

    const hasNextPage = offset + length < result.nbHits

    const pagination: PaginationType<typeof result.hits[0]> = {
      list: result.hits,
      totalCount: result.nbHits,
      pageInfo: {
        nextOffset: hasNextPage ? offset + length : null,
        hasNextPage,
      },
    }

    return pagination
  },
  sync(item: ItemSchemaForAlgolia) {
    return index.saveObject({ ...item, objectID: item.id })
  },
  delete(itemId: number) {
    return index.deleteObject(itemId.toString())
  },
}

interface SearchOption {
  offset?: number
  length?: number
}

interface ItemSchemaForAlgolia {
  id: number
  title: string
  body: string
  createdAt: string
  publisher: Publisher
  author: string | null
  link: string | null
  thumbnail: string | null
  username: string
}

export default algolia
