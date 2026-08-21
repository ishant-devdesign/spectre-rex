import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Migrations must run over a DIRECT connection (port 5432). Supabase's
 * transaction pooler on 6543 does not support the prepared statements and
 * session state that DDL needs, so DIRECT_DATABASE_URL wins when present.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
});
