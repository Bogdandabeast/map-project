import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { userSettings } from "./user-settings";
import { game } from "./game";
import { userGames } from "./user-games";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  settings: one(userSettings, {
    fields: [user.id],
    references: [userSettings.userId],
  }),
  games: many(userGames),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));

export const gameRelations = relations(game, ({ many }) => ({
  userGames: many(userGames),
}));

export const userGamesRelations = relations(userGames, ({ one }) => ({
  user: one(user, {
    fields: [userGames.userId],
    references: [user.id],
  }),
  game: one(game, {
    fields: [userGames.gameId],
    references: [game.id],
  }),
}));
