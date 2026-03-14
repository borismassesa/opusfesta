// ============================================================================
// Google Calendar Sync — Create/Update/Delete events for confirmed bookings
// ============================================================================
//
// Requires env vars:
//   GOOGLE_CALENDAR_ID       — The calendar to manage events on
//   GOOGLE_SERVICE_ACCOUNT_KEY — Base64-encoded JSON service account key
//
// The service account must have write access to the calendar.
// ============================================================================

import { getStudioSupabaseAdmin } from './supabase-admin';

interface CalendarBooking {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  event_type: string;
  service?: string | null;
  location?: string | null;
  guest_count?: number | null;
  event_date: string;
  event_time_slot?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function getServiceAccountKey(): { client_email: string; private_key: string } {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not set');
  const decoded = Buffer.from(raw, 'base64').toString('utf-8');
  return JSON.parse(decoded);
}

function base64url(data: string): string {
  return Buffer.from(data).toString('base64url');
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const key = getServiceAccountKey();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(key.private_key, 'base64url');

  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Google access token: ${text}`);
  }

  const data: GoogleTokenResponse = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

function getCalendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error('GOOGLE_CALENDAR_ID is not set');
  return id;
}

function parseTimeSlot(slot: string): { startHour: number; endHour: number } {
  // Expected formats: "09:00-12:00", "Morning", "Afternoon", "Evening", "Full Day"
  const timeMatch = slot.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return { startHour: parseInt(timeMatch[1]), endHour: parseInt(timeMatch[3]) };
  }
  const lower = slot.toLowerCase();
  if (lower.includes('morning')) return { startHour: 9, endHour: 12 };
  if (lower.includes('afternoon')) return { startHour: 13, endHour: 17 };
  if (lower.includes('evening')) return { startHour: 18, endHour: 22 };
  return { startHour: 9, endHour: 17 }; // Full day default
}

function buildEventBody(booking: CalendarBooking) {
  const { startHour, endHour } = booking.event_time_slot
    ? parseTimeSlot(booking.event_time_slot)
    : { startHour: 9, endHour: 17 };

  const startDate = new Date(`${booking.event_date}T${String(startHour).padStart(2, '0')}:00:00+03:00`);
  const endDate = new Date(`${booking.event_date}T${String(endHour).padStart(2, '0')}:00:00+03:00`);

  const description = [
    `Client: ${booking.name}`,
    `Email: ${booking.email}`,
    booking.phone ? `Phone: ${booking.phone}` : null,
    `Event Type: ${booking.event_type}`,
    booking.service ? `Service: ${booking.service}` : null,
    booking.guest_count ? `Guests: ${booking.guest_count}` : null,
  ].filter(Boolean).join('\n');

  return {
    summary: `${booking.event_type} — ${booking.name}`,
    description,
    location: booking.location || undefined,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'Africa/Dar_es_Salaam',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Africa/Dar_es_Salaam',
    },
    attendees: [{ email: booking.email, displayName: booking.name }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 1440 }, // 24 hours
        { method: 'popup', minutes: 60 },
      ],
    },
  };
}

export async function createCalendarEvent(booking: CalendarBooking): Promise<string> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) {
    console.warn('Google Calendar not configured, skipping event creation');
    return '';
  }

  const token = await getAccessToken();
  const calendarId = getCalendarId();
  const body = buildEventBody(booking);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create calendar event: ${text}`);
  }

  const data = await res.json();
  const eventId = data.id as string;

  // Store event ID in booking metadata
  const db = getStudioSupabaseAdmin();
  const { data: existing } = await db
    .from('studio_bookings')
    .select('metadata')
    .eq('id', booking.id)
    .single();

  const metadata = { ...(existing?.metadata as Record<string, unknown> || {}), google_calendar_event_id: eventId };
  await db.from('studio_bookings').update({ metadata }).eq('id', booking.id);

  return eventId;
}

export async function updateCalendarEvent(booking: CalendarBooking, eventId: string): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) return;

  const token = await getAccessToken();
  const calendarId = getCalendarId();
  const body = buildEventBody(booking);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update calendar event: ${text}`);
  }
}

export async function deleteCalendarEvent(bookingId: string, eventId: string): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_CALENDAR_ID) return;

  const token = await getAccessToken();
  const calendarId = getCalendarId();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Failed to delete calendar event: ${text}`);
  }

  // Clear event ID from booking metadata
  const db = getStudioSupabaseAdmin();
  const { data: existing } = await db
    .from('studio_bookings')
    .select('metadata')
    .eq('id', bookingId)
    .single();

  if (existing) {
    const metadata = { ...(existing.metadata as Record<string, unknown> || {}) };
    delete metadata.google_calendar_event_id;
    await db.from('studio_bookings').update({ metadata }).eq('id', bookingId);
  }
}
