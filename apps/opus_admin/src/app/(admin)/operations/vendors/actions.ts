'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import {
  buildVendorStatusEmail,
  type VendorStatusEvent,
} from '@/lib/vendor-status-email'

export type ActionResult =
  | { ok: true }
  | {
      ok: false
      error: string
      reason: 'unauth' | 'not-found' | 'invalid' | 'unknown'
    }

export type SignedUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

const SIGNED_URL_TTL_SECONDS = 60 * 10 // 10 minutes — long enough to read a PDF, short enough that links expire

/**
 * Generate a short-lived signed URL for an admin to preview a verification
 * document or signature image stored in the `vendor_verification` bucket.
 *
 * The bucket's RLS lets admins read everything via the service role, but the
 * client browser can't talk to that bucket directly — so we mint signed URLs
 * server-side and return them to the review UI for `<object>` / `<img>`
 * embeds. URLs expire in 10 minutes, after which the admin can click "view"
 * again to refresh.
 *
 * Trust boundary: any signed-in admin can mint URLs for any vendor's docs.
 * Admin role-gating happens at the route layer (Clerk middleware + a future
 * `is_platform_admin()` check). The action itself trusts its caller.
 */
export async function generateSignedUrl(
  storagePath: string
): Promise<SignedUrlResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Sign in as an admin first.' }
  if (!storagePath) return { ok: false, error: 'Missing storage path.' }

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.storage
    .from('vendor_verification')
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)

  if (error || !data) {
    return {
      ok: false,
      error: `[admin] signed URL failed for ${storagePath}: ${error?.message ?? 'unknown'}`,
    }
  }
  return { ok: true, url: data.signedUrl }
}

/**
 * Resolve the Supabase users.id for the current admin Clerk session, used to
 * stamp `reviewed_by` on document review rows. Returns null if the admin
 * doesn't yet have a public.users row — review still proceeds, just without
 * a stamped reviewer for that row (audit trail logs a console warning).
 */
async function resolveAdminUserId(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  clerkUserId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .maybeSingle<{ id: string }>()
  if (error) {
    console.warn(
      `[admin] users lookup failed for clerk_id=${clerkUserId}: ${error.message}`
    )
    return null
  }
  return data?.id ?? null
}

// =============================================================================
// Document review
// =============================================================================

/**
 * Mark a vendor verification document as approved. Stamps reviewed_by /
 * reviewed_at and revalidates the review pages. Does NOT change the vendor's
 * onboarding_status — the per-vendor "Approve & activate" action handles that
 * once the admin has reviewed everything.
 */
export async function approveDocument(
  documentId: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const reviewerId = await resolveAdminUserId(admin, userId)

  const { error } = await admin
    .from('vendor_verification_documents')
    .update({
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', documentId)
    .eq('is_latest', true)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] approve document failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/vendors')
  return { ok: true }
}

/**
 * Reject a verification document with a reason. The vendor sees the reason
 * on their /verify page and re-uploads. The vendor's `onboarding_status`
 * isn't flipped here — that's handled by `requestCorrections()` which is
 * the explicit "send this back to the vendor" action.
 */
export async function rejectDocument(
  documentId: string,
  reason: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }
  if (!reason.trim()) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Rejection reason is required so the vendor knows what to fix.',
    }
  }

  const admin = createSupabaseAdminClient()
  const reviewerId = await resolveAdminUserId(admin, userId)

  const { error } = await admin
    .from('vendor_verification_documents')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
    })
    .eq('id', documentId)
    .eq('is_latest', true)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] reject document failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/vendors')
  return { ok: true }
}

// =============================================================================
// Vendor lifecycle
// =============================================================================

/**
 * Best-effort transactional email + audit log when a vendor's lifecycle status
 * flips. Looks up business name + recipient email (preferring contact_info
 * email, falling back to the linked auth user's email), renders a templated
 * Resend message, and fires it. Never throws — email failures must not roll
 * back the underlying status change. Logs `[email]` warnings on failure so
 * ops can investigate.
 */
