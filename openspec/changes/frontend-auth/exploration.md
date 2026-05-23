## Exploration: Frontend Authentication Implementation

### Current State

The frontend currently has **zero authentication** — it's an open, single-page app:

- **Routing** (`App.tsx`): Only two routes — `/map` (MapPage) and catch-all `/` redirect to `/map`. No auth pages, no guards.
- **State management**: Zustand with one store (`mapStore`) managing map center/zoom. No auth state.
- **API client**: None. The frontend never calls the backend.
- **Vite config**: No proxy configured. Frontend runs on Vite's default port (5173), backend runs on Bun (3000).
- **Dependencies installed**: `zustand` (already used), `react-router-dom` v5 (already used), `@ionic/react` (UI components available). No auth-specific packages.

The backend already provides:

- `POST/GET /api/auth/*` — better-auth handler (sign-in, sign-up, sign-out, get-session)
- `authMiddleware` — session verification for protected routes
- Cookie-based sessions (better-auth default)

**Key gap**: Frontend has no way to authenticate, no way to store/check session state, and no way to protect routes.

### Affected Areas

| File                                                   | Action     | Reason                                                             |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------------------ |
| `apps/frontend/src/App.tsx`                            | Modify     | Add auth routes (`/login`, `/signup`), wrap routes with auth guard |
| `apps/frontend/src/pages/LoginPage.tsx`                | **Create** | Login form (email + password)                                      |
| `apps/frontend/src/pages/SignupPage.tsx`               | **Create** | Registration form (email + password)                               |
| `apps/frontend/src/pages/MapPage.tsx`                  | Modify     | Minor — may need loading state while session check happens         |
| `apps/frontend/src/stores/authStore.ts`                | **Create** | Zustand store for auth state (user, session, loading, actions)     |
| `apps/frontend/src/api/auth.ts`                        | **Create** | API client for `/api/auth/*` endpoints                             |
| `apps/frontend/src/components/auth/ProtectedRoute.tsx` | **Create** | Route guard component for React Router v5                          |
| `apps/frontend/src/components/auth/AuthGuard.tsx`      | **Create** | Layout wrapper that checks session on mount                        |
| `apps/frontend/vite.config.ts`                         | Modify     | Add proxy `/api` → `http://localhost:3000` in dev                  |
| `.env`                                                 | Modify     | Add `VITE_API_BASE_URL` for production API URL                     |
| `apps/backend/src/lib/auth.ts`                         | (Check)    | May need `trustedOrigins` CORS config for frontend origin          |
| `apps/backend/src/app.ts`                              | (Check)    | May need CORS middleware if frontend is on different origin        |

### Approaches

#### 1. **Zustand Store + Native Fetch** (Recommended)

Create a thin `authStore` using Zustand that wraps `fetch()` calls to the better-auth API endpoints directly. No extra dependencies.

- **Components**:
  - `authStore` — state: `user`, `session`, `isLoading`, `error`; actions: `signIn`, `signUp`, `signOut`, `getSession`
  - `auth.ts` — raw fetch wrappers (or the store calls fetch inline)
  - `ProtectedRoute` — checks `authStore.session`, redirects to `/login` if null
  - `LoginPage` / `SignupPage` — Ionic form components, call store actions
- **Pros**:
  - Zero extra dependencies — Zustand and fetch are already available
  - Matches existing Zustand pattern in the project
  - Full control over error handling and loading states
  - Simple to test — store can be mocked, API layer is just fetch
  - React Router v5 compatible (uses `Redirect`/`history.push`)
- **Cons**:
  - Manual cookie handling — must set `credentials: 'include'` on every request
  - No automatic CSRF protection (better-auth handles this via cookies though)
  - No request retry or refresh token logic out of the box
- **Effort**: **Medium** (~5-8 files, no new dependencies)

#### 2. **Thin Auth Service Class + Zustand**

Same as Option 1 but extract API calls into a separate `AuthService` class (or module) injected into the store. Decouples API from state.

- **Components**: Same as Option 1 plus `src/services/AuthService.ts`
- **Pros**: Cleaner separation of concerns, easier to swap transport (e.g., add refresh logic later)
- **Cons**: More files, slightly more boilerplate for basically the same outcome at this scale
- **Effort**: **Medium** (~6-9 files)

### Recommendation

**Approach 1: Zustand Store + Native Fetch**, with API calls factored into a thin `src/api/auth.ts` module (not a class, just functions) consumed by the store.

