import { neon } from "@neondatabase/serverless";
import { loadFeatureFlags } from "./feature-flags";

export async function loadDashboardData() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { flags, hasEdgeConfig, edgeConfigError } = await loadFeatureFlags();

  let database = {
    connected: false,
    error: null as string | null,
    name: "not-connected",
    time: "Provision Neon to load live database time.",
    version: "Waiting for DATABASE_URL"
  };

  if (hasDatabaseUrl) {
    try {
      const sql = neon(process.env.DATABASE_URL as string);
      const rows = await sql`
        SELECT
          current_database() AS database_name,
          now()::text AS server_time,
          version() AS version
      `;

      database = {
        connected: true,
        error: null,
        name: String(rows[0]?.database_name ?? "postgres"),
        time: String(rows[0]?.server_time ?? ""),
        version: String(rows[0]?.version ?? "")
      };
    } catch (error) {
      database = {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown database error",
        name: "connection-error",
        time: "Database query failed",
        version: "Check DATABASE_URL"
      };
    }
  }

  return {
    hasClerk,
    hasEdgeConfig,
    edgeConfigError,
    database,
    flags,
    metrics: [
      { label: "Auth Provider", value: hasClerk ? "Clerk live" : "Awaiting Clerk" },
      { label: "Database", value: database.connected ? "Neon live" : "Awaiting Neon" },
      { label: "Feature Flags", value: hasEdgeConfig ? "Edge Config live" : "Fallback flags" }
    ]
  };
}
