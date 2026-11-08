import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database client. Uses DATABASE_URL (on Vercel, the pooled Neon URL).
 * One connection pool is reused across hot reloads in development.
 */
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function client() {
  // postgres() connects lazily on the first query, so a missing URL only
  // fails when the database is actually used (not at build time).
  const url = process.env.DATABASE_URL || "postgres://not-configured@localhost/none";
  if (!globalForDb.pgClient) {
    const options = {
      // Serverless: keep few connections per instance and release them quickly,
      // so Supabase's connection limit is never exhausted.
      max: 3,
      idle_timeout: 15, // close a connection after 15 s without use
      max_lifetime: 60 * 5, // and recycle every connection after 5 minutes
      connect_timeout: 10,
      // Pooled (PgBouncer / Supavisor) connections don't support prepared statements.
      prepare: false,
    };
    try {
      globalForDb.pgClient = postgres(url, options);
    } catch (error) {
      // A malformed DATABASE_URL must not crash every admin page at import time.
      console.error("DATABASE_URL is not a valid Postgres connection string:", error);
      globalForDb.pgClient = postgres("postgres://invalid-database-url@localhost/none", options);
    }
  }
  return globalForDb.pgClient;
}

export const db = drizzle({ client: client(), schema });

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export * as tables from "./schema";
