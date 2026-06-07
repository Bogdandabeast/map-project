// ── Core (Better Auth) ──────────────────────────────────────────
export { user, session, account, verification, role, jwks } from "./auth";

// ── App tables ──────────────────────────────────────────────────
export { userSettings } from "./user-settings";
export { game } from "./game";
export { userGames } from "./user-games";

// ── Relations ───────────────────────────────────────────────────
export {
  userRelations,
  sessionRelations,
  accountRelations,
  userSettingsRelations,
  gameRelations,
  userGamesRelations,
} from "./relations";
