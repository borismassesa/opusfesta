import { NextRequest, NextResponse } from "next/server";
import { handleClerkWebhook } from "@opusfesta/auth/webhook";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const result = await handleClerkWebhook(body, {
    "svix-id": request.headers.get("svix-id"),
    "svix-timestamp": request.headers.get("svix-timestamp"),
    "svix-signature": request.headers.get("svix-signature"),
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
