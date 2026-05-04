import type { Review } from '@/lib/mock-data'
import { sampleReviews, reviewInviteCandidates } from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import ReviewsClient, { type ReviewsSource } from './ReviewsClient'

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop'

type ReviewRowFromDb = {
  id: string
  user_id: string
  rating: number
  title: string | null
  content: string
  images: string[] | null
  event_type: string | null
  event_date: string | null
  vendor_response: string | null
  vendor_responded_at: string | null
  created_at: string
  users: { full_name: string | null; avatar_url: string | null } | null
}

function mapRow(row: ReviewRowFromDb): Review {
  const user = row.users
  // Drift-gap signal: per migration 024 the users table cross-thread visibility
  // policy still uses legacy vendors.user_id, so manager/staff vendor team
  // members get user=null even when they have row-level access to the review.
  // Logging here lets ops spot the policy gap before it confuses a user.
  if (row.user_id && !user) {
    console.warn(
      '[reviews] users join nulled out — likely RLS gap for manager/staff role on users table (review.id=' +
        row.id +
        ')',
    )
  }
  return {
    id: row.id,
    couple: user?.full_name ?? 'OpusFesta couple',
    avatarUrl: user?.avatar_url ?? PLACEHOLDER_AVATAR,
    rating: row.rating,
    packageName: row.event_type ?? 'Wedding',
    eventDate: row.event_date ?? row.created_at.slice(0, 10),
    reviewedAt: row.created_at,
    body: row.content,
    photos: row.images ?? undefined,
    reply:
      row.vendor_response && row.vendor_responded_at
        ? { body: row.vendor_response, repliedAt: row.vendor_responded_at }
        : undefined,
  }
}

async function loadReviews(): Promise<{
  initialReviews: Review[]
  source: ReviewsSource
}> {
  const state = await getCurrentVendor()
  if (state.kind === 'no-env') {
    return { initialReviews: sampleReviews, source: { kind: 'no-env' } }
  }
  if (state.kind === 'no-application') {
    return { initialReviews: [], source: { kind: 'no-application' } }
  }
  if (state.kind === 'pending-approval') {
    return { initialReviews: [], source: { kind: 'pending-approval' } }
  }
  if (state.kind === 'suspended') {
    return { initialReviews: [], source: { kind: 'suspended' } }
  }

  const supabase = await createClerkSupabaseServerClient()
  // moderation_status filter is required: per migration 052 the reviews
  // SELECT policy lets vendor owners (vendors.user_id = caller) see ALL
  // statuses including 'pending'/'rejected', while is_vendor_member
  // manager/staff see only 'approved'. Filter explicitly so owners see the
  // same set their team does.
  const reviews = await supabase
    .from('reviews')
    .select(
      `id, user_id, rating, title, content, images, event_type, event_date,
       vendor_response, vendor_responded_at, created_at,
       users ( full_name, avatar_url )`,
    )
    .eq('vendor_id', state.vendor.id)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100)
    .returns<ReviewRowFromDb[]>()

  if (reviews.error) {
    throw new Error(
      `[reviews] reviews query failed: ${reviews.error.code} ${reviews.error.message}`,
    )
  }

  return {
    initialReviews: (reviews.data ?? []).map(mapRow),
    source: { kind: 'live' },
  }
}

export default async function ReviewsPage() {
  const { initialReviews, source } = await loadReviews()
  // Phase 1: review-invite candidates require the bookings table (Phase 3).
  // In live mode the InviteCard renders a "coming soon" panel so vendors
  // aren't told "all caught up" when the feature simply isn't built yet.
  // In dev (no-env) we surface the mock candidates so the flow is reviewable.
  const invitesAvailable = source.kind === 'no-env'
  const inviteCandidates = invitesAvailable ? reviewInviteCandidates : []

  return (
    <ReviewsClient
      initialReviews={initialReviews}
      inviteCandidates={inviteCandidates}
      invitesAvailable={invitesAvailable}
      source={source}
    />
  )
}
