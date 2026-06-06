import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { role } from "../schema";

function findLocalD1Db(): string {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  const files = readdirSync(d1Dir).filter(
    (f) => f.endsWith(".sqlite") && f !== "metadata.sqlite",
  );
  if (files.length === 0) {
    throw new Error(`No local D1 database found in ${d1Dir}. Run wrangler first.`);
  }
  return join(d1Dir, files[0]);
}

/**
 * Seeds the `role` table with default application roles.
 *
 * Local dev:
 *   bun run src/db/scripts/seed.ts
 *
 * Production D1:
 *   wrangler d1 execute map-project-db --remote \
 *     --command="INSERT OR IGNORE INTO role (name) VALUES ('registered'),('admin'),('premium'),('moderator')"
 */
export async function seedUserRoles() {
  const db = drizzle(createClient({ url: `file:${findLocalD1Db()}` }));

  await db
    .insert(role)
    .values([
      { name: "registered" },
      { name: "admin" },
      { name: "premium" },
      { name: "moderator" },
    ])
    .onConflictDoNothing();

  console.log("✅ Roles seeded");
  process.exit(0);
}

// Run directly: bun run src/db/scripts/seed.ts
seedUserRoles();
