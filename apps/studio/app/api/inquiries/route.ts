import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/resend';

// Public endpoint: anyone can POST a contact form submission.
// No auth — validation is the only gate, and the anon RLS policy
// only grants INSERT, so even if this route is misused, the worst
// case is a spammy row in studio_inquiries.

const InquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Invalid email').max(320),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  projectType: z.string().trim().max(100).optional().or(z.literal('')),
  budgetRange: z.string().trim().max(100).optional().or(z.literal('')),
  timeline: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
});

function nullIfBlank(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = InquirySchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: firstIssue?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const sb = getStudioSupabaseAdmin();

  const { data, error } = await sb
    .from('studio_inquiries')
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: nullIfBlank(input.phone),
      project_type: nullIfBlank(input.projectType),
      budget_range: nullIfBlank(input.budgetRange),
      timeline: nullIfBlank(input.timeline),
      message: nullIfBlank(input.message),
    })
    .select('id, created_at')
    .single();

  if (error || !data) {
    console.error('[inquiries] insert failed', error);
    return NextResponse.json(
      { success: false, error: 'Unable to save your message. Please try again.' },
      { status: 500 }
    );
  }

  // Fire-and-forget notification to the studio inbox.
  // We intentionally do not block the response on email delivery.
  const notifyAddress = process.env.STUDIO_INQUIRIES_NOTIFY_EMAIL ?? 'studio@opusfesta.com';
  void sendEmail({
    to: notifyAddress,
    replyTo: input.email,
    subject: `New enquiry — ${input.name}${input.projectType ? ` (${input.projectType})` : ''}`,
    html: renderNotificationHtml(input),
  }).catch((err) => {
    console.error('[inquiries] notification email failed', err);
  });

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}

function renderNotificationHtml(input: z.infer<typeof InquirySchema>): string {
  const rows: Array<[string, string]> = [
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone || '—'],
    ['Project Type', input.projectType || '—'],
    ['Budget', input.budgetRange || '—'],
    ['Timeline', input.timeline || '—'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px;border-bottom:1px solid #eee;color:#666;font:12px/1.4 system-ui">${label}</td><td style="padding:8px 16px;border-bottom:1px solid #eee;color:#111;font:13px/1.4 system-ui">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  const messageHtml = input.message
    ? `<div style="margin-top:24px"><div style="color:#666;font:12px/1.4 system-ui;margin-bottom:8px">Message</div><div style="white-space:pre-wrap;padding:16px;background:#f7f7f5;border-left:3px solid #111;color:#111;font:14px/1.6 system-ui">${escapeHtml(input.message)}</div></div>`
    : '';

  return `<div style="max-width:560px;margin:0 auto;padding:32px;font:14px/1.5 system-ui,sans-serif;color:#111">
  <h1 style="margin:0 0 24px;font:bold 20px/1.2 system-ui">New studio enquiry</h1>
  <table style="width:100%;border-collapse:collapse;border:1px solid #eee">${rowsHtml}</table>
  ${messageHtml}
  <p style="margin-top:32px;color:#999;font:12px/1.4 system-ui">Reply directly to this email to respond to ${escapeHtml(input.name)}.</p>
</div>`;
}
