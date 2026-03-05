import { NextRequest, NextResponse } from "next/server";
import { withStudioRole } from "@/lib/studio-api";
import { createAdminAuditEvent, getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const input = String(value);
  if (input.includes(",") || input.includes('"') || input.includes("\n")) {
    return `"${input.replace(/"/g, '""')}"`;
  }
  return input;
}

export async function GET(request: NextRequest) {
  return withStudioRole(request, "admin", async ({ actor }) => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let query = supabase
      .from("studio_bookings")
      .select("id,customer_name,customer_email,customer_phone,event_type,preferred_date,preferred_start_time,status,created_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (dateFrom) query = query.gte("preferred_date", dateFrom);
    if (dateTo) query = query.lte("preferred_date", dateTo);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    const header = [
      "id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "event_type",
      "preferred_date",
      "preferred_start_time",
      "status",
      "created_at",
    ];
    const lines = [
      header.join(","),
      ...rows.map((row) => header.map((field) => csvEscape((row as Record<string, unknown>)[field])).join(",")),
    ];
    const csv = lines.join("\n");

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.bookings",
      entityType: "booking_export",
      action: "booking.exported",
      context: {
        status: status ?? null,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        rowCount: rows.length,
      },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="studio-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  });
}
