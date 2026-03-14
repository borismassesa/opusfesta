import { NextRequest, NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/resend';
import { balanceReminderEmail, balanceOverdueEmail } from '@/lib/booking-emails';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();
  const now = new Date();
  const results: Record<string, number> = { reminders_sent: 0, overdue_cancelled: 0 };

  // 1. Send balance reminders 7 days before due date
  const reminderDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: upcomingDue } = await db
    .from('studio_bookings')
    .select('id, name, email, balance_due_tzs, balance_due_date')
    .eq('lifecycle_status', 'confirmed')
    .gt('balance_due_tzs', 0)
    .eq('balance_due_date', reminderDate);

  if (upcomingDue) {
    for (const booking of upcomingDue) {
      // Check if we already sent a reminder (avoid duplicates)
      const { count } = await db
        .from('studio_booking_events')
        .select('id', { count: 'exact', head: true })
        .eq('booking_id', booking.id)
        .eq('event_type', 'balance_reminder_sent');

      if (!count || count === 0) {
        const { subject, html } = balanceReminderEmail({ name: booking.name, balance_due_tzs: booking.balance_due_tzs, balance_due_date: booking.balance_due_date } as any, '');
        await sendEmail({
          to: booking.email,
          subject,
          html,
        });

        await db.from('studio_booking_events').insert({
          booking_id: booking.id,
          event_type: 'balance_reminder_sent',
          actor_type: 'system',
          metadata: { balance_due_tzs: booking.balance_due_tzs, due_date: booking.balance_due_date },
        });

        results.reminders_sent++;
      }
    }
  }

  // 2. Auto-cancel bookings 48 hours past balance_due_date with no payment
  const overdueDate = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data: overdueBookings } = await db
    .from('studio_bookings')
    .select('id, name, email, balance_due_tzs, balance_due_date')
    .eq('lifecycle_status', 'confirmed')
    .gt('balance_due_tzs', 0)
    .lte('balance_due_date', overdueDate);

  if (overdueBookings) {
    for (const booking of overdueBookings) {
      const nowIso = new Date().toISOString();

      await db
        .from('studio_bookings')
        .update({
          lifecycle_status: 'cancelled',
          cancellation_reason: 'Balance not paid by due date',
          cancelled_at: nowIso,
        })
        .eq('id', booking.id);

      await db.from('studio_booking_events').insert({
        booking_id: booking.id,
        event_type: 'status_change',
        from_status: 'confirmed',
        to_status: 'cancelled',
        actor_type: 'system',
        metadata: { reason: 'Balance overdue — auto-cancelled after 48h grace period' },
      });

      const { subject, html } = balanceOverdueEmail({ name: booking.name, balance_due_tzs: booking.balance_due_tzs } as any, '');
      await sendEmail({
        to: booking.email,
        subject,
        html,
      });

      results.overdue_cancelled++;
    }
  }

  return NextResponse.json({ ok: true, results });
}
