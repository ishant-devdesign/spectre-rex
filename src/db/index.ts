import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Postgres client.
 *
 * Nothing runs at import time. The previous version threw on a missing
 * DATABASE_URL as soon as the module was loaded, which turns a missing
 * env var into a failed *build* rather than a failed request — Next
 * imports route modules while collecting page data.
 *
 * On Vercel each lambda gets its own pool, so the pool is deliberately
 * small and cached on globalThis to survive hot reloads and warm
 * invocations. Point DATABASE_URL at Supabase's transaction pooler
 * (port 6543); the direct 5432 connection runs out of slots quickly
 * under serverless traffic.
 */

const globalForDb = globalThis as typeof globalThis & {
  __srxPool?: Pool;
};

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Supabase connection string.",
    );
  }

  return new Pool({
    connectionString,
    /* Supabase terminates TLS at the pooler with a chain Node has no root
       for, so verification is relaxed rather than TLS disabled. */
    ssl: /supabase\.(co|com)/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!globalForDb.__srxPool) {
    globalForDb.__srxPool = createPool();
  }
  return globalForDb.__srxPool;
}

export function getDb() {
  return drizzle(getPool());
}
