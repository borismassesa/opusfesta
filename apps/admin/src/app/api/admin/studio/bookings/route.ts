import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStudioRole } from "@/lib/studio-api";
import {
  BookingListQuerySchema,
  StudioBookingStatusSchema,
  createAdminAuditEvent,
  getDefaultStudioId,
} from "@/lib/studio-data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const CreateBookingSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().nullable(),
  eventType: z.string().min(1),
  serviceId: z.string().uuid().optional().nullable(),
  preferredDate: z.string().min(1),
  preferredStartTime: z.string().optional().nullable(),
  durationMinutes: z.number().int().min(15).max(720).default(60),
  location: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  status: StudioBookingStatusSchema.default("pending"),
});

function mapSort(sort: z.infer<typeof BookingListQuerySchema>["sort"]) {
  switch (sort) {
    case "created_asc":
      return { column: "created_at", ascending: true };
    case "date_asc":
      return { column: "preferred_date", ascending: true };
    case "date_desc":
      return { column: "preferred_date", ascending: false };
    default:
      return { column: "created_at", ascending: false };
  }
}

export async function GET(request: NextRequest) {
  return withStudioRole(request, "viewer", async () => {
    const parsed = BookingListQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400 });
    }

    const { q, status, dateFrom, dateTo, serviceId, page, pageSize, sort } = parsed.data;
    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const sortConfig = mapSort(sort);
    const offset = (page - 1) * pageSize;
    const statuses = status ? status.split(",").map((item) => item.trim()) : [];

    let query = supabase
      .from("studio_bookings")
      .select("*, studio_services(id,title,slug)", { count: "exact" })
      .eq("studio_id", studioId);

    if (q) {
      query = query.or(
        `customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,event_type.ilike.%${q}%`
      );
    }

    if (statuses.length > 0) {
      query = query.in("status", statuses);
    }
    if (dateFrom) query = query.gte("preferred_date", dateFrom);
    if (dateTo) query = query.lte("preferred_date", dateTo);
    if (serviceId) query = query.eq("service_id", serviceId);

    const { data, error, count } = await query
      .order(sortConfig.column, { ascending: sortConfig.ascending })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return withStudioRole(request, "staff", async ({ actor }) => {
    const payload = await request.json();
    const parsed = CreateBookingSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const studioId = await getDefaultStudioId();
    const supabase = getSupabaseAdmin();
    const insertPayload = {
      studio_id: studioId,
      customer_name: parsed.data.customerName,
      customer_email: parsed.data.customerEmail.toLowerCase(),
      customer_phone: parsed.data.customerPhone ?? null,
      event_type: parsed.data.eventType,
      service_id: parsed.data.serviceId ?? null,
      preferred_date: parsed.data.preferredDate,
      preferred_start_time: parsed.data.preferredStartTime ?? null,
      duration_minutes: parsed.data.durationMinutes,
      location: parsed.data.location ?? null,
      message: parsed.data.message ?? null,
      status: parsed.data.status,
      source: "admin_manual",
      assigned_staff_id: actor.userId,
    };

    const { data, error } = await supabase
      .from("studio_bookings")
      .insert(insertPayload)
      .select("*")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? "Failed to create booking" },
        { status: 500 }
      );
    }

    await supabase.from("studio_booking_activity").insert({
      booking_id: data.id,
      action_type: "booking.created",
      action_details: { source: "admin", status: data.status },
      performed_by: actor.userId,
    });

    await createAdminAuditEvent({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      module: "studio.bookings",
      entityType: "booking",
      entityId: data.id,
      action: "booking.created",
      context: { source: "admin" },
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  });
}
