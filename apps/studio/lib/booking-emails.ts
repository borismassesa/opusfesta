// Transactional emails sent after a public booking is created.
// Two emails fire per new booking:
//   • Client confirmation — reassures the client their request was received
//   • Admin notification — tells the studio a new booking needs review
//
// Both are soft-failures: if Resend is down or unconfigured, the booking
// is still saved and returned to the client. We just log and move on.

import { sendEmail } from './resend';
import { formatTzs } from './bookings';

const TIMEZONE_LABEL = 'Africa/Dar es Salaam (EAT)';

interface BookingEmailInput {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  service_name: string | null;
  booking_date: string;  // YYYY-MM-DD
  start_time: string;    // HH:MM[:SS]
  duration_minutes: number;
  quoted_amount_tzs: number | null;
  notes: string | null;
}

function formatDateHuman(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function hhmm(t: string): string { return t.slice(0, 5); }

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Both emails share the same visual shell for consistency. Inline styles
// because email clients ignore external/<head> CSS.
function emailShell(bodyHtml: string, heading: string): string {
  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#171717;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="padding:28px 32px 16px 32px;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:#a3a3a3;">OpusStudio</p>
          <h1 style="margin:0;font-size:20px;font-weight:600;letter-spacing:-0.01em;color:#171717;">${escape(heading)}</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 32px 24px 32px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:11px;color:#a3a3a3;">OpusStudio · Dar es Salaam, Tanzania</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(input: BookingEmailInput): string {
  const rows: [string, string][] = [
    ['When', `${escape(formatDateHuman(input.booking_date))} · ${escape(hhmm(input.start_time))} (${input.duration_minutes} min)`],
    ['Timezone', TIMEZONE_LABEL],
    ['Name', escape(input.client_name)],
    ['Email', escape(input.client_email)],
  ];
  if (input.client_phone) rows.push(['Phone', escape(input.client_phone)]);
  if (input.service_name) rows.push(['Service', escape(input.service_name)]);
  if (input.quoted_amount_tzs != null) rows.push(['Quoted', escape(formatTzs(input.quoted_amount_tzs))]);
  if (input.notes) rows.push(['Notes', escape(input.notes).replace(/\n/g, '<br/>')]);

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  ${rows.map(([k, v]) => `
    <tr>
      <td style="padding:8px 0;font-size:12px;color:#737373;width:30%;vertical-align:top;">${escape(k)}</td>
      <td style="padding:8px 0;font-size:13px;color:#171717;vertical-align:top;">${v}</td>
    </tr>
  `).join('')}
</table>`;
}

// ─── Client confirmation ─────────────────────────────────────────────────
export async function sendClientBookingConfirmation(input: BookingEmailInput): Promise<void> {
  const body = `
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.5;color:#404040;">
      Thanks${input.client_name ? `, ${escape(input.client_name.split(' ')[0])}` : ''}. We received your booking request and will confirm within a day. Here are the details we have on file:
    </p>
    ${detailsTable(input)}
    <p style="margin:20px 0 0 0;font-size:13px;line-height:1.55;color:#737373;">
      Booking reference: <span style="font-family:monospace;color:#171717;">${escape(input.id.slice(0, 8))}</span>
    </p>
    <p style="margin:12px 0 0 0;font-size:13px;line-height:1.55;color:#737373;">
      Need to change something? Reply to this email — we&rsquo;re listening.
    </p>
  `;
  const html = emailShell(body, 'Booking request received');

  const res = await sendEmail({
    to: input.client_email,
    subject: `We received your booking for ${formatDateHuman(input.booking_date)}`,
    html,
  });
  if (!res.success) {
    console.error('[booking-emails] client confirmation failed', res.error);
  }
}

// ─── Admin notification ──────────────────────────────────────────────────
export async function sendAdminBookingNotification(
  input: BookingEmailInput,
  adminEmail: string,
): Promise<void> {
  const body = `
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.5;color:#404040;">
      A new booking request came in via the website. Review it in the admin and respond within 24 hours for best conversion.
    </p>
    ${detailsTable(input)}
    <table cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td>
      <a href="${escape(adminLinkFor(input.id))}" style="display:inline-block;padding:10px 20px;background:#171717;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;border-radius:999px;">Open in admin</a>
    </td></tr></table>
  `;
  const html = emailShell(body, `New booking · ${input.client_name}`);

  const res = await sendEmail({
    to: adminEmail,
    subject: `New booking · ${input.client_name} · ${formatDateHuman(input.booking_date)}`,
    html,
    replyTo: input.client_email,
  });
  if (!res.success) {
    console.error('[booking-emails] admin notification failed', res.error);
  }
}

function adminLinkFor(bookingId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://studio.opusfesta.com';
  return `${base.replace(/\/$/, '')}/studio-admin/bookings?highlight=${bookingId}`;
}
