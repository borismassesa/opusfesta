'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type SubmitReviewInput = {
  vendorSlug: string
  authorName: string
  authorEmail: string
  rating: number
  body: string
  weddingDate?: string | null
}

export type SubmitReviewResult =
  | { ok: true; status: 'pending' }
  | { ok: false; error: string; reason: 'invalid' | 'not_found' | 'rate_limited' | 'unknown' }

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Public review submission. Anonymous; lands in `vendor_reviews.status =
 * 'pending'` and waits for admin moderation. Validates input shape and
 * vendor existence; rate limits per-IP to dampen drive-by spam.
 *
 * Trust boundary: this action runs server-side and uses the service-role
 * client to insert the row. The DB CHECK constraints are the second line
 * of defence in case validation here ever drifts.
 */
export async function submitVendorReview(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const name = (input.authorName ?? '').trim()
  const email = (input.authorEmail ?? '').trim().toLowerCase()
  const body = (input.body ?? '').trim()
  const rating = Number(input.rating)

  if (!name || name.length < 2 || name.length > 120) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Please share your name (2–120 characters).',
    }
  }
  if (!email || !EMAIL_RX.test(email)) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'A valid email address is required so we can verify the review.',
    }
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Pick a rating between 1 and 5 stars.',
    }
  }
  if (!body || body.length < 10 || body.length > 4000) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Please write at least 10 characters about your experience.',
    }
  }

  const weddingDate = (() => {
    if (!input.weddingDate) return null
    const d = new Date(input.weddingDate)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  })()

  const supabase = createSupabaseServerClient()

  // Resolve the vendor by slug; only accept reviews against currently active
  // vendors. Reviewing a suspended/draft vendor would let admins inadvertently
  // publish stale feedback against a dormant account.
  const { data: vendor, error: vendorErr } = await supabase
    .from('vendors')
    .select('id, onboarding_status')
    .eq('slug', input.vendorSlug)
    .maybeSingle<{ id: string; onboarding_status: string }>()

  if (vendorErr) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[review] vendor lookup failed: ${vendorErr.code} ${vendorErr.message}`,
    }
  }
  if (!vendor || vendor.onboarding_status !== 'active') {
    return { ok: false, reason: 'not_found', error: 'Vendor not found.' }
  }

  // Per-IP rate limit — at most 3 review attempts per 30 minutes from the
  // same IP regardless of vendor. This is intentionally generous; it just
  // breaks the trivial "submit 100 reviews" fast-loop case until we have a
  // proper CAPTCHA / email-verification step.
  const reqHeaders = await headers()
  const submittedIp =
    reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    reqHeaders.get('x-real-ip') ||
    null
  const submittedUserAgent = reqHeaders.get('user-agent') ?? null

  if (submittedIp) {
    const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { count, error: rateErr } = await supabase
      .from('vendor_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_ip', submittedIp)
      .gte('created_at', halfHourAgo)
    if (rateErr) {
      console.warn(`[review] rate-limit count failed: ${rateErr.message}`)
    } else if ((count ?? 0) >= 3) {
      return {
        ok: false,
        reason: 'rate_limited',
        error: 'You have submitted several reviews recently. Please wait before sending another.',
      }
    }
  }

  const { error: insertErr } = await supabase.from('vendor_reviews').insert({
    vendor_id: vendor.id,
    author_name: name,
    author_email: email,
    rating: Math.round(rating * 10) / 10,
    body,
    wedding_date: weddingDate,
    submitted_ip: submittedIp,
    submitted_user_agent: submittedUserAgent,
  })

  if (insertErr) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[review] insert failed: ${insertErr.code} ${insertErr.message}`,
    }
  }

  revalidatePath(`/vendors/${input.vendorSlug}`)
  return { ok: true, status: 'pending' }
}
