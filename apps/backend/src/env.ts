/**
 * Re-export from the shared @repo/env package.
 *
 * `parseEnv` is the main validator used at the handler level.
 * `BackendEnv` is the auth/binding type (no frontend vars).
 */
export {
  type BackendEnv,
  parseBackendEnv as parseEnv,
} from '@repo/env'
