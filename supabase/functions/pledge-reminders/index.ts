// Pledge reminder sweep — invoked on a schedule (pg_cron) to chase pledges that
// are still owing and have come due for a follow-up.
//
// Phased automation: actual sending is gated on the MESSAGING_PROVIDER env var.
// Until a WhatsApp Business / SMS provider is wired up, this function is a no-op
// on *sending* — it only reports how many pledges are due, and leaves their
// `next_reminder_at` untouched so the dashboard "Reminders due" queue keeps
// surfacing them for one-tap manual send. Once MESSAGING_PROVIDER is set (and the
// matching credentials provided), each due pledge is messaged, logged with
// channel 'auto', and its schedule advanced by its cadence.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// e.g. "whatsapp_cloud" | "africastalking" | "twilio". Unset = manual-only mode.
const MESSAGING_PROVIDER = Deno.env.get("MESSAGING_PROVIDER") ?? "";

const CADENCE_DAYS: Record<string, number> = { weekly: 7, biweekly: 14 };

interface DuePledge {
  id: string;
  user_id: string;
  guest_contact_id: string;
  pledged_amount: number;
  amount_received: number;
  currency: string;
  reminder_cadence: string;
  reminder_count: number;
}

function nextReminderAt(cadence: string, from: Date): string | null {
  const days = CADENCE_DAYS[cadence];
  if (!days) return null;
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

/**
 * Send a single reminder via the configured provider. Stubbed: wire your
 * WhatsApp/SMS provider here keyed on MESSAGING_PROVIDER. Returns false when no
 * provider is configured so the caller leaves the schedule untouched.
 */
async function sendReminder(_phone: string | null, _text: string): Promise<boolean> {
  if (!MESSAGING_PROVIDER) return false;
  // TODO: implement per-provider dispatch (WhatsApp Cloud API / Africa's Talking
  // / Twilio) using provider credentials from env. Intentionally unimplemented
  // until a provider account is connected.
  console.warn(`[pledge-reminders] MESSAGING_PROVIDER='${MESSAGING_PROVIDER}' set but no dispatcher implemented`);
  return false;
}

Deno.serve(async (req: Request) => {
  // Only the cron job (or an operator) holding the service-role key may run this.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();

  const { data: due, error } = await supabase
    .from("event_pledges")
    .select("id, user_id, guest_contact_id, pledged_amount, amount_received, currency, reminder_cadence, reminder_count")
    .in("status", ["invited", "pledged", "partial"])
    .neq("reminder_cadence", "none")
    .not("next_reminder_at", "is", null)
    .lte("next_reminder_at", now.toISOString());
  if (error) {
    console.error("[pledge-reminders] query failed", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pledges = (due ?? []) as DuePledge[];

  // Manual-only mode: report the backlog, leave schedules so the dashboard queue
  // keeps showing them.
  if (!MESSAGING_PROVIDER) {
    return new Response(
      JSON.stringify({ mode: "manual", due: pledges.length, sent: 0 }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  // Automated mode: pull contact phones and dispatch.
  const contactIds = [...new Set(pledges.map((p) => p.guest_contact_id))];
  const { data: contacts } = await supabase
    .from("guest_contacts")
    .select("id, whatsapp_phone, phone")
    .in("id", contactIds);
  const phoneById = new Map(
    (contacts ?? []).map((c: { id: string; whatsapp_phone: string | null; phone: string | null }) => [
      c.id,
      c.whatsapp_phone ?? c.phone,
    ]),
  );

  let sent = 0;
  for (const p of pledges) {
    const owing = Math.max(0, Number(p.pledged_amount) - Number(p.amount_received));
    const text = `Gentle reminder about your pledge of ${owing || p.pledged_amount} ${p.currency}.`;
    const ok = await sendReminder(phoneById.get(p.guest_contact_id) ?? null, text);
    if (!ok) continue;
    sent += 1;
    await supabase
      .from("event_pledges")
      .update({
        last_reminded_at: now.toISOString(),
        reminder_count: p.reminder_count + 1,
        next_reminder_at: nextReminderAt(p.reminder_cadence, now),
      })
      .eq("id", p.id);
    await supabase
      .from("pledge_reminder_log")
      .insert({ user_id: p.user_id, pledge_id: p.id, channel: "auto" });
  }

  return new Response(
    JSON.stringify({ mode: "auto", provider: MESSAGING_PROVIDER, due: pledges.length, sent }),
    { headers: { "Content-Type": "application/json" } },
  );
});