async function notifyVendorOfStatusChange(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  vendorId: string,
  event: VendorStatusEvent,
  note?: string | null
): Promise<void> {
  if (!isEmailConfigured()) return

  const { data, error } = await admin
    .from('vendors')
    .select('business_name, contact_info, user_id, vendor_code')
    .eq('id', vendorId)
    .maybeSingle<{
      business_name: string | null
      contact_info: { email?: string | null } | null
      user_id: string | null
      vendor_code: string | null
    }>()
  if (error || !data) {
    console.warn(
      `[email] vendor lookup failed for ${event} notify (vendor=${vendorId}): ${error?.message ?? 'no row'}`
    )
    return
  }

  let recipient = data.contact_info?.email?.trim() || ''
  if (!recipient && data.user_id) {
    const userRow = await admin
      .from('users')
      .select('email')
      .eq('id', data.user_id)
      .maybeSingle<{ email: string | null }>()
    recipient = userRow.data?.email?.trim() || ''
  }
  if (!recipient) {
    console.warn(
      `[email] no recipient address for vendor=${vendorId} event=${event}; skipping notify`
    )
    return
  }

  // The custom subdomain `vendors.opusfesta.com` isn't attached in DNS yet,
  // so default to the live Vercel URL until it lands. Override via
  // NEXT_PUBLIC_VENDORS_PORTAL_URL once the subdomain is configured.
  const portalUrl =
    process.env.NEXT_PUBLIC_VENDORS_PORTAL_URL?.trim() ||
    'https://opusfesta-vendors-portal.vercel.app'
  const message = buildVendorStatusEmail({
    event,
    businessName: data.business_name?.trim() || 'OpusFesta vendor',
    recipientEmail: recipient,
    note: note ?? null,
    portalUrl,
    vendorCode: data.vendor_code,
  })

  // CC the admin team so every status decision is visible across the
  // review group, not only to the admin who clicked the button.
  const adminCc = await resolveAdminBccRecipients(admin, recipient)

  const result = await sendEmail({
    to: recipient,
    subject: message.subject,
    html: message.html,
    text: message.text,
    bcc: adminCc.length > 0 ? adminCc : undefined,
  })
  if (!result.sent) {
    console.warn(
      `[email] vendor status notify failed (vendor=${vendorId} event=${event}): ${result.reason}${result.error ? ` — ${result.error}` : ''}`
    )
  }
}

// Resolve the admin team for BCC. Mirrors apps/vendors_portal/src/lib/email/
// admin-recipients.ts so both halves of the vendor lifecycle (submit and
// status decisions) target the same audience: env override first, then active
// admin_whitelist rows with owner|admin roles. Excludes the vendor recipient
// defensively in case any whitelist email collides with their contact address.
async function resolveAdminBccRecipients(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  excludeEmail: string
): Promise<string[]> {
  const exclude = excludeEmail.trim().toLowerCase()
  const dedupe = (emails: string[]): string[] =>
    Array.from(new Set(emails.filter((email) => email && email !== exclude)))

  const envRaw =
    process.env.VENDOR_NOTIFY_ADMIN_EMAIL || process.env.ADMIN_NOTIFY_EMAIL
  if (envRaw) {
    const envRecipients = envRaw
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.includes('@'))
    if (envRecipients.length > 0) return dedupe(envRecipients)
  }

  const { data, error } = await admin
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('is_active', true)
    .in('role', ['owner', 'admin'])

  if (error) {
    console.warn(`[email] admin BCC lookup failed: ${error.message}`)
    return []
  }
  if (!data) return []
  const emails = data
    .map((row) => row.email?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email && email.includes('@')))
  return dedupe(emails)
}

/**
 * Approve the vendor: flip `onboarding_status` to `active` so they can take
 * bookings on the marketplace. Caller is expected to have approved the
 * individual documents already; we don't enforce that here so admins can
 * approve a vendor whose docs are still in `pending_review` if they're
 * confident the docs are fine and want to skip the per-doc clicks.
 */
export async function approveVendor(vendorId: string): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('vendors')
    .update({
      onboarding_status: 'active',
      onboarding_completed_at: new Date().toISOString(),
      verified: true,
    })
    .eq('id', vendorId)
    .in('onboarding_status', ['admin_review', 'needs_corrections', 'suspended'])

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] approve vendor failed: ${error.code} ${error.message}`,
    }
  }

  await notifyVendorOfStatusChange(admin, vendorId, 'approved')

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

/**
 * Bounce the vendor back to fix flagged items. The admin should reject the
 * specific documents *before* calling this so the vendor sees per-document
 * notes on /verify. This action just flips the high-level status to
 * `needs_corrections` so /pending shows the "Action required" banner and
 * the verify-page auto-transition gate stops promoting them to admin_review
 * until they re-submit. The optional `note` is included verbatim in the
 * notification email so the vendor knows what high-level area to address
 * (per-document notes are still surfaced separately on /verify).
 */
export async function requestCorrections(
  vendorId: string,
  note?: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('vendors')
    .update({
      onboarding_status: 'needs_corrections',
    })
    .eq('id', vendorId)
    .in('onboarding_status', ['admin_review', 'verification_pending'])

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] request corrections failed: ${error.code} ${error.message}`,
    }
  }

  await notifyVendorOfStatusChange(
    admin,
    vendorId,
    'corrections_requested',
    note
  )

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

/**
 * Suspend an active or under-review vendor. Optional reason is stored on
 * the vendors row for the audit trail (admin sees it on subsequent reviews;
 * vendor sees a generic "your account is suspended" message until appeals
 * is wired up).
 */
