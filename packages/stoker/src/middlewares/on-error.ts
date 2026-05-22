import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { INTERNAL_SERVER_ERROR, OK } from '../http-status-codes.js'

const onError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err && typeof err.status === 'number' && Number.isInteger(err.status) && err.status >= 400 && err.status <= 599
    ? err.status
    : c.newResponse(null).status

  /**
   * If the current status is OK (200), we fallback to INTERNAL_SERVER_ERROR (500)
   * to ensure we are returning an error status code.
   */
  const statusCode = currentStatus !== OK
    ? (currentStatus as ContentfulStatusCode)
    : INTERNAL_SERVER_ERROR

  // eslint-disable-next-line node/prefer-global/process
  const env = c.env?.NODE_ENV || process.env?.NODE_ENV

  // Log the error before returning the response

  console.error(`[${c.req.method}] ${c.req.path} - ${statusCode}`, err)

  return c.json(
    {
      message: err.message,

      stack: env === 'production'
        ? undefined
        : err.stack,
    },
    statusCode,
  )
}

export default onError
