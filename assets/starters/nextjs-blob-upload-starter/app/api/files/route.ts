import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ files: [] });
  }

  try {
    const { blobs } = await list({
      prefix: "demo-uploads/"
    });

    return NextResponse.json({
      files: blobs
        .sort((left, right) => Number(new Date(right.uploadedAt)) - Number(new Date(left.uploadedAt)))
        .map((blob) => ({
          pathname: blob.pathname,
          url: blob.url,
          size: blob.size,
          uploadedAt: blob.uploadedAt
        }))
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown Blob listing error",
        files: []
      },
      { status: 500 }
    );
  }
}