export async function suspendVendor(
  vendorId: string,
  reason?: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('vendors')
    .update({
      onboarding_status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspension_reason: reason?.trim() || null,
    })
    .eq('id', vendorId)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] suspend vendor failed: ${error.code} ${error.message}`,
    }
  }

  await notifyVendorOfStatusChange(admin, vendorId, 'suspended', reason)

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

// =============================================================================
// Payout method editing — admin review owns verification status
// =============================================================================

export type VendorPayoutStatus = 'pending' | 'verified' | 'failed'
export type VendorPayoutMethodType =
  | 'mpesa'
  | 'airtel'
  | 'tigo'
  | 'lipa_namba'
  | 'bank'
  | 'stripe_connect'

export type VendorPayoutPatch = {
  methodType: VendorPayoutMethodType
  provider: string | null
  accountNumber: string
  accountHolderName: string
  status: VendorPayoutStatus
}

const VALID_PAYOUT_METHODS: VendorPayoutMethodType[] = [
  'mpesa',
  'airtel',
  'tigo',
  'lipa_namba',
  'bank',
  'stripe_connect',
]
const VALID_PAYOUT_STATUSES: VendorPayoutStatus[] = [
  'pending',
  'verified',
  'failed',
]

export async function saveVendorPayoutMethod(
  vendorId: string,
  payoutId: string | null,
  fields: VendorPayoutPatch
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  if (!VALID_PAYOUT_METHODS.includes(fields.methodType)) {
    return { ok: false, reason: 'invalid', error: 'Unknown payout method.' }
  }
  if (!VALID_PAYOUT_STATUSES.includes(fields.status)) {
    return { ok: false, reason: 'invalid', error: 'Unknown payout status.' }
  }
  if (!fields.accountNumber.trim()) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Account number is required.',
    }
  }
  if (!fields.accountHolderName.trim()) {
    return { ok: false, reason: 'invalid', error: 'Account name is required.' }
  }

  const admin = createSupabaseAdminClient()
  const reviewerId =
    fields.status === 'verified'
      ? await resolveAdminUserId(admin, userId)
      : null
  const now = new Date().toISOString()
  const payload = {
    method_type: fields.methodType,
    provider: fields.provider?.trim() || null,
    account_number: fields.accountNumber.trim(),
    account_holder_name: fields.accountHolderName.trim(),
    status: fields.status,
    verified_by: reviewerId,
    verified_at: fields.status === 'verified' ? now : null,
    failure_reason: null,
  }

  const query = payoutId
    ? admin
        .from('vendor_payout_methods')
        .update(payload)
        .eq('id', payoutId)
        .eq('vendor_id', vendorId)
    : admin.from('vendor_payout_methods').insert({
        vendor_id: vendorId,
        is_default: true,
        ...payload,
      })

  const { error } = await query
  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] payout save failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

export async function deleteVendorPayoutMethod(
  vendorId: string,
  payoutId: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }
  if (!payoutId) {
    return { ok: false, reason: 'invalid', error: 'Missing payout method.' }
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('vendor_payout_methods')
    .delete()
    .eq('id', payoutId)
    .eq('vendor_id', vendorId)

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] payout delete failed: ${error.code} ${error.message}`,
    }
  }

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

// =============================================================================
// Per-section approval (storefront)
// =============================================================================

export type StorefrontSection =
  | 'profile'
  | 'photos'
  | 'services'
  | 'packages'
  | 'recognition'
  | 'team'
  | 'faq'

export type SectionStatus = 'pending' | 'approved' | 'rejected'

const VALID_SECTIONS: StorefrontSection[] = [
  'profile',
  'photos',
  'services',
  'packages',
  'recognition',
  'team',
  'faq',
]
const VALID_SECTION_STATUSES: SectionStatus[] = [
  'pending',
  'approved',
  'rejected',
]

/**
 * Set the moderation status of one storefront section. Stored as a JSONB
 * map on `vendors.section_status` (e.g. `{"profile":"approved","faq":"pending"}`).
 *
 * Approving the vendor as a whole (`approveVendor` above) does not auto-set
 * every section to approved — admin can still bounce one section back via
 * this action even after the vendor is live, useful for content moderation.
 */
export async function setSectionStatus(
  vendorId: string,
  section: StorefrontSection,
  status: SectionStatus
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }
  if (!VALID_SECTIONS.includes(section)) {
    return { ok: false, reason: 'invalid', error: 'Unknown section.' }
  }
  if (!VALID_SECTION_STATUSES.includes(status)) {
    return { ok: false, reason: 'invalid', error: 'Unknown status.' }
  }

  const admin = createSupabaseAdminClient()
  // Read-modify-write the JSONB map. Cheap (one row, small payload) and
  // avoids needing a Postgres helper function for object-key set-merge.
  const current = await admin
    .from('vendors')
    .select('section_status')
    .eq('id', vendorId)
    .maybeSingle<{ section_status: Record<string, string> | null }>()
  if (current.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] section_status read failed: ${current.error.code} ${current.error.message}`,
    }
  }
  const next = { ...(current.data?.section_status ?? {}), [section]: status }

  const { error } = await admin
    .from('vendors')
    .update({ section_status: next })
    .eq('id', vendorId)
  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] section_status write failed: ${error.code} ${error.message}`,
    }
  }
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

// =============================================================================
// Storefront section CRUD (admin can edit anything the vendor can edit)
// =============================================================================

