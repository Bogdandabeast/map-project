# Design: Frontend Authentication

## Technical Approach

Wrap the existing Ionic app with a session-aware `AuthProvider`, add two public auth pages (`/login`, `/signup`), and protect `/map` with a `ProtectedRoute` component. Auth state comes from `better-auth/react` hooks — no custom Zustand session store. Cookie-based sessions flow through Vite's dev proxy to keep CORS out of the picture.

## Architecture Decisions

| Decision         | Choice                                     | Alternatives                    | Rationale                                                                                                 |
| ---------------- | ------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Auth library     | `better-auth/react` client                 | Raw fetch + Zustand store       | Reactive `useSession()` hook eliminates manual sync. Type-safe with `createAuthClient<typeof auth>()`.    |
| Session provider | `AuthProvider` wrapper (context)           | Per-page `useSession()` calls   | Single session check on mount prevents flash of login page. `IonLoading` during init.                     |
| Route guard      | `ProtectedRoute` wrapper component         | `onEnter` hooks, HOCs           | Matches existing v5 `<Route>` child-render pattern. `useSession()` is a plain hook — no router coupling.  |
| Auth pages       | Standalone Ionic forms                     | Modal, overlay                  | Bookmarkable URLs, clean route separation. Follows existing `MapPage` pattern (`IonPage` → `IonContent`). |
| Dev CORS         | Vite proxy `/api` → `:3000`                | `trustedOrigins` only           | Same-origin cookies in dev without manual cookie config. `trustedOrigins` still needed for CSRF.          |
| Validation       | Shared Zod schemas via `@repo/validations` | Duplicated schemas, raw if/else | Single source of truth for validation rules. Both client and server enforce the same constraints.         |

## Data Flow

```
LoginPage ──signIn.email()──→ better-auth API ──→ Set session cookie
                                                       │
App mount ──getSession()─────→ reads cookie ──→ AuthProvider sets ready
                                                       │
ProtectedRoute ──useSession()───→ { data, isPending } ──→ redirect or render
```

All flows are unidirectional: the better-auth server sets the cookie, and the React hooks read it reactively. No Zustand involved for auth state — keep form UI state (submit loading, error strings) local with `useState`.

## File Changes

| File                                                   | Action     | Description                                                                                |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------ |
| `packages/validations/`                                | **Create** | Shared Zod schemas (`email`, `password`, `name`) + composed `signInSchema`, `signUpSchema` |
| `packages/validations/package.json`                    | Create     | `@repo/validations` workspace package                                                      |
| `packages/validations/tsconfig.json`                   | Create     | TS config for the shared package                                                           |
| `packages/validations/src/index.ts`                    | Create     | Export all schemas                                                                         |
| `apps/frontend/src/lib/auth-client.ts`                 | Create     | `createAuthClient<typeof auth>()` singleton, exported for all consumers                    |
| `apps/frontend/src/components/auth/AuthProvider.tsx`   | Create     | Context provider, calls `getSession()` on mount, shows `IonLoading` until resolved         |
| `apps/frontend/src/components/auth/ProtectedRoute.tsx` | Create     | Wraps children, calls `useSession()`, redirects to `/login` if no session                  |
| `apps/frontend/src/pages/LoginPage.tsx`                | Create     | Ionic form: Zod validation → `signIn.email()`, inline field errors                         |
| `apps/frontend/src/pages/SignupPage.tsx`               | Create     | Ionic form: Zod validation → `signUp.email()`, inline field errors                         |
| `apps/frontend/src/App.tsx`                            | Modify     | Wrap with `AuthProvider`, add `/login` and `/signup` routes, protect `/map`                |
| `apps/frontend/vite.config.ts`                         | Modify     | Add `server.proxy: { '/api': 'http://localhost:3000' }`                                    |
| `apps/frontend/package.json`                           | Modify     | Add `better-auth` + `zod` + `@repo/validations` dependencies                               |
| `apps/backend/src/lib/auth.ts`                         | Modify     | Add `trustedOrigins: ['http://localhost:5173']`                                            |
| `apps/backend/src/middlewares/validate.ts`             | **Create** | Zod validation middleware for auth endpoints                                               |

## Interfaces / Contracts

```ts
// auth-client.ts
import { createAuthClient } from 'better-auth/react'

// packages/validations/src/index.ts
import { z } from 'zod'

export const emailSchema = z.string().email('Email inválido')
export const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres')
export const nameSchema = z.string().min(2, 'Mínimo 2 caracteres').max(100)

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})
export const authClient = createAuthClient()
// Type: { signIn, signUp, signOut, useSession, getSession }

// ProtectedRoute props
interface ProtectedRouteProps {
  children: React.ReactNode
}

// AuthProvider context (internal — no external exposure needed)
interface AuthContextValue {
  isLoading: boolean
}
```

### Validation Flow

```
Client-side:
  Form submit
    → Zod.parse() on form data
    → If invalid: show ion-error on each field, STOP
    → If valid: authClient.signIn.email() / authClient.signUp.email()

Server-side (validate.ts middleware):
  POST /api/auth/sign-in/email or /api/auth/sign-up/email
    → Zod.parse() on request body
    → If invalid: return 400 { error, fields }
    → If valid: c.req.raw → auth.handler(c.req.raw)
```

## Testing Strategy

| Layer                 | What                                                          | How                                                                                                                          |
| --------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Unit (vitest)         | `@repo/validations` schemas                                   | Test each schema: valid email, invalid email, short password, long name, etc.                                                |
| Unit                  | `LoginPage` / `SignupPage` form validation                    | `@testing-library/react` + mock `better-auth/react`. Submit invalid data, verify Zod errors shown inline and API NOT called. |
| Unit                  | `ProtectedRoute` redirect logic                               | Mock `useSession()` to return `{ data: null, isPending: false }` — verify `<Redirect to="/login">`                           |
| Unit                  | `AuthProvider` loading state                                  | Mock `getSession()` with deferred promise — verify `IonLoading` is open while pending                                        |
| Integration (backend) | `validate.ts` middleware                                      | Test POST with Zod-invalid body → expect 400 with error shape                                                                |
| Manual                | Full flow: signup → login → protected route → reload → logout | Dev server with both frontend and backend running                                                                            |

## Open Questions

None — design decisions are settled by the proposal and existing code patterns.

## Next Step

Ready for tasks (sdd-tasks).
