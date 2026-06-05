import type { Hook } from '@hono/zod-openapi'

export const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: false,
        errors: result.error.flatten().fieldErrors,
      },
      422,
    )
  }
}
