// ── Core (Better Auth) ──────────────────────────────────────────
export { account, jwks, role, session, user, verification } from './auth'

export {
  eventAttendees,
  eventAttendeesRelations,
  events,
  eventsRelations,
  insertAttendeeSchema,
  insertEventSchema,
  selectAttendeeSchema,
  selectEventSchema,
} from './events-core'
export { game } from './game'
// ── Relations ───────────────────────────────────────────────────
export {
  accountRelations,
  gameRelations,
  sessionRelations,
  userGamesRelations,
  userRelations,
  userSettingsRelations,
} from './relations'
export { userGames } from './user-games'

// ── App tables ──────────────────────────────────────────────────
export { userSettings } from './user-settings'