export type StorefrontTeamMember = {
  id?: string
  name: string
  role: string
  bio?: string
  avatar?: string
}

export type StorefrontFaq = {
  id?: string
  question: string
  answer: string
}

export type StorefrontPackage = {
  id?: string
  name: string
  price: string
  description?: string
  includes?: string[]
}

export type StorefrontPatch = {
  // Profile
  businessName?: string
  bio?: string
  yearsInBusiness?: number | null
  street?: string
  street2?: string
  city?: string
  region?: string
  postalCode?: string
  homeMarket?: string | null
  serviceMarkets?: string[]
  phone?: string
  email?: string
  whatsapp?: string
  socialWebsite?: string
  socialInstagram?: string
  socialFacebook?: string
  socialTiktok?: string
  socialWhatsapp?: string
  hours?: Record<string, { open: boolean; from: string; to: string }> | null
  style?: string | null
  personality?: string | null
  languages?: string[]
  responseTimeHours?: string | null
  locallyOwned?: boolean | null
  parallelBookingCapacity?: number | null
  depositPercent?: string | null
  cancellationLevel?: string | null
  reschedulePolicy?: string | null
  // Photos
  coverImage?: string | null
  galleryUrls?: string[]
  // Videos — uploaded MP4/MOV/WebM URLs or YouTube/Vimeo embed links
  videoUrls?: string[]
  // Services
  services?: string[]
  // Packages
  packages?: StorefrontPackage[]
  // Recognition
  awards?: string | null
  awardCertificates?: Array<Record<string, unknown>>
  // Team
  team?: StorefrontTeamMember[]
  // FAQ
  faqs?: StorefrontFaq[]
  // Map coords (admin-fillable until onboarding gains the step)
  lat?: number | null
  lng?: number | null
  // Capacity (admin-fillable until onboarding gains the step)
  capacityMin?: number | null
  capacityMax?: number | null
}

/**
 * Admin update for any subset of storefront fields. Each field is mapped to
 * its DB column so the website mapper picks it up immediately. JSONB
 * sub-fields (location/contact_info/social_links) are merged with the
 * current value so partial patches don't wipe sibling keys.
 */
