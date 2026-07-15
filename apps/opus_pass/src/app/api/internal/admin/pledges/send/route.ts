import { NextResponse, type NextRequest } from 'next/server'
import { sendPledgeRequestForCouple, sendPledgeReminderForCouple } from '@/lib/dashboard/admin-pledge-send'

// Server-to-server only — called by opus_admin's Pledge Concierge so staff
// can send pledge requests/reminders on a couple's behalf without opus_admin
// needing its own WhatsApp/SMS provider integration. Gated by the same
// shared secret used for the revalidate/invoice server-to-server routes;
// there is no open/customer-facing mode here.
export const runtime = 'nodejs'

interface SendBody {
  action: 'pledge_request' | 'pledge_reminder'
  channel: 'whatsapp' | 'sms'
  userId: string
  eventId?: string
  guestIds?: string[]
  pledgeId?: string
  message?: string
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.OPUS_PASS_REVALIDATE_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: SendBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!body.userId || (body.channel !== 'whatsapp' && body.channel !== 'sms')) {
    return NextResponse.json({ error: 'missing_or_invalid_fields' }, { status: 400 })
  }

  try {
    if (body.action === 'pledge_request') {
      if (!body.guestIds?.length) {
        return NextResponse.json({ error: 'missing_guest_ids' }, { status: 400 })
      }
      const summary = await sendPledgeRequestForCouple(body.userId, body.channel, body.guestIds, body.eventId)
      return NextResponse.json({ ok: true, ...summary })
    }

    if (body.action === 'pledge_reminder') {
      if (!body.pledgeId || !body.message) {
        return NextResponse.json({ error: 'missing_pledge_id_or_message' }, { status: 400 })
      }
      const result = await sendPledgeReminderForCouple(body.userId, body.pledgeId, body.channel, body.message)
      return NextResponse.json({ ok: result.ok, sent: result.ok ? 1 : 0, failed: result.ok ? 0 : 1, skipped: 0, dryRun: result.dryRun, error: result.error })
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
  } catch (err) {
    console.error('[api/internal/admin/pledges/send] failed', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'send_failed' }, { status: 500 })
  }
}
