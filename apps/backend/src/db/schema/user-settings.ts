import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  language: text("language").notNull().default("es"),
  theme: text("theme").notNull().default("system"),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
});
