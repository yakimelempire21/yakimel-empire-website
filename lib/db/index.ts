import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database client. Uses DATABASE_URL (on Vercel: the Supabase *shared*
 * transaction pooler, aws-0-…pooler.supabase.com:6543 — never db.<ref>.supabase.co,
 * which is IPv6-only and unreachable from Vercel).
 *
 * Every step has a hard time limit, so a database problem shows a clear error
 * after a few seconds instead of hanging until Vercel's 504 timeout.
 */
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function pool() {
  if (!globalForDb.pgPool) {
    const url = process.env.DATABASE_URL || "postgres://not-configured@localhost/none";
    globalForDb.pgPool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 5_000, // release idle connections quickly (serverless)
      connectionTimeoutMillis: 8_000, // give up connecting after 8 s
      query_timeout: 15_000, // and on any single query after 15 s
      keepAlive: true,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false },
    });
    // A broken connection must never crash the server process.
    globalForDb.pgPool.on("error", (error) => console.error("[db] idle connection error:", error.message));
    // Vercel Fluid compute: close idle connections before the instance is suspended,
    // so no request ever waits on a dead connection.
    attachDatabasePool(globalForDb.pgPool);
  }
  return globalForDb.pgPool;
}

export const db = drizzle({ client: pool(), schema });

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export * as tables from "./schema";
