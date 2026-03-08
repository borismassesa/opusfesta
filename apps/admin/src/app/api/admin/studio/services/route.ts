import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ServiceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  priceFromCents: z.number().int().min(0).default(0),
  currency: z.string().default("TZS"),
  defaultDurationMinutes: z.number().int().min(15).max(720).default(60),
  includesJson: z.array(z.string()).default([]),
  heroMediaId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_services")
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
    const parsed = ServiceSchema.safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("studio_services")
      .insert({
        studio_id: studioId,
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        price_from_cents: parsed.data.priceFromCents,
        currency: parsed.data.currency,
        default_duration_minutes: parsed.data.defaultDurationMinutes,
        includes_json: parsed.data.includesJson,
        hero_media_id: parsed.data.heroMediaId ?? null,
        display_order: parsed.data.displayOrder,
        is_active: parsed.data.isActive,
      })
      .select("*")
      .single();
    if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "Failed" }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "service",
      entityId: data.id,
      action: "service.created",
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = ServiceSchema.extend({ id: z.string().uuid() }).safeParse(payload);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const updates = {
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      price_from_cents: parsed.data.priceFromCents,
      currency: parsed.data.currency,
      default_duration_minutes: parsed.data.defaultDurationMinutes,
      includes_json: parsed.data.includesJson,
      hero_media_id: parsed.data.heroMediaId ?? null,
      display_order: parsed.data.displayOrder,
      is_active: parsed.data.isActive,
    };

    const { data, error } = await supabase
      .from("studio_services")
      .update(updates)
      .eq("id", parsed.data.id)
      .eq("studio_id", studioId)
      .select("*")
      .single();

    if (error || !data) return NextResponse.json({ success: false, error: error?.message ?? "Failed" }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "service",
      entityId: data.id,
      action: "service.updated",
    });

    return NextResponse.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return withStudioRole(request, "admin", async ({ actor }) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("studio_services").delete().eq("id", id).eq("studio_id", studioId);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.content",
      entityType: "service",
      entityId: id,
      action: "service.deleted",
    });

    return NextResponse.json({ success: true });
  });
}