export async function updateStorefrontSection(
  vendorId: string,
  patch: StorefrontPatch
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()

  const current = await admin
    .from('vendors')
    .select('location, contact_info, social_links')
    .eq('id', vendorId)
    .maybeSingle<{
      location: Record<string, unknown> | null
      contact_info: Record<string, unknown> | null
      social_links: Record<string, unknown> | null
    }>()
  if (current.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] storefront read failed: ${current.error.code} ${current.error.message}`,
    }
  }

  const update: Record<string, unknown> = {}

  if (patch.businessName !== undefined)
    update.business_name = patch.businessName.trim()
  if (patch.bio !== undefined) update.bio = patch.bio
  if (patch.yearsInBusiness !== undefined)
    update.years_in_business = patch.yearsInBusiness

  // location merge
  if (
    patch.street !== undefined ||
    patch.street2 !== undefined ||
    patch.city !== undefined ||
    patch.region !== undefined ||
    patch.postalCode !== undefined ||
    patch.homeMarket !== undefined ||
    patch.serviceMarkets !== undefined
  ) {
    const base = (current.data?.location as Record<string, unknown>) ?? {}
    update.location = {
      ...base,
      ...(patch.street !== undefined && { street: patch.street.trim() }),
      ...(patch.street2 !== undefined && { street2: patch.street2.trim() }),
      ...(patch.city !== undefined && { city: patch.city.trim() }),
      ...(patch.region !== undefined && { region: patch.region.trim() }),
      ...(patch.postalCode !== undefined && {
        postalCode: patch.postalCode.trim(),
      }),
      ...(patch.homeMarket !== undefined && { homeMarket: patch.homeMarket }),
      ...(patch.serviceMarkets !== undefined && {
        serviceMarkets: patch.serviceMarkets,
      }),
    }
    if (patch.homeMarket !== undefined) update.home_market = patch.homeMarket
    if (patch.serviceMarkets !== undefined)
      update.service_markets = patch.serviceMarkets
  }

  // contact merge
  if (
    patch.phone !== undefined ||
    patch.email !== undefined ||
    patch.whatsapp !== undefined
  ) {
    const base = (current.data?.contact_info as Record<string, unknown>) ?? {}
    update.contact_info = {
      ...base,
      ...(patch.phone !== undefined && { phone: patch.phone.trim() }),
      ...(patch.email !== undefined && { email: patch.email.trim() }),
      ...(patch.whatsapp !== undefined && { whatsapp: patch.whatsapp.trim() }),
    }
  }

  // socials merge
  if (
    patch.socialWebsite !== undefined ||
    patch.socialInstagram !== undefined ||
    patch.socialFacebook !== undefined ||
    patch.socialTiktok !== undefined ||
    patch.socialWhatsapp !== undefined
  ) {
    const base = (current.data?.social_links as Record<string, unknown>) ?? {}
    update.social_links = {
      ...base,
      ...(patch.socialWebsite !== undefined && {
        website: patch.socialWebsite.trim(),
      }),
      ...(patch.socialInstagram !== undefined && {
        instagram: patch.socialInstagram.trim(),
      }),
      ...(patch.socialFacebook !== undefined && {
        facebook: patch.socialFacebook.trim(),
      }),
      ...(patch.socialTiktok !== undefined && {
        tiktok: patch.socialTiktok.trim(),
      }),
      ...(patch.socialWhatsapp !== undefined && {
        whatsapp: patch.socialWhatsapp.trim(),
      }),
    }
  }

  if (patch.hours !== undefined) update.hours = patch.hours
  if (patch.style !== undefined) update.style = patch.style
  if (patch.personality !== undefined) update.personality = patch.personality
  if (patch.languages !== undefined) update.languages = patch.languages
  if (patch.responseTimeHours !== undefined)
    update.response_time_hours = patch.responseTimeHours
  if (patch.locallyOwned !== undefined)
    update.locally_owned = patch.locallyOwned
  if (patch.parallelBookingCapacity !== undefined)
    update.parallel_booking_capacity = patch.parallelBookingCapacity
  if (patch.depositPercent !== undefined)
    update.deposit_percent = patch.depositPercent
  if (patch.cancellationLevel !== undefined)
    update.cancellation_level = patch.cancellationLevel
  if (patch.reschedulePolicy !== undefined)
    update.reschedule_policy = patch.reschedulePolicy

  if (patch.coverImage !== undefined) update.cover_image = patch.coverImage
  if (patch.galleryUrls !== undefined) {
    const cleaned = patch.galleryUrls
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u))
    update.gallery_urls = cleaned.length > 0 ? cleaned : null
  }
  if (patch.videoUrls !== undefined) {
    const cleaned = patch.videoUrls
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u))
    update.video_urls = cleaned.length > 0 ? cleaned : null
  }

  if (patch.services !== undefined) update.services_offered = patch.services
  if (patch.packages !== undefined) update.packages = patch.packages

  if (patch.awards !== undefined) update.awards = patch.awards
  if (patch.awardCertificates !== undefined)
    update.award_certificates = patch.awardCertificates

  if (patch.team !== undefined) update.team = patch.team
  if (patch.faqs !== undefined) update.faqs = patch.faqs

  if (patch.lat !== undefined) update.lat = patch.lat
  if (patch.lng !== undefined) update.lng = patch.lng
  if (patch.capacityMin !== undefined || patch.capacityMax !== undefined) {
    if (patch.capacityMin == null && patch.capacityMax == null) {
      update.capacity = null
    } else {
      update.capacity = {
        min: patch.capacityMin ?? 0,
        max: patch.capacityMax ?? patch.capacityMin ?? 0,
      }
    }
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, reason: 'invalid', error: 'No fields to update.' }
  }

  // Try the full update first, then retry without `video_urls` if the
  // column hasn't been migrated yet (same pattern as the existing
  // packages / application_snapshot guards) so admin saves don't break in
  // environments that are behind on migrations.
  let { error } = await admin.from('vendors').update(update).eq('id', vendorId)
  if (
    error &&
    'video_urls' in update &&
    (error.code === '42703' || error.code === 'PGRST204')
  ) {
    const { video_urls: _omit, ...rest } = update
    void _omit
    const retry = await admin.from('vendors').update(rest).eq('id', vendorId)
    error = retry.error
    if (!error) {
      console.warn(
        '[admin] video_urls column missing — videos were not persisted. Apply migration 20260512000010.',
      )
    }
  }
  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] storefront update failed: ${error.code} ${error.message}`,
    }
  }

  // Mirror the patch into application_snapshot so admin review (which reads
  // snapshot) and structured-column readers stay in sync. Same merge pattern
  // as publishStorefront in vendors_portal — only patch keys that actually
  // changed; preserve everything else.
  await mirrorPatchToSnapshot(admin, vendorId, patch)

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}

/**
 * Best-effort merge of admin's patch into `vendors.application_snapshot`.
 * We read-modify-write because Supabase JS doesn't expose JSONB `||`. This
 * keeps the admin operations card view consistent with the structured
 * columns the website mapper reads. Failure here is logged but doesn't fail
 * the parent action — the structured-column update has already succeeded
 * and is what the public page actually renders.
 */
