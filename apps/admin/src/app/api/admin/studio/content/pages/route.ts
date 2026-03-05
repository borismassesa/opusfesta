import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const UpsertPageSchema = z.object({
  slug: z.string().min(1),
  draftContent: z.record(z.string(), z.unknown()),
  publish: z.boolean().default(false),
});

const STUDIO_PAGE_PREFIX = "studio:";

function scopedSlug(slug: string) {
  return slug.startsWith(STUDIO_PAGE_PREFIX) ? slug : `${STUDIO_PAGE_PREFIX}${slug}`;
}

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const supabase = getSupabaseAdmin();
    const slug = new URL(request.url).searchParams.get("slug");

    let query = supabase
      .from("cms_pages")
      .select("id,slug,draft_content,published_content,published,published_at,updated_at,updated_by")
      .like("slug", `${STUDIO_PAGE_PREFIX}%`)
      .order("slug", { ascending: true });
    if (slug) query = query.eq("slug", scopedSlug(slug));

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = UpsertPageSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    if (parsed.data.publish && actor.role === "staff") {
      return NextResponse.json({ success: false, error: "Only admin/owner can publish" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const slug = scopedSlug(parsed.data.slug);
    const { data: existing } = await supabase.from("cms_pages").select("*").eq("slug", slug).maybeSingle();

    const basePayload = {
      slug,
      draft_content: parsed.data.draftContent,
      published: parsed.data.publish ? true : existing?.published ?? false,
      published_content: parsed.data.publish
        ? parsed.data.draftContent
        : existing?.published_content ?? parsed.data.draftContent,
      published_at: parsed.data.publish ? new Date().toISOString() : existing?.published_at ?? null,
      published_by: parsed.data.publish ? actor.userId : existing?.published_by ?? null,
      updated_by: actor.userId,
    };

    const { data, error } = await supabase
      .from("cms_pages")
      .upsert(basePayload, { onConflict: "slug" })
      .select("id,slug,draft_content,published_content,published,published_at,updated_at,updated_by")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message ?? "Failed to save page" }, { status: 500 });
    }

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "cms_page",
      entityId: data.id,
      action: parsed.data.publish ? "content.page_published" : "content.page_saved_draft",
      context: { slug },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data });
  });
}
