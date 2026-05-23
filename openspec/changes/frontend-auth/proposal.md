# Proposal: Frontend Authentication

## Intent

The map app is fully open — no login, no session, no protected routes. Users can't have private data or personalized state. This change adds email+password auth on the frontend using better-auth's first-class React client.

## Scope

### In Scope

- Login page (`/login`) with Ionic UI — email + password form, error display, loading state
- Signup page (`/signup`) with Ionic UI — name + email + password, error display
- `authClient` instance via `better-auth/react`, exported from shared module
- `useSession()` hook for reactive session state (replaces raw Zustand auth store)
- Zustand only for UI affordances the hook doesn't cover (form submit loading, modal state)
- `AuthProvider` — checks session on app mount, shows loading splash, wraps children
- `ProtectedRoute` — redirects to `/login` if no session, shows loading if pending
- Vite proxy `/api` → `http://localhost:3000` for dev (same-origin cookies)
- `trustedOrigins` config on backend (`http://localhost:5173`)
- Add `better-auth` to frontend `package.json`

### Out of Scope

- OAuth/social login providers
- Password reset flow
- Email verification
- User profile management
- `better-auth-ui` library (requires shadcn/Tailwind — incompatible with Ionic)
- Capacitor native token strategy (deferred — works with Vite proxy in dev)

## Capabilities

### New Capabilities

- `user-auth-frontend`: Login/signup pages, cookie-based session management via better-auth React client, route protection with `ProtectedRoute` guard component, session initialization on app mount.

### Modified Capabilities

None — no existing specs.

## Approach

1. Install `better-auth` in the frontend workspace
2. Create `src/lib/auth-client.ts` — `createAuthClient()` instance (base URL via Vite proxy)
3. Create `src/components/auth/AuthProvider.tsx` — wraps app, calls `authClient.getSession()` on mount, exposes loading via context
4. Create `src/components/auth/ProtectedRoute.tsx` — React Router v5 render-prop guard, redirects to `/login` if `useSession()` returns no data
5. Create `src/pages/LoginPage.tsx` — Ionic form (`IonInput`, `IonButton`), calls `authClient.signIn.email()`
6. Create `src/pages/SignupPage.tsx` — Ionic form, calls `authClient.signUp.email()`
7. Update `App.tsx` — wrap with `AuthProvider`, add `/login` and `/signup` routes, protect `/map` with `ProtectedRoute`
8. Update `vite.config.ts` — add `server.proxy` for `/api`
9. Update backend `auth.ts` — add `trustedOrigins: ['http://localhost:5173']`
10. Update frontend `package.json` — add `better-auth` dependency

## Affected Areas

| Area                                                   | Impact   | Description                                  |
| ------------------------------------------------------ | -------- | -------------------------------------------- |
| `apps/frontend/src/lib/auth-client.ts`                 | New      | `createAuthClient()` instance                |
| `apps/frontend/src/pages/LoginPage.tsx`                | New      | Ionic email+password form                    |
| `apps/frontend/src/pages/SignupPage.tsx`               | New      | Ionic name+email+password form               |
| `apps/frontend/src/components/auth/AuthProvider.tsx`   | New      | Session init + loading context               |
| `apps/frontend/src/components/auth/ProtectedRoute.tsx` | New      | Route guard, redirect if unauthenticated     |
| `apps/frontend/src/App.tsx`                            | Modified | Provider wrapper, auth routes, protected map |
| `apps/frontend/vite.config.ts`                         | Modified | Proxy `/api` → `:3000`                       |
| `apps/frontend/package.json`                           | Modified | Add `better-auth` dependency                 |
| `apps/backend/src/lib/auth.ts`                         | Modified | Add `trustedOrigins`                         |

## Risks

| Risk                                                          | Likelihood | Mitigation                                                                           |
| ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Cookie not sent cross-origin                                  | Medium     | Vite proxy in dev; same-origin in prod via reverse proxy                             |
| Capacitor native builds                                       | Low        | Deferred — dev-only scope; separate issue for mobile builds                          |
| `better-auth/react` hook mismatches React Router v5 lifecycle | Low        | Wraps fine — `useSession()` is a plain React hook, no router dependency              |
| Flash of login page on reload                                 | Low        | `AuthProvider` shows `IonLoading` until `useSession()` resolves + `isPending` clears |

## Rollback Plan

- Remove added routes and components from `App.tsx`
- Remove `AuthProvider` wrapper
- Remove `trustedOrigins` from backend `auth.ts`
- Remove Vite proxy config
- Revert `package.json` dependency
- All deleted files are brand new — no existing code touched

## Dependencies

- `better-auth` must be added to `apps/frontend/package.json` (already in monorepo workspace, just needs explicit dep)

## Success Criteria

- [ ] User can sign up at `/signup` with name, email, password
- [ ] User can sign in at `/login` with email, password
- [ ] Authenticated user sees `/map` (protected); unauthenticated user is redirected to `/login`
- [ ] Session persists on page reload (cookie-based)
- [ ] Sign out clears session and redirects to `/login`
