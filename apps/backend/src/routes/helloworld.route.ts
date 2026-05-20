import { createRouter } from '@/lib/create-app'

const router = createRouter()

router.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default router
