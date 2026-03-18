import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const StudioBookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "rescheduled",
  "completed",
]);

export const StudioSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const BookingListQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  sort: z.enum(["created_desc", "created_asc", "date_asc", "date_desc"]).default("created_desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function getDefaultStudioId(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("studio_sites")
    .select("id")
    .eq("slug", "default")
    .single();

  if (error || !data) {
    throw new Error("Studio site not initialized");
  }

  return data.id;
}

export async function createAdminAuditEvent(input: {
  actorUserId: string | null;
  actorEmail?: string | null;
  module: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  diff?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_audit_log").insert({
    actor_user_id: input.actorUserId,
    actor_email: input.actorEmail ?? null,
    module: input.module,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    diff_json: input.diff ?? null,
    context_json: input.context ?? null,
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
  });
}
