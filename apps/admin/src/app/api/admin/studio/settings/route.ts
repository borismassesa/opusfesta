import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SettingsSchema = z.object({
  emailRecipients: z.array(z.string().email()).default([]),
  branding: z.record(z.string(), z.unknown()).default({}),
  featureFlags: z.record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.null()])).default({}),
  notificationPrefs: z.record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.null()])).default({}),
  bookingRules: z
    .object({
      leadTimeHours: z.number().int().min(0).max(720).default(24),
      maxAdvanceDays: z.number().int().min(1).max(720).default(180),
      allowWeekend: z.boolean().default(true),
      requirePhone: z.boolean().default(false),
      rescheduleWindowHours: z.number().int().min(0).max(720).default(24),
      cancellationPolicyText: z.string().default(""),
      autoConfirm: z.boolean().default(false),
      conflictPolicy: z.enum(["reject", "allow_with_warning"]).default("reject"),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const [{ data: settings }, { data: bookingRules }] = await Promise.all([
      supabase.from("studio_system_settings").select("*").eq("studio_id", studioId).maybeSingle(),
      supabase.from("studio_booking_rules").select("*").eq("studio_id", studioId).maybeSingle(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        emailRecipients: settings?.email_recipients_json ?? [],
        branding: settings?.branding_json ?? {},
        featureFlags: settings?.feature_flags_json ?? {},
        notificationPrefs: settings?.notification_prefs_json ?? {},
        bookingRules: bookingRules
          ? {
              leadTimeHours: bookingRules.lead_time_hours,
              maxAdvanceDays: bookingRules.max_advance_days,
              allowWeekend: bookingRules.allow_weekend,
              requirePhone: bookingRules.require_phone,
              rescheduleWindowHours: bookingRules.reschedule_window_hours,
              cancellationPolicyText: bookingRules.cancellation_policy_text,
              autoConfirm: bookingRules.auto_confirm,
              conflictPolicy: bookingRules.conflict_policy,
            }
          : null,
      },
    });
  });
}

export async function PUT(request: NextRequest) {
  return withStudioRole(request, "admin", async ({ actor }) => {
    const payload = await request.json();
    const parsed = SettingsSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid settings payload" }, { status: 400 });
    }

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { error: settingsError } = await supabase.from("studio_system_settings").upsert(
      {
        studio_id: studioId,
        email_recipients_json: parsed.data.emailRecipients,
        branding_json: parsed.data.branding,
        feature_flags_json: parsed.data.featureFlags,
        notification_prefs_json: parsed.data.notificationPrefs,
        updated_by: actor.userId,
      },
      { onConflict: "studio_id" }
    );

    if (settingsError) {
      return NextResponse.json({ success: false, error: settingsError.message }, { status: 500 });
    }

    const { error: rulesError } = await supabase.from("studio_booking_rules").upsert(
      {
        studio_id: studioId,
        lead_time_hours: parsed.data.bookingRules?.leadTimeHours ?? 24,
        max_advance_days: parsed.data.bookingRules?.maxAdvanceDays ?? 180,
        allow_weekend: parsed.data.bookingRules?.allowWeekend ?? true,
        require_phone: parsed.data.bookingRules?.requirePhone ?? false,
        reschedule_window_hours: parsed.data.bookingRules?.rescheduleWindowHours ?? 24,
        cancellation_policy_text: parsed.data.bookingRules?.cancellationPolicyText ?? "",
        auto_confirm: parsed.data.bookingRules?.autoConfirm ?? false,
        conflict_policy: parsed.data.bookingRules?.conflictPolicy ?? "reject",
      },
      { onConflict: "studio_id" }
    );

    if (rulesError) {
      return NextResponse.json({ success: false, error: rulesError.message }, { status: 500 });
    }

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.settings",
      entityType: "studio_settings",
      action: "settings.updated",
      context: { studioId },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  });
}
