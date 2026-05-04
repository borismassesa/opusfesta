import { createSupabaseAdminClient } from '@/lib/supabase'
import ReviewsModerationClient, { type ReviewRow } from './ReviewsModerationClient'

export const dynamic = 'force-dynamic'

type DbReviewRow = {
  id: string
  vendor_id: string
  author_name: string
  author_email: string
  rating: number
  body: string
  wedding_date: string | null
  status: 'pending' | 'published' | 'rejected'
  rejection_reason: string | null
  submitted_ip: string | null
  submitted_user_agent: string | null
  reviewed_at: string | null
  created_at: string
  vendor: { business_name: string; slug: string; vendor_code: string | null } | null
}

const ALLOWED_FILTERS = new Set(['pending', 'published', 'rejected', 'all'])

function parseFilter(raw: string | string[] | undefined): 'pending' | 'published' | 'rejected' | 'all' {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (v && ALLOWED_FILTERS.has(v)) return v as 'pending' | 'published' | 'rejected' | 'all'
  // Default to the moderation queue — that's where admin attention is needed.
  return 'pending'
}

export default async function ReviewsModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const filter = parseFilter(params.status)

  const admin = createSupabaseAdminClient()

  let query = admin
    .from('vendor_reviews')
    .select(
      `id, vendor_id, author_name, author_email, rating, body, wedding_date,
       status, rejection_reason, submitted_ip, submitted_user_agent, reviewed_at,
       created_at, vendor:vendors(business_name, slug, vendor_code)`,
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data, error } = await query.returns<DbReviewRow[]>()
  if (error) {
    throw new Error(
      `[admin] reviews query failed: ${error.code} ${error.message}`,
    )
  }

  // Status counts for the tab pills — single round-trip over the table.
  const { data: rollup } = await admin
    .from('vendor_reviews')
    .select('status')
    .returns<Array<{ status: 'pending' | 'published' | 'rejected' }>>()
  const counts = {
    pending: 0,
    published: 0,
    rejected: 0,
    all: rollup?.length ?? 0,
  }
  for (const r of rollup ?? []) {
    if (r.status in counts) counts[r.status] += 1
  }

  const rows: ReviewRow[] = (data ?? []).map((r) => ({
    id: r.id,
    vendorId: r.vendor_id,
    vendorName: r.vendor?.business_name ?? '—',
    vendorSlug: r.vendor?.slug ?? '',
    vendorCode: r.vendor?.vendor_code ?? null,
    authorName: r.author_name,
    authorEmail: r.author_email,
    rating: r.rating,
    body: r.body,
    weddingDate: r.wedding_date,
    status: r.status,
    rejectionReason: r.rejection_reason,
    submittedIp: r.submitted_ip,
    submittedUserAgent: r.submitted_user_agent,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
  }))

  return <ReviewsModerationClient rows={rows} filter={filter} counts={counts} />
}
