// Push notification dispatch — fired inline (best-effort, fire-and-forget) from
// the write path after a message is sent or an inquiry's status changes, mirroring
// the codebase's existing "notify after write" convention rather than a DB trigger.
//
// The request body only ever names a row id — title/body/recipient are always
// re-derived server-side from the DB, never trusted from the caller, so this
// can't be used as an open push-spam vector.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type MessageEvent = { event: "message"; messageId: string };
type InquiryResponseEvent = { event: "inquiry_response"; inquiryId: string };
type InquiryMessageEvent = { event: "inquiry_message"; messageId: string };
type SendPushBody = MessageEvent | InquiryResponseEvent | InquiryMessageEvent;

interface PushTarget {
  title: string;
  body: string;
  data: Record<string, string>;
  recipientUserIds: string[];
}

async function resolveMessagePush(
  service: ReturnType<typeof createClient>,
  messageId: string,
): Promise<PushTarget | null> {
  const { data: message } = await service
    .from("messages")
    .select("thread_id, sender_id, content")
    .eq("id", messageId)
    .maybeSingle();
  if (!message) return null;

  const { data: thread } = await service
    .from("message_threads")
    .select("user_id, vendor_id")
    .eq("id", message.thread_id)
    .maybeSingle();
  if (!thread) return null;

  const body = String(message.content).slice(0, 140);
  const data = { type: "message", threadId: message.thread_id };

  if (message.sender_id === thread.user_id) {
    // Couple sent it — notify active vendor members.
    const { data: vendor } = await service
      .from("vendors")
      .select("business_name")
      .eq("id", thread.vendor_id)
      .maybeSingle();
    const { data: members } = await service
      .from("vendor_memberships")
      .select("user_id")
      .eq("vendor_id", thread.vendor_id)
      .eq("status", "active");
    const recipientUserIds = (members ?? []).map((m) => m.user_id as string);
    if (!recipientUserIds.length) return null;
    const { data: sender } = await service
      .from("users")
      .select("name")
      .eq("id", message.sender_id)
      .maybeSingle();
    return {
      title: sender?.name ?? "New message",
      body,
      data,
      recipientUserIds,
    };
  }

  // Vendor-side member sent it — notify the couple.
  const { data: vendor } = await service
    .from("vendors")
    .select("business_name")
    .eq("id", thread.vendor_id)
    .maybeSingle();
  return {
    title: vendor?.business_name ?? "New message",
    body,
    data,
    recipientUserIds: [thread.user_id as string],
  };
}

// inquiry_messages RLS is USING (false) for every client role, so this event
// is only accepted from service-role callers (the inquiry-messages function
// and any server-side route holding the key).
async function resolveInquiryMessagePush(
  service: ReturnType<typeof createClient>,
  messageId: string,
): Promise<PushTarget | null> {
  const { data: message } = await service
    .from("inquiry_messages")
    .select("inquiry_id, sender_type, sender_name, content")
    .eq("id", messageId)
    .maybeSingle();
  if (!message) return null;

  const { data: inquiry } = await service
    .from("inquiries")
    .select("user_id, vendor_id")
    .eq("id", message.inquiry_id)
    .maybeSingle();
  if (!inquiry) return null;

  const body = String(message.content).slice(0, 140);
  const data = { type: "inquiry", inquiryId: message.inquiry_id as string };

  if (message.sender_type === "vendor") {
    // Vendor replied — notify the couple, if the inquiry has an account.
    if (!inquiry.user_id) return null;
    return {
      title: (message.sender_name as string) ?? "New message",
      body,
      data,
      recipientUserIds: [inquiry.user_id as string],
    };
  }

  // Couple replied — notify active vendor members.
  const { data: members } = await service
    .from("vendor_memberships")
    .select("user_id")
    .eq("vendor_id", inquiry.vendor_id)
    .eq("status", "active");
  const recipientUserIds = (members ?? []).map((m) => m.user_id as string);
  if (!recipientUserIds.length) return null;
  return {
    title: (message.sender_name as string) ?? "New message",
    body,
    data,
    recipientUserIds,
  };
}

async function resolveInquiryResponsePush(
  service: ReturnType<typeof createClient>,
  inquiryId: string,
): Promise<PushTarget | null> {
  const { data: inquiry } = await service
    .from("inquiries")
    .select("user_id, vendor_id, status")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry || !inquiry.user_id) return null;

  const { data: vendor } = await service
    .from("vendors")
    .select("business_name")
    .eq("id", inquiry.vendor_id)
    .maybeSingle();

  const statusPhrase: Record<string, string> = {
    responded: "responded to your inquiry",
    accepted: "accepted your inquiry",
    declined: "declined your inquiry",
    closed: "closed your inquiry",
  };

  return {
    title: vendor?.business_name ?? "Inquiry update",
    body: `${vendor?.business_name ?? "A vendor"} ${statusPhrase[inquiry.status as string] ?? "updated your inquiry"}.`,
    data: { type: "inquiry", inquiryId },
    recipientUserIds: [inquiry.user_id as string],
  };
}

async function dispatchExpoPush(
  service: ReturnType<typeof createClient>,
  target: PushTarget,
): Promise<number> {
  const { data: tokens } = await service
    .from("push_device_tokens")
    .select("token")
    .in("user_id", target.recipientUserIds);
  const pushTokens = (tokens ?? []).map((t) => t.token as string);
  if (!pushTokens.length) return 0;

  const messages = pushTokens.map((to) => ({
    to,
    title: target.title,
    body: target.body,
    data: target.data,
    sound: "default",
  }));

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    console.error("[send-push] Expo push API error", res.status, await res.text());
    return 0;
  }
  return pushTokens.length;
}

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const isServiceRole = authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
    const body = (await req.json()) as SendPushBody;

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!isServiceRole) {
      // inquiry_messages is RLS-blocked for every client role, so no caller
      // probe can validate this event — service-role only.
      if (body.event === "inquiry_message") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify the caller can actually see the referenced row (RLS-gated)
      // before dispatching anything on their behalf. For inquiry_response
      // this lets vendor members (is_vendor_member RLS on inquiries) notify
      // the couple after responding/accepting from mobile, not just the
      // service-role admin path.
      const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const probe =
        body.event === "message"
          ? await caller.from("messages").select("id").eq("id", body.messageId).maybeSingle()
          : await caller.from("inquiries").select("id").eq("id", body.inquiryId).maybeSingle();
      if (!probe.data) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const target =
      body.event === "message"
        ? await resolveMessagePush(service, body.messageId)
        : body.event === "inquiry_message"
          ? await resolveInquiryMessagePush(service, body.messageId)
          : await resolveInquiryResponsePush(service, body.inquiryId);

    if (!target) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const sent = await dispatchExpoPush(service, target);
    return new Response(JSON.stringify({ sent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-push] unhandled error", error);
    return new Response(JSON.stringify({ sent: 0, error: String(error) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