async function mirrorPatchToSnapshot(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  vendorId: string,
  patch: StorefrontPatch
): Promise<void> {
  const snapPatch: Record<string, unknown> = {}
  if (patch.businessName !== undefined)
    snapPatch.businessName = patch.businessName
  if (patch.bio !== undefined) snapPatch.bio = patch.bio
  if (patch.yearsInBusiness !== undefined) {
    snapPatch.yearsInBusiness =
      typeof patch.yearsInBusiness === 'number'
        ? String(patch.yearsInBusiness)
        : patch.yearsInBusiness
  }
  if (patch.street !== undefined) snapPatch.street = patch.street
  if (patch.street2 !== undefined) snapPatch.street2 = patch.street2
  if (patch.city !== undefined) snapPatch.city = patch.city
  if (patch.region !== undefined) snapPatch.region = patch.region
  if (patch.postalCode !== undefined) snapPatch.postalCode = patch.postalCode
  if (patch.homeMarket !== undefined) snapPatch.homeMarket = patch.homeMarket
  if (patch.serviceMarkets !== undefined)
    snapPatch.serviceMarkets = patch.serviceMarkets
  if (patch.phone !== undefined) snapPatch.phone = patch.phone
  if (patch.email !== undefined) snapPatch.email = patch.email
  if (patch.whatsapp !== undefined) snapPatch.whatsapp = patch.whatsapp
  if (
    patch.socialWebsite !== undefined ||
    patch.socialInstagram !== undefined ||
    patch.socialFacebook !== undefined ||
    patch.socialTiktok !== undefined ||
    patch.socialWhatsapp !== undefined
  ) {
    snapPatch.socials = {
      ...(patch.socialWebsite !== undefined && {
        website: patch.socialWebsite,
      }),
      ...(patch.socialInstagram !== undefined && {
        instagram: patch.socialInstagram,
      }),
      ...(patch.socialFacebook !== undefined && {
        facebook: patch.socialFacebook,
      }),
      ...(patch.socialTiktok !== undefined && { tiktok: patch.socialTiktok }),
      ...(patch.socialWhatsapp !== undefined && {
        whatsapp: patch.socialWhatsapp,
      }),
    }
  }
  if (patch.hours !== undefined) snapPatch.hours = patch.hours
  if (patch.style !== undefined) snapPatch.style = patch.style
  if (patch.personality !== undefined) snapPatch.personality = patch.personality
  if (patch.languages !== undefined) snapPatch.languages = patch.languages
  if (patch.responseTimeHours !== undefined)
    snapPatch.responseTimeHours = patch.responseTimeHours
  if (patch.locallyOwned !== undefined)
    snapPatch.locallyOwned = patch.locallyOwned
  if (patch.parallelBookingCapacity !== undefined)
    snapPatch.parallelBookingCapacity = patch.parallelBookingCapacity
  if (patch.depositPercent !== undefined)
    snapPatch.depositPercent = patch.depositPercent
  if (patch.cancellationLevel !== undefined)
    snapPatch.cancellationLevel = patch.cancellationLevel
  if (patch.reschedulePolicy !== undefined)
    snapPatch.reschedulePolicy = patch.reschedulePolicy
  if (patch.services !== undefined) snapPatch.specialServices = patch.services
  if (patch.packages !== undefined) snapPatch.packages = patch.packages
  if (patch.awards !== undefined) snapPatch.awards = patch.awards
  if (patch.awardCertificates !== undefined)
    snapPatch.awardCertificates = patch.awardCertificates
  if (patch.team !== undefined) snapPatch.team = patch.team
  if (patch.faqs !== undefined) snapPatch.faqs = patch.faqs

  if (Object.keys(snapPatch).length === 0) return

  const read = await admin
    .from('vendors')
    .select('application_snapshot')
    .eq('id', vendorId)
    .maybeSingle<{ application_snapshot: Record<string, unknown> | null }>()
  if (read.error) {
    console.warn(
      `[admin] snapshot read failed (skipping mirror): ${read.error.code} ${read.error.message}`
    )
    return
  }
  const merged = {
    ...(read.data?.application_snapshot ?? {}),
    ...snapPatch,
  }
  const write = await admin
    .from('vendors')
    .update({ application_snapshot: merged })
    .eq('id', vendorId)
  if (write.error) {
    console.warn(
      `[admin] snapshot mirror write failed: ${write.error.code} ${write.error.message}`
    )
  }
}

/**
 * Reactivate a suspended vendor. Symmetric to suspendVendor; clears the
 * suspended_at + suspension_reason fields.
 */
// =============================================================================
// Admin-created vendor accounts
// =============================================================================
//
// Admin can spin up a vendor record directly — useful for vendors who
// can't (or won't) navigate the self-serve onboarding flow, or for
// seeding curated featured vendors before they sign up. The flow:
//
//   1. Upsert a `public.users` row keyed on email (placeholder password
//      since Clerk owns auth). If the email is already a user we reuse
//      the existing row — no orphans.
//   2. Insert the `vendors` row pointing at that user with a unique slug
//      derived from the business name. Status starts at
//      `application_in_progress` so admin can fill in the rest via the
//      existing review-page editors.
//   3. Insert an owner-role `vendor_memberships` row so the vendor can
//      eventually claim the account when they sign in with the matching
//      email.
//
// The created vendor row is intentionally minimal — admin fills the rest
// (address, phone, packages, photos, etc.) using the per-section
// editors on the review page.

const VALID_VENDOR_CATEGORIES = [
  'Venues',
  'Photographers',
  'Videographers',
  'Caterers',
  'Wedding Planners',
  'Florists',
  'DJs & Music',
  'Beauty & Makeup',
  'Bridal Salons',
  'Cake & Desserts',
  'Decorators',
  'Officiants',
  'Rentals',
  'Transportation',
] as const

