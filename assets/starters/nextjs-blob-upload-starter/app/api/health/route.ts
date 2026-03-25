import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    hasBlobReadWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  });
}
