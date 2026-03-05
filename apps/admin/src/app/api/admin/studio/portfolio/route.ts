import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PortfolioSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().default(""),
  description: z.string().default(""),
  fullDescription: z.string().default(""),
  coverMediaId: z.string().uuid().optional().nullable(),
  mediaIds: z.array(z.string().uuid()).default([]),
  statsJson: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  highlightsJson: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_portfolio_items")
      .select("*")
      .eq("studio_id", studioId)
      .order("display_order", { ascending: true });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data ?? [] });
  });
}

export async function POST(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = PortfolioSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_portfolio_items")
      .insert({
        studio_id: studioId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        full_description: parsed.data.fullDescription,
        cover_media_id: parsed.data.coverMediaId ?? null,
        media_ids: parsed.data.mediaIds,
        stats_json: parsed.data.statsJson,
        highlights_json: parsed.data.highlightsJson,
        published: parsed.data.published,
        published_at: parsed.data.published ? new Date().toISOString() : null,
        display_order: parsed.data.displayOrder,
      })
      .select("*")
      .single();
    if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "Failed" }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "portfolio_item",
      entityId: data.id,
      action: "portfolio.item_created",
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = PortfolioSchema.extend({ id: z.string().uuid() }).safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const updates = {
      slug: parsed.data.slug,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      full_description: parsed.data.fullDescription,
      cover_media_id: parsed.data.coverMediaId ?? null,
      media_ids: parsed.data.mediaIds,
      stats_json: parsed.data.statsJson,
      highlights_json: parsed.data.highlightsJson,
      published: parsed.data.published,
      published_at: parsed.data.published ? new Date().toISOString() : null,
      display_order: parsed.data.displayOrder,
    };

    const { data, error } = await supabase
      .from("studio_portfolio_items")
      .update(updates)
      .eq("id", parsed.data.id)
      .select("*")
      .single();

    if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "Failed" }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "portfolio_item",
      entityId: data.id,
      action: "portfolio.item_updated",
    });

    return NextResponse.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return withStudioRole(request, "admin", async ({ actor }) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("studio_portfolio_items").delete().eq("id", id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "portfolio_item",
      entityId: id,
      action: "portfolio.item_deleted",
    });

    return NextResponse.json({ success: true });
  });
}
