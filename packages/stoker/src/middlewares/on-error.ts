import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { INTERNAL_SERVER_ERROR, OK } from '../http-status-codes.js'

const onError: ErrorHandler = (err, c) => {
  const errorObj = typeof err === 'object' && err !== null ? err : new Error(String(err))
  const currentStatus = 'status' in errorObj && typeof errorObj.status === 'number' && Number.isInteger(errorObj.status) && errorObj.status >= 400 && errorObj.status <= 599
    ? errorObj.status
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

  console.error(`[${c.req.method}] ${c.req.path} - ${statusCode}`, errorObj)

  return c.json(
    {
      message: errorObj.message,

      stack: env === 'production'
        ? undefined
        : errorObj.stack,
    },
    statusCode,
  )
}

export default onError
