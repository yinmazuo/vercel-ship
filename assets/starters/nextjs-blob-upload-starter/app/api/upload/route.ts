import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob store is not configured for this project." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  try {
    const blob = await put(`demo-uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: false
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Blob upload error" },
      { status: 500 }
    );
  }
}