export type VendorCategory = (typeof VALID_VENDOR_CATEGORIES)[number]

function slugifyForVendor(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export type CreateVendorInput = {
  businessName: string
  category: string
  contactEmail: string
  city?: string
  phone?: string
  bio?: string
}

export type CreateVendorResult =
  | { ok: true; vendorId: string }
  | {
      ok: false
      error: string
      reason: 'unauth' | 'invalid' | 'duplicate' | 'unknown'
    }

export async function createVendorAccount(
  input: CreateVendorInput,
): Promise<CreateVendorResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const businessName = input.businessName?.trim()
  const email = input.contactEmail?.trim().toLowerCase()
  const category = input.category as VendorCategory
  if (!businessName) {
    return { ok: false, reason: 'invalid', error: 'Business name is required.' }
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'A valid contact email is required.',
    }
  }
  if (!VALID_VENDOR_CATEGORIES.includes(category)) {
    return { ok: false, reason: 'invalid', error: 'Pick a vendor category.' }
  }

  const admin = createSupabaseAdminClient()

  // 1) Upsert the user keyed on email. The legacy `password` column is
  // NOT NULL but unused under Clerk — store an opaque marker. clerk_id
  // is left null and gets linked when the vendor signs in via the
  // matching email.
  const userUpsert = await admin
    .from('users')
    .upsert(
      {
        email,
        name: businessName,
        password: 'admin-created-placeholder',
        role: 'vendor',
      },
      { onConflict: 'email' },
    )
    .select('id')
    .single<{ id: string }>()
  if (userUpsert.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] users upsert failed: ${userUpsert.error.code} ${userUpsert.error.message}`,
    }
  }
  const supabaseUserId = userUpsert.data.id

  // 2) Resolve a unique slug — append a short random suffix on collision.
  const baseSlug = slugifyForVendor(businessName) || 'vendor'
  let slug = baseSlug
  const slugCheck = await admin
    .from('vendors')
    .select('id', { count: 'exact', head: true })
    .eq('slug', baseSlug)
  if (slugCheck.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] slug check failed: ${slugCheck.error.code} ${slugCheck.error.message}`,
    }
  }
  if ((slugCheck.count ?? 0) > 0) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`
  }

  // Guard against a duplicate vendor row for the same user — if admin
  // already created one for this contact email, surface a clear error
  // rather than letting the insert blow up on a unique constraint.
  const existing = await admin
    .from('vendors')
    .select('id, business_name')
    .eq('user_id', supabaseUserId)
    .limit(1)
    .maybeSingle<{ id: string; business_name: string }>()
  if (existing.data) {
    return {
      ok: false,
      reason: 'duplicate',
      error: `A vendor already exists for ${email}: ${existing.data.business_name}.`,
    }
  }

  const corePayload: Record<string, unknown> = {
    slug,
    user_id: supabaseUserId,
    business_name: businessName,
    category,
    bio: input.bio?.trim() || null,
    location: input.city?.trim() ? { city: input.city.trim() } : {},
    contact_info: {
      email,
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    },
    onboarding_status: 'application_in_progress' as const,
    onboarding_started_at: new Date().toISOString(),
  }

  const insert = await admin
    .from('vendors')
    .insert(corePayload)
    .select('id')
    .single<{ id: string }>()
  if (insert.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] vendor insert failed: ${insert.error.code} ${insert.error.message}`,
    }
  }
  const vendorId = insert.data.id

  // 3) Owner membership so the vendor can claim the account on sign-in.
  // ON CONFLICT (vendor_id, user_id) — same pattern as the portal submit
  // flow, see vendors_portal/src/lib/onboarding/submit.ts.
  const membership = await admin.from('vendor_memberships').upsert(
    {
      vendor_id: vendorId,
      user_id: supabaseUserId,
      role: 'owner' as const,
      status: 'active' as const,
    },
    { onConflict: 'vendor_id,user_id' },
  )
  if (membership.error) {
    console.warn(
      `[admin] vendor_memberships upsert failed for vendor=${vendorId}: ${membership.error.code} ${membership.error.message} — vendor row exists but owner membership wasn't created`,
    )
  }

  revalidatePath('/operations/vendors')
  return { ok: true, vendorId }
}

// =============================================================================
// Admin-side media uploads (photos + videos) on behalf of a vendor
// =============================================================================
//
// Admins curate vendor storefronts: they need to add a missing cover, swap
// a watermarked photo, or attach the highlight reel the vendor emailed
// over. These actions write into the same `vendor-portfolios` bucket and
// the same `cover_image` / `gallery_urls` / `video_urls` columns that the
// vendor portal uses, so the public profile reads one canonical source.
//
// Photos travel through a server action (small, image MIME guard). Videos
// use a signed *upload* URL — a 100 MB MOV would exceed the Vercel server
// action body cap, so the browser PUTs the file directly to Supabase
// Storage and we just persist the resulting public URL.

