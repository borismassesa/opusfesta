import { NextRequest, NextResponse } from "next/server";
import { withStudioRole } from "@/lib/studio-api";
import { getDefaultStudioId } from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function dateStringWithOffset(days: number) {
  const now = new Date();
  const target = new Date(now);
  target.setUTCDate(now.getUTCDate() + days);
  return target.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const today = dateStringWithOffset(0);
    const weekEnd = dateStringWithOffset(7);

    const [todayResult, weekResult, upcomingResult, cancellationResult, alertsResult] = await Promise.all([
      supabase
        .from("studio_bookings")
        .select("id", { count: "exact", head: true })
        .eq("studio_id", studioId)
        .eq("preferred_date", today),
      supabase
        .from("studio_bookings")
        .select("id", { count: "exact", head: true })
        .eq("studio_id", studioId)
        .gte("preferred_date", today)
        .lte("preferred_date", weekEnd),
      supabase
        .from("studio_bookings")
        .select("id", { count: "exact", head: true })
        .eq("studio_id", studioId)
        .in("status", ["pending", "confirmed", "rescheduled"])
        .gte("preferred_date", today),
      supabase
        .from("studio_bookings")
        .select("id", { count: "exact", head: true })
        .eq("studio_id", studioId)
        .eq("status", "cancelled")
        .gte("created_at", `${today}T00:00:00.000Z`),
      supabase
        .from("system_alerts")
        .select("*")
        .eq("studio_id", studioId)
        .in("status", ["open", "acknowledged"])
        .order("last_seen_at", { ascending: false })
        .limit(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        todayBookings: todayResult.count ?? 0,
        weekBookings: weekResult.count ?? 0,
        upcomingBookings: upcomingResult.count ?? 0,
        cancellations: cancellationResult.count ?? 0,
        alerts: alertsResult.data ?? [],
      },
    });
  });
}
