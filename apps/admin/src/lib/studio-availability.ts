import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface AvailabilitySlot {
  date: string;
  time: string;
  state: "available" | "blocked_rule" | "booked" | "closed_exception";
}

function toDateString(input: Date) {
  return input.toISOString().slice(0, 10);
}

function minutesFromTimeString(time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  return hours * 60 + minutes;
}

function timeStringFromMinutes(total: number) {
  const hours = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

export async function computeAvailabilityPreview(params: {
  studioId: string;
  from: string;
  to: string;
}) {
  const supabase = getSupabaseAdmin();

  const [{ data: rules }, { data: weeklyHours }, { data: exceptions }, { data: bookings }] = await Promise.all([
    supabase.from("studio_booking_rules").select("*").eq("studio_id", params.studioId).maybeSingle(),
    supabase.from("studio_hours").select("*").eq("studio_id", params.studioId),
    supabase
      .from("studio_hour_exceptions")
      .select("*")
      .eq("studio_id", params.studioId)
      .gte("date", params.from)
      .lte("date", params.to),
    supabase
      .from("studio_bookings")
      .select("preferred_date, preferred_start_time, duration_minutes, status")
      .eq("studio_id", params.studioId)
      .in("status", ["pending", "confirmed", "rescheduled"])
      .gte("preferred_date", params.from)
      .lte("preferred_date", params.to),
  ]);

  const exceptionByDate = new Map((exceptions ?? []).map((row) => [row.date, row]));
  const bookingsByDate = new Map<string, Array<{ start: number; end: number }>>();
  for (const row of bookings ?? []) {
    if (!row.preferred_date || !row.preferred_start_time) continue;
    const start = minutesFromTimeString(row.preferred_start_time);
    const end = start + (row.duration_minutes ?? 60);
    const existing = bookingsByDate.get(row.preferred_date) ?? [];
    existing.push({ start, end });
    bookingsByDate.set(row.preferred_date, existing);
  }

  const startDate = new Date(`${params.from}T00:00:00.000Z`);
  const endDate = new Date(`${params.to}T00:00:00.000Z`);
  const now = new Date();
  const leadTimeHours = rules?.lead_time_hours ?? 24;
  const maxAdvanceDays = rules?.max_advance_days ?? 180;
  const allowWeekend = rules?.allow_weekend ?? true;

  const output: AvailabilitySlot[] = [];
  for (let date = new Date(startDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    const dateStr = toDateString(date);
    const weekday = date.getUTCDay();
    const exception = exceptionByDate.get(dateStr);

    const dayHours = (weeklyHours ?? [])
      .filter((row) => row.weekday === weekday)
      .sort((a, b) => (a.open_time ?? "").localeCompare(b.open_time ?? ""))[0];
    if (!dayHours) continue;

    const nowLeadThreshold = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);
    const maxAdvanceThreshold = new Date(now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000);

    const isWeekend = weekday === 0 || weekday === 6;
    if (!allowWeekend && isWeekend) {
      output.push({ date: dateStr, time: "00:00:00", state: "blocked_rule" });
      continue;
    }

    if (date < new Date(toDateString(nowLeadThreshold))) {
      output.push({ date: dateStr, time: "00:00:00", state: "blocked_rule" });
      continue;
    }
    if (date > new Date(toDateString(maxAdvanceThreshold))) {
      output.push({ date: dateStr, time: "00:00:00", state: "blocked_rule" });
      continue;
    }

    if (exception?.is_closed) {
      output.push({ date: dateStr, time: "00:00:00", state: "closed_exception" });
      continue;
    }

    const openTime = exception?.override_open_time ?? dayHours.open_time;
    const closeTime = exception?.override_close_time ?? dayHours.close_time;
    if (!openTime || !closeTime || !dayHours.is_open) continue;

    const slotMinutes = dayHours.slot_minutes ?? 60;
    const bufferBefore = dayHours.buffer_before_minutes ?? 0;
    const bufferAfter = dayHours.buffer_after_minutes ?? 0;
    const openMin = minutesFromTimeString(openTime);
    const closeMin = minutesFromTimeString(closeTime);
    const dayBookings = bookingsByDate.get(dateStr) ?? [];

    for (let cursor = openMin; cursor + slotMinutes <= closeMin; cursor += slotMinutes) {
      const slotStart = cursor;
      const slotEnd = cursor + slotMinutes;
      const blocked = dayBookings.some((booking) => {
        const bookingStart = booking.start - bufferBefore;
        const bookingEnd = booking.end + bufferAfter;
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
      output.push({
        date: dateStr,
        time: timeStringFromMinutes(cursor),
        state: blocked ? "booked" : "available",
      });
    }
  }

  return output;
}
