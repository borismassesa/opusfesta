import { NextRequest, NextResponse } from "next/server";
import { persistBookingLead } from "@/lib/booking/lead-service";
import { BookingLeadApiResponse, BookingLeadPayload } from "@/lib/booking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateLimitBucket = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const previous = rateLimitBucket.get(ipAddress);

  if (!previous || now > previous.resetAt) {
    rateLimitBucket.set(ipAddress, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (previous.count >= MAX_REQUESTS) {
    return true;
  }

  previous.count += 1;
  rateLimitBucket.set(ipAddress, previous);
  return false;
}

function validatePayload(payload: Partial<BookingLeadPayload>): Partial<Record<keyof BookingLeadPayload, string>> {
  const errors: Partial<Record<keyof BookingLeadPayload, string>> = {};

  if (!payload.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!payload.email?.trim()) errors.email = "Email is required.";
  if (!payload.phone?.trim()) errors.phone = "Phone or WhatsApp is required.";
  if (!payload.eventType?.trim()) errors.eventType = "Event type is required.";
  if (!payload.eventDate?.trim()) errors.eventDate = "Event date is required.";
  if (!payload.location?.trim()) errors.location = "Location is required.";
  if (!payload.estimatedBudget?.trim()) errors.estimatedBudget = "Estimated budget is required.";
  if (!payload.message?.trim() || payload.message.trim().length < 20) {
    errors.message = "Message must have at least 20 characters.";
  }
  if (!payload.source?.trim()) errors.source = "Source is required.";

  return errors;
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);

  if (isRateLimited(ipAddress)) {
    return NextResponse.json<BookingLeadApiResponse>(
      {
        ok: false,
        error: "Too many requests. Please wait a few minutes and try again.",
      },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as Partial<BookingLeadPayload> & { website?: string };

    // Honeypot field: silently succeed to avoid signaling bots.
    if (body.website?.trim()) {
      return NextResponse.json<BookingLeadApiResponse>({
        ok: true,
        leadId: "filtered",
        message: "Thanks, your request has been received.",
      });
    }

    const fieldErrors = validatePayload(body);
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json<BookingLeadApiResponse>(
        {
          ok: false,
          error: "Please correct the highlighted fields.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const lead = await persistBookingLead(
      body as BookingLeadPayload,
      ipAddress,
      request.headers.get("user-agent") ?? "unknown"
    );

    return NextResponse.json<BookingLeadApiResponse>({
      ok: true,
      leadId: lead.id,
      message: "Thanks, your enquiry has been received. We will get back to you shortly.",
    });
  } catch (error) {
    console.error("Studio lead submission error:", error);
    return NextResponse.json<BookingLeadApiResponse>(
      {
        ok: false,
        error: "Unable to submit right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