Why:

- The project already uses Zustand with exactly this pattern (see `mapStore` — it's a self-contained store with actions)
- better-auth's cookie-based sessions mean there's no token to manage — just call endpoints with `credentials: 'include'` and check `get-session` on app load
- No new dependencies to install or maintain
- React Router v5's `Redirect` + `<Route>` pattern works naturally with a Zustand-based guard
- The API layer is thin enough that a separate service class adds ceremony without benefit at this stage

### Cookie & CORS Architecture

The cookie flow is the trickiest part. Here's how it needs to work:

```
Frontend (5173)                          Backend (3000)
─────────────────                        ──────────────
LoginPage:
  POST /api/auth/sign-in/email  ──────►  auth.handler()
  (credentials: 'include')               sets session cookie
  ◄────  Set-Cookie: besser.session=...

Subsequent requests:
  GET /api/protected             ──────►  authMiddleware reads cookie
  (cookie sent automatically)             auth.api.getSession()
  ◄────  200 {data}
```

**Critical config needed**:

1. **Vite proxy** (`vite.config.ts`):

   ```ts
   server: {
     proxy: {
       '/api': 'http://localhost:3000',
     },
   }
   ```

   This makes `/api/*` requests from the frontend dev server go to the backend on the same origin, avoiding CORS entirely in dev.

2. **better-auth trustedOrigins** (in `apps/backend/src/lib/auth.ts`):

   ```ts
   betterAuth({
     // ...
     trustedOrigins: ['http://localhost:5173'],
   })
   ```

   Needed only if NOT using the Vite proxy (i.e., direct cross-origin fetch).

3. **CORS middleware on backend** (in `apps/backend/src/app.ts`):
   Only needed if NOT using Vite proxy. If using proxy, the browser sees same-origin requests and no CORS headers are needed.

**Recommendation**: Use Vite proxy in dev, no CORS middleware needed. In production, serve frontend from the same origin or use a reverse proxy.

### Route Guard Pattern (React Router v5)

```tsx
// ProtectedRoute.tsx
function ProtectedRoute({ component: Component, ...rest }) {
  const session = useAuthStore(state => state.session)
  const isLoading = useAuthStore(state => state.isLoading)

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading)
          return <IonLoading />
        if (!session)
          return <Redirect to="/login" />
        return <Component {...props} />
      }}
    />
  )
}

// App.tsx
<Switch>
  <Route exact path="/login" component={LoginPage} />
  <Route exact path="/signup" component={SignupPage} />
  <ProtectedRoute exact path="/map" component={MapPage} />
  <Redirect exact path="/" to="/map" />
</Switch>
```

### Session Initialization Flow

```tsx
// App.tsx or a top-level AuthProvider component
function AuthInit({ children }) {
  const { getSession, isLoading } = useAuthStore()

  useEffect(() => {
    getSession() // calls GET /api/auth/get-session on mount
  }, [])

  if (isLoading)
    return <IonLoading /> // show splash while checking
  return children
}
```

### Risks

| Risk                                 | Likelihood | Mitigation                                                                                                                   |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Cookie not sent cross-origin**     | Medium     | Use Vite proxy in dev; serve same-origin in prod; credentials: 'include' on fetch                                            |
| **better-auth cookie config**        | Low        | Default config uses `SameSite=Lax`, `Secure` — works with proxy. May need `httpOnly` config tweaks for Capacitor native apps |
| **Session expiry UX**                | Low        | `getSession()` returns null → redirect to login. Store should clear state on 401 responses                                   |
| **Capacitor/Cordova native builds**  | Medium     | Native WebViews handle cookies differently. May need token-based fallback or `@capacitor/cookies` plugin for mobile builds   |
| **React Router v5 vs v6 diffs**      | Low        | Team must remember `Switch`, `exact`, `render` prop pattern (not `element` prop from v6)                                     |
| **Flash of unauthenticated content** | Low        | Show loading spinner while `getSession()` resolves before rendering any routes                                               |

### Ready for Proposal

**Yes.** The exploration is complete. The orchestrator should proceed to the Proposal phase.

Key decisions the proposal should nail down:

1. Whether to use Vite proxy (dev) or CORS middleware
2. Whether initial session check happens in `App.tsx` or a dedicated `AuthProvider` component
3. Whether Capacitor mobile builds are in scope (impacts cookie vs token strategy)
