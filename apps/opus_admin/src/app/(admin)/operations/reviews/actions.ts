'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type ReviewModerationResult =
  | { ok: true }
  | { ok: false; error: string; reason: 'unauth' | 'invalid' | 'not_found' | 'unknown' }

async function resolveAdminUserId(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  clerkUserId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .maybeSingle<{ id: string }>()
  if (error) {
    console.warn(
      `[admin] users lookup failed for clerk_id=${clerkUserId}: ${error.message}`,
    )
    return null
  }
  return data?.id ?? null
}

/**
 * Approve a pending review and make it publicly visible.
 *
 * Stamps `reviewed_by` + `reviewed_at` for the audit trail and revalidates
 * both the moderation queue and the public vendor profile so the rating
 * recomputes immediately.
 */
export async function publishReview(
  reviewId: string,
): Promise<ReviewModerationResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const reviewerId = await resolveAdminUserId(admin, userId)

  // Look up the vendor slug first so we can revalidate the right path —
  // also gives us a not-found check before mutating.
  const lookup = await admin
    .from('vendor_reviews')
    .select('vendor_id, status, vendor:vendors(slug)')
    .eq('id', reviewId)
    .maybeSingle<{
      vendor_id: string
      status: string
      vendor: { slug: string } | null
    }>()
  if (lookup.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] review lookup failed: ${lookup.error.code} ${lookup.error.message}`,
    }
  }
  if (!lookup.data) return { ok: false, reason: 'not_found', error: 'Review not found.' }

  const { error } = await admin
    .from('vendor_reviews')
    .update({
      status: 'published',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', reviewId)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] publish review failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/reviews')
  if (lookup.data.vendor?.slug) {
    revalidatePath(`/vendors/${lookup.data.vendor.slug}`)
  }
  return { ok: true }
}

/**
 * Reject a pending review with a reason. The review is kept on the row so
 * the audit trail stays intact, but it never becomes public.
 */
export async function rejectReview(
  reviewId: string,
  reason: string,
): Promise<ReviewModerationResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }
  if (!reason.trim()) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Rejection reason is required for the audit trail.',
    }
  }

  const admin = createSupabaseAdminClient()
  const reviewerId = await resolveAdminUserId(admin, userId)

  const { error } = await admin
    .from('vendor_reviews')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
    })
    .eq('id', reviewId)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] reject review failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/reviews')
  return { ok: true }
}
