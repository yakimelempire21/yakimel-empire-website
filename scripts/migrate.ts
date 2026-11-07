/**
 * Applies database migrations from ./drizzle, with clear success/error output.
 *
 *   npm run db:migrate
 *
 * Uses DATABASE_URL_UNPOOLED (direct / session connection) when set,
 * otherwise DATABASE_URL. Reads .env.local automatically.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — use the environment as is (e.g. CI).
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

let host = "?";
try {
  const u = new URL(url);
  host = `${u.hostname}:${u.port || 5432}`;
} catch {
  console.error("✗ The database URL is not valid. Check DATABASE_URL_UNPOOLED / DATABASE_URL in .env.local.");
  process.exit(1);
}

console.log(`Connecting to ${host}…`);
const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 15, onnotice: () => {} });

migrate(drizzle({ client: sql }), { migrationsFolder: "./drizzle" })
  .then(async () => {
    console.log("✓ Database is up to date.");
    await sql.end();
  })
  .catch(async (error: unknown) => {
    // Drizzle wraps driver errors; the real reason is in `cause`.
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
    const message = cause || (error instanceof Error ? error.message : String(error));
    console.error(`✗ Migration failed: ${message}`);
    if (/ENOTFOUND|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|ECONNREFUSED|timeout/i.test(message) && host.startsWith("db.")) {
      console.error(
        "  This looks like Supabase's IPv6-only address. Use the Session pooler address instead:\n" +
          "  aws-0-<region>.pooler.supabase.com:5432 (Supabase → Connect → Session pooler).",
      );
    }
    await sql.end({ timeout: 1 }).catch(() => {});
    process.exit(1);
  });
