import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MediaSchema = z.object({
  storagePath: z.string().min(1),
  publicUrl: z.string().url(),
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().nonnegative().default(0),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  durationSeconds: z.number().int().nonnegative().optional().nullable(),
  altText: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_media_assets")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function POST(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = MediaSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_media_assets")
      .insert({
        studio_id: studioId,
        storage_path: parsed.data.storagePath,
        public_url: parsed.data.publicUrl,
        media_type: parsed.data.mediaType,
        mime_type: parsed.data.mimeType,
        file_size_bytes: parsed.data.fileSizeBytes,
        width: parsed.data.width ?? null,
        height: parsed.data.height ?? null,
        duration_seconds: parsed.data.durationSeconds ?? null,
        alt_text: parsed.data.altText ?? null,
        created_by: actor.userId,
      })
      .select("*")
      .single();
    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message ?? "Failed to create media" }, { status: 500 });
    }

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "media_asset",
      entityId: data.id,
      action: "media.asset_created",
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  });
}
