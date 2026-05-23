import type { Session, User } from 'better-auth/types'

declare module 'hono' {
  interface Env {
    Variables: {
      user: User
      session: Session
    }
  }
}
