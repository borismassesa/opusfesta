import type { InquiryRow } from '@/lib/mock-data'
import { recentInquiries } from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import LeadsClient, { type LeadsSource } from './LeadsClient'

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop'

type DbInquiryStatus =
  | 'pending'
  | 'responded'
  | 'accepted'
  | 'declined'
  | 'closed'

const STATUS_TO_UI: Record<DbInquiryStatus, InquiryRow['status']> = {
  pending: 'new',
  responded: 'replied',
  accepted: 'booked',
  declined: 'declined',
  closed: 'closed',
}

type InquiryRowFromDb = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  event_date: string | null
  budget: string | null
  location: string | null
  message: string | null
  guest_count: number | null
  status: DbInquiryStatus | null
}

function formatEventDate(date: string | null): string {
  if (!date) return 'Date TBC'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    console.warn('[leads] invalid event_date in DB:', date)
    return 'Date TBC'
  }
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapStatus(status: DbInquiryStatus | null): InquiryRow['status'] {
  if (!status) return 'new'
  const mapped = STATUS_TO_UI[status]
  if (!mapped) {
    console.warn('[leads] unmapped inquiry_status:', status)
    return 'new'
  }
  return mapped
}

function mapRow(row: InquiryRowFromDb): InquiryRow {
  return {
    id: row.id,
    couple: row.name ?? 'Anonymous lead',
    date: formatEventDate(row.event_date),
    budget: row.budget ?? '—',
    location: row.location ?? '—',
    status: mapStatus(row.status),
    avatarUrl: PLACEHOLDER_AVATAR,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    guestCount: row.guest_count ?? undefined,
  }
}

async function loadInquiries(): Promise<{
  inquiries: InquiryRow[]
  source: LeadsSource
  vendorName: string
}> {
  const state = await getCurrentVendor()
  if (state.kind === 'no-env') {
    return { inquiries: recentInquiries, source: { kind: 'no-env' }, vendorName: 'Your Business' }
  }
  if (state.kind === 'no-application') {
    return { inquiries: [], source: { kind: 'no-application' }, vendorName: '' }
  }
  if (state.kind === 'pending-approval') {
    return { inquiries: [], source: { kind: 'pending-approval' }, vendorName: state.vendorName }
  }
  if (state.kind === 'suspended') {
    return { inquiries: [], source: { kind: 'suspended' }, vendorName: state.vendorName }
  }

  const supabase = await createClerkSupabaseServerClient()
  const inquiries = await supabase
    .from('inquiries')
    .select('id, name, email, phone, event_date, budget, location, message, guest_count, status')
    .eq('vendor_id', state.vendor.id)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<InquiryRowFromDb[]>()

  if (inquiries.error) {
    throw new Error(
      `[leads] inquiries query failed: ${inquiries.error.code} ${inquiries.error.message}`,
    )
  }

  return {
    inquiries: (inquiries.data ?? []).map(mapRow),
    source: { kind: 'live' },
    vendorName: state.vendor.businessName,
  }
}

export default async function LeadsPage() {
  const { inquiries, source, vendorName } = await loadInquiries()
  return <LeadsClient inquiries={inquiries} source={source} vendorName={vendorName} />
}
