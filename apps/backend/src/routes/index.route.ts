import { createRoute } from '@hono/zod-openapi'
import * as HttpStatusCodes from '@repo/stoker/http-status-codes'
import { jsonContent } from '@repo/stoker/openapi/helpers'
import { createMessageObjectSchema } from '@repo/stoker/openapi/schemas'
import { createRouter } from '@/lib/create-app'

const router = createRouter()
  .openapi(
    createRoute({
      tags: ['Index'],
      method: 'get',
      path: '/',
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema('Map API'),
          'Map API Index',
        ),
      },
    }),
    (c) => {
      return c.json({
        message: 'Map API',
      }, HttpStatusCodes.OK)
    },
  )

export default router