const ADMIN_PHOTO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ADMIN_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const ADMIN_PHOTO_MAX_BYTES = 25 * 1024 * 1024 // 25 MB — matches portal cap
const ADMIN_VIDEO_MAX_BYTES = 500 * 1024 * 1024 // 500 MB — matches bucket cap

export type AdminUploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string; reason: 'unauth' | 'invalid' | 'unknown' }

export type AdminVideoUploadUrlResult =
  | {
      ok: true
      uploadUrl: string
      token: string
      publicUrl: string
      path: string
    }
  | { ok: false; error: string; reason: 'unauth' | 'invalid' | 'unknown' }

export async function adminUploadVendorPhoto(
  formData: FormData,
): Promise<AdminUploadResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const vendorId = formData.get('vendorId')
  const kind = formData.get('kind')
  const file = formData.get('file')
  if (typeof vendorId !== 'string' || !vendorId) {
    return { ok: false, reason: 'invalid', error: 'Missing vendor id.' }
  }
  if (kind !== 'cover' && kind !== 'gallery') {
    return { ok: false, reason: 'invalid', error: 'Unknown upload kind.' }
  }
  if (!(file instanceof File)) {
    return { ok: false, reason: 'invalid', error: 'No file in upload payload.' }
  }
  if (!ADMIN_PHOTO_MIME.has(file.type)) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Only JPEG, PNG, WebP, or GIF images are allowed.',
    }
  }
  if (file.size > ADMIN_PHOTO_MAX_BYTES) {
    return {
      ok: false,
      reason: 'invalid',
      error: `${file.name}: file is over the 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    }
  }

  const ext = (() => {
    if (file.type === 'image/jpeg') return 'jpg'
    if (file.type === 'image/png') return 'png'
    if (file.type === 'image/webp') return 'webp'
    if (file.type === 'image/gif') return 'gif'
    return 'bin'
  })()
  const path = `${vendorId}/storefront/${kind}/${Date.now()}.${ext}`
  const admin = createSupabaseAdminClient()
  const buf = Buffer.from(await file.arrayBuffer())
  const upload = await admin.storage
    .from('vendor-portfolios')
    .upload(path, buf, { contentType: file.type, upsert: false })
  if (upload.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] photo upload failed: ${upload.error.message}`,
    }
  }
  const publicUrl = admin.storage.from('vendor-portfolios').getPublicUrl(path)
  return { ok: true, url: publicUrl.data.publicUrl, path }
}

export async function adminCreateVendorVideoUploadUrl(input: {
  vendorId: string
  filename: string
  mimeType: string
  sizeBytes: number
}): Promise<AdminVideoUploadUrlResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }
  if (!input.vendorId) {
    return { ok: false, reason: 'invalid', error: 'Missing vendor id.' }
  }
  if (!ADMIN_VIDEO_MIME.has(input.mimeType)) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Only MP4, WebM, or MOV video files are allowed.',
    }
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0) {
    return { ok: false, reason: 'invalid', error: 'Missing file size.' }
  }
  if (input.sizeBytes > ADMIN_VIDEO_MAX_BYTES) {
    return {
      ok: false,
      reason: 'invalid',
      error: `${input.filename}: video is over the 500 MB limit (${(input.sizeBytes / 1024 / 1024).toFixed(1)} MB).`,
    }
  }

  const ext = (() => {
    if (input.mimeType === 'video/mp4') return 'mp4'
    if (input.mimeType === 'video/webm') return 'webm'
    if (input.mimeType === 'video/quicktime') return 'mov'
    return 'bin'
  })()
  const path = `${input.vendorId}/storefront/video/${Date.now()}.${ext}`
  const admin = createSupabaseAdminClient()
  const signed = await admin.storage
    .from('vendor-portfolios')
    .createSignedUploadUrl(path)
  if (signed.error || !signed.data) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] signed upload URL failed: ${signed.error?.message ?? 'unknown'}`,
    }
  }
  const publicUrl = admin.storage.from('vendor-portfolios').getPublicUrl(path)
  return {
    ok: true,
    uploadUrl: signed.data.signedUrl,
    token: signed.data.token,
    publicUrl: publicUrl.data.publicUrl,
    path,
  }
}

export async function reactivateVendor(
  vendorId: string
): Promise<ActionResult> {
  const { userId } = await auth()
  if (!userId) return { ok: false, reason: 'unauth', error: 'Sign in first.' }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('vendors')
    .update({
      onboarding_status: 'active',
      suspended_at: null,
      suspension_reason: null,
    })
    .eq('id', vendorId)
    .eq('onboarding_status', 'suspended')

  if (error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[admin] reactivate vendor failed: ${error.code} ${error.message}`,
    }
  }

  await notifyVendorOfStatusChange(admin, vendorId, 'reactivated')

  revalidatePath('/operations/vendors')
  revalidatePath(`/operations/vendors/${vendorId}`)
  return { ok: true }
}
