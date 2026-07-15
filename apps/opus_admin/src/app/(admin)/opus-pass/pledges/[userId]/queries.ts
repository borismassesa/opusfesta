import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'

export interface PledgeCouple {
  userId: string
  coupleName: string
  partner1Name: string | null
  partner2Name: string | null
  weddingDate: string | null
  city: string | null
  pledgeGoalAmount: number | null
  pledgePaymentMethods: { label: string; value: string; name?: string }[]
}

export interface PledgeEvent {
  id: string
  name: string | null
  startsAt: string | null
}

export interface PledgeGuest {
  id: string
  fullName: string
  phone: string | null
  whatsappPhone: string | null
  email: string | null
  groupTag: string | null
  pledgeInviteSentAt: string | null
  pledgeInviteCount: number
}

export interface PledgeRow {
  id: string
  guestContactId: string
  guestName: string
  guestPhone: string | null
  guestWhatsappPhone: string | null
  guestEmail: string | null
  eventId: string | null
  pledgedAmount: number
  amountReceived: number
  currency: string
  promisedDate: string | null
  status: string
  paymentMethod: string | null
  willAttend: string | null
  cardStatus: string
  reminderCadence: string
  nextReminderAt: string | null
  lastRemindedAt: string | null
  reminderCount: number
  notes: string | null
}

export async function getCoupleForConsole(userId: string): Promise<PledgeCouple | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('couple_profiles')
    .select(
      'user_id, partner1_name, partner2_name, wedding_date, city, pledge_goal_amount, pledge_payment_methods',
    )
    .eq('user_id', userId)
    .maybeSingle<{
      user_id: string
      partner1_name: string | null
      partner2_name: string | null
      wedding_date: string | null
      city: string | null
      pledge_goal_amount: number | string | null
      pledge_payment_methods: { label: string; value: string; name?: string }[] | null
    }>()
  if (error) throw new Error(error.message)
  if (!data) return null

  const coupleName = [data.partner1_name, data.partner2_name].filter(Boolean).join(' & ') || 'The Couple'
  return {
    userId: data.user_id,
    coupleName,
    partner1Name: data.partner1_name,
    partner2Name: data.partner2_name,
    weddingDate: data.wedding_date,
    city: data.city,
    pledgeGoalAmount: data.pledge_goal_amount != null ? Number(data.pledge_goal_amount) : null,
    pledgePaymentMethods: data.pledge_payment_methods ?? [],
  }
}

export async function getEventsForCouple(userId: string): Promise<PledgeEvent[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('wedding_events')
    .select('id, name, starts_at')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as { id: string; name: string | null; starts_at: string | null }[]).map((e) => ({
    id: e.id,
    name: e.name,
    startsAt: e.starts_at,
  }))
}

export async function getGuestsForCouple(userId: string): Promise<PledgeGuest[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('guest_contacts')
    .select('id, full_name, phone, whatsapp_phone, email, group_tag, pledge_invite_sent_at, pledge_invite_count')
    .eq('user_id', userId)
    .order('full_name', { ascending: true })
  if (error) throw new Error(error.message)
  return ((data ?? []) as {
    id: string
    full_name: string
    phone: string | null
    whatsapp_phone: string | null
    email: string | null
    group_tag: string | null
    pledge_invite_sent_at: string | null
    pledge_invite_count: number
  }[]).map((g) => ({
    id: g.id,
    fullName: g.full_name,
    phone: g.phone,
    whatsappPhone: g.whatsapp_phone,
    email: g.email,
    groupTag: g.group_tag,
    pledgeInviteSentAt: g.pledge_invite_sent_at,
    pledgeInviteCount: g.pledge_invite_count,
  }))
}

export async function getPledgesForCouple(userId: string, eventId?: string): Promise<PledgeRow[]> {
  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('event_pledges')
    .select(
      `id, guest_contact_id, event_id, pledged_amount, amount_received, currency, promised_date, status,
       payment_method, will_attend, card_status, reminder_cadence, next_reminder_at, last_reminded_at,
       reminder_count, notes,
       guest_contacts:guest_contact_id ( full_name, phone, whatsapp_phone, email )`,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (eventId) query = query.eq('event_id', eventId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  type Row = {
    id: string
    guest_contact_id: string
    event_id: string | null
    pledged_amount: number
    amount_received: number
    currency: string
    promised_date: string | null
    status: string
    payment_method: string | null
    will_attend: string | null
    card_status: string
    reminder_cadence: string
    next_reminder_at: string | null
    last_reminded_at: string | null
    reminder_count: number
    notes: string | null
    guest_contacts: { full_name: string; phone: string | null; whatsapp_phone: string | null; email: string | null } | null
  }

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    guestContactId: r.guest_contact_id,
    guestName: r.guest_contacts?.full_name ?? 'Unknown contributor',
    guestPhone: r.guest_contacts?.phone ?? null,
    guestWhatsappPhone: r.guest_contacts?.whatsapp_phone ?? null,
    guestEmail: r.guest_contacts?.email ?? null,
    eventId: r.event_id,
    pledgedAmount: Number(r.pledged_amount) || 0,
    amountReceived: Number(r.amount_received) || 0,
    currency: r.currency,
    promisedDate: r.promised_date,
    status: r.status,
    paymentMethod: r.payment_method,
    willAttend: r.will_attend,
    cardStatus: r.card_status,
    reminderCadence: r.reminder_cadence,
    nextReminderAt: r.next_reminder_at,
    lastRemindedAt: r.last_reminded_at,
    reminderCount: r.reminder_count,
    notes: r.notes,
  }))
}
