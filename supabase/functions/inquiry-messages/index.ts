// Inquiry message thread access for mobile. inquiry_messages RLS is
// `USING (false)` for every client role by design — the couple-facing Next.js
// apps (opus_website/opus_pass) and vendors_portal all go through
// service-role API routes. Mobile has no server of its own, so this function
// is its service-role write path.
//
// Authorization is a probe-read: a caller who can SELECT the inquiry through
// their own RLS (is_vendor_member for vendor members, owner for the couple)
// may list and post on its thread. Response shapes mirror vendors_portal's
// api/inquiries/[id]/messages route, including the synthetic `initial`
// message built from the inquiry itself.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const JSON_HEADERS = { "Content-Type": "application/json" };

type RequestBody = {
  action?: "list" | "send";
  inquiryId?: string;
  content?: string;
};

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), { status, headers: JSON_HEADERS });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return errorResponse("Missing authorization", 401);

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }
    const { action, inquiryId } = body;
    if ((action !== "list" && action !== "send") || !inquiryId) {
      return errorResponse("action ('list'|'send') and inquiryId are required", 400);
    }

    // The caller-auth client resolves both identity (own users row) and
    // authorization (inquiry visible through their RLS) in two reads.
    const caller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: me } = await caller.from("users").select("id, name").maybeSingle();
    if (!me) return errorResponse("Unauthorized", 401);

    const { data: inquiry } = await caller
      .from("inquiries")
      .select("id, vendor_id, user_id, name, message, status, created_at")
      .eq("id", inquiryId)
      .maybeSingle();
    if (!inquiry) return errorResponse("Inquiry not found", 404);

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const isCouple = inquiry.user_id != null && inquiry.user_id === me.id;

    if (action === "list") {
      const { data: messages, error } = await service
        .from("inquiry_messages")
        .select("id, sender_type, sender_name, content, attachments, created_at, read_at")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("[inquiry-messages] list failed", error);
        return errorResponse("Failed to fetch messages", 500);
      }

      // Include the initial inquiry message so the thread reads complete,
      // same as vendors_portal's GET.
      const initialMessage = inquiry.message
        ? {
            id: "initial",
            sender_type: "client",
            sender_name: inquiry.name ?? "Client",
            content: inquiry.message,
            attachments: null,
            created_at: inquiry.created_at,
            read_at: null,
          }
        : null;

      return new Response(
        JSON.stringify({ messages: [...(initialMessage ? [initialMessage] : []), ...(messages ?? [])] }),
        { headers: JSON_HEADERS },
      );
    }

    const content = (body.content ?? "").trim();
    if (!content) return errorResponse("Message content is required", 400);

    let senderType: "client" | "vendor" = "client";
    let senderName = me.name ?? "Client";
    if (!isCouple) {
      senderType = "vendor";
      const { data: vendor } = await service
        .from("vendors")
        .select("business_name")
        .eq("id", inquiry.vendor_id)
        .maybeSingle();
      senderName = vendor?.business_name ?? "Vendor";
    }

    const { data: message, error: insertError } = await service
      .from("inquiry_messages")
      .insert({ inquiry_id: inquiryId, sender_type: senderType, sender_name: senderName, content })
      .select("id, sender_type, sender_name, content, attachments, created_at, read_at")
      .single();
    if (insertError || !message) {
      console.error("[inquiry-messages] send failed", insertError);
      return errorResponse("Failed to send message", 500);
    }

    // A vendor reply counts as responding to the lead, same as the portal.
    if (senderType === "vendor" && inquiry.status === "pending") {
      const now = new Date().toISOString();
      const { error: statusError } = await service
        .from("inquiries")
        .update({ status: "responded", responded_at: now, updated_at: now })
        .eq("id", inquiryId)
        .eq("status", "pending");
      if (statusError) console.error("[inquiry-messages] status update failed", statusError.code);
    }

    // Fire-and-forget push to the other party via send-push's
    // service-role-only inquiry_message event.
    fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      body: JSON.stringify({ event: "inquiry_message", messageId: message.id }),
    }).catch((err) => console.error("[inquiry-messages] push dispatch threw", err));

    return new Response(JSON.stringify({ message }), { status: 201, headers: JSON_HEADERS });
  } catch (err) {
    console.error("[inquiry-messages] unhandled", err);
    return errorResponse("Internal server error", 500);
  }
});
