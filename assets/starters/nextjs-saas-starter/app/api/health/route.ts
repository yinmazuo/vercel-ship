import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasClerkSecretKey = Boolean(process.env.CLERK_SECRET_KEY);
  const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  let dbOk = false;
  let dbError: string | null = null;

  if (hasDatabaseUrl) {
    try {
      const sql = neon(process.env.DATABASE_URL as string);
      const rows = await sql`SELECT 1 AS ok`;
      dbOk = rows[0]?.ok === 1;
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Unknown database error";
    }
  }

  return NextResponse.json({
    hasDatabaseUrl,
    hasClerkSecretKey,
    hasClerkPublishableKey,
    dbOk,
    dbError
  });
}
