import { NextResponse } from 'next/server'
import { getDashboardUser } from '@/lib/dashboard/auth'
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/dashboard/notifications'

export const dynamic = 'force-dynamic'

/** GET /api/notifications → { items, unread } for the signed-in couple. */
export async function GET() {
  const user = await getDashboardUser()
  if (!user) return NextResponse.json({ items: [], unread: 0 })
  const [items, unread] = await Promise.all([
    listNotifications(user.id),
    getUnreadCount(user.id),
  ])
  return NextResponse.json({ items, unread })
}

/** POST /api/notifications → mark read. Body: { id } for one, { all: true } for all. */
export async function POST(req: Request) {
  const user = await getDashboardUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean }
  if (body.all) {
    await markAllNotificationsRead(user.id)
  } else if (body.id) {
    await markNotificationRead(user.id, body.id)
  }
  return NextResponse.json({ ok: true })
}
