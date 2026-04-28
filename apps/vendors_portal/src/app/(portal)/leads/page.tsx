import type { InquiryRow } from '@/lib/mock-data'
import { recentInquiries } from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import LeadsClient from './LeadsClient'

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop'

const STATUS_TO_UI: Record<string, InquiryRow['status']> = {
  pending: 'new',
  responded: 'replied',
  accepted: 'booked',
  declined: 'booked',
  closed: 'booked',
}

type InquiryRowFromDb = {
  id: string
  name: string | null
  event_date: string | null
  budget: string | null
  location: string | null
  status: string | null
}

function formatEventDate(date: string | null): string {
  if (!date) return 'Date TBC'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Date TBC'
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapRow(row: InquiryRowFromDb): InquiryRow {
  return {
    id: row.id,
    couple: row.name ?? 'Anonymous lead',
    date: formatEventDate(row.event_date),
    budget: row.budget ?? '—',
    location: row.location ?? '—',
    status: STATUS_TO_UI[row.status ?? 'pending'] ?? 'new',
    avatarUrl: PLACEHOLDER_AVATAR,
  }
}

async function loadInquiries(): Promise<{
  inquiries: InquiryRow[]
  source: 'live' | 'mock'
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { inquiries: recentInquiries, source: 'mock' }
  }

  const supabase = await createClerkSupabaseServerClient()

  const { data, error } = await supabase
    .from('inquiries')
    .select('id, name, event_date, budget, location, status')
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<InquiryRowFromDb[]>()

  if (error) {
    console.error('[leads] inquiries query failed:', error)
    return { inquiries: recentInquiries, source: 'mock' }
  }

  if (!data || data.length === 0) {
    return { inquiries: recentInquiries, source: 'mock' }
  }

  return { inquiries: data.map(mapRow), source: 'live' }
}

export default async function LeadsPage() {
  const { inquiries, source } = await loadInquiries()
  return <LeadsClient inquiries={inquiries} source={source} />
}
