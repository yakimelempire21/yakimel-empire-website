import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env.local on its own (Vercel provides the env in CI).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — use the environment as is.
}

// Migrations use the direct (unpooled) connection when available.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});
