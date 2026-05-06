'use server'

import { createHash, randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import {
  createClerkSupabaseServerClient,
  createSupabaseAdminClient,
} from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  getVendorAgreement,
  VENDOR_AGREEMENT_VERSION,
} from '@/lib/onboarding/vendor-agreement'

export type VerifyDocType =
  | 'tin_certificate'
  | 'business_license'
  | 'sole_proprietor_declaration'

export type UploadResult =
  | { ok: true }
  | {
      ok: false
      error: string
      reason: 'unauth' | 'wrong-state' | 'invalid' | 'storage' | 'unknown'
    }

const ACCEPTED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const MAX_BYTES = 10 * 1024 * 1024 // 10MB — matches the storage bucket limit

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

/**
 * Upload a verification document for the current vendor.
 *
 * The vendor must be in either `verification_pending` or `needs_corrections`.
 * Active / suspended / unauth callers are rejected. Replacing an existing doc
 * flips the previous row's `is_latest` flag to false rather than deleting it,
 * so the audit trail of admin reviews is preserved.
 *
 * Storage path layout: `{vendor_id}/{doc_type}/{uuid}.{ext}`. The bucket RLS
 * (migration 20260501000002) ties access to `is_vendor_member()` against the
 * first folder segment.
 */
export async function uploadVerificationDocument(
  formData: FormData,
): Promise<UploadResult> {
  const docType = formData.get('docType') as VerifyDocType | null
  const file = formData.get('file')

  if (!docType || !isValidDocType(docType)) {
    return { ok: false, reason: 'invalid', error: 'Missing or invalid doc type.' }
  }
  if (!(file instanceof File)) {
    return { ok: false, reason: 'invalid', error: 'No file attached.' }
  }
  if (!ACCEPTED_MIMES.has(file.type)) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Use a JPG, PNG, WEBP, or PDF.',
    }
  }
  if (file.size === 0) {
    return { ok: false, reason: 'invalid', error: 'File is empty.' }
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'File is over 10MB. Compress or trim before uploading.',
    }
  }

  const state = await getCurrentVendor()
  if (state.kind !== 'pending-approval') {
    return {
      ok: false,
      reason: 'wrong-state',
      error:
        state.kind === 'live'
          ? 'Your account is already approved.'
          : state.kind === 'suspended'
            ? 'Your account is suspended.'
            : "You haven't started a vendor application yet.",
    }
  }
  if (
    state.status !== 'verification_pending' &&
    state.status !== 'needs_corrections'
  ) {
    return {
      ok: false,
      reason: 'wrong-state',
      error: 'Verification uploads are only accepted while your application is in verification or correction.',
    }
  }

  // We need the vendor_id for the storage path + the row insert. Pull it via
  // the Clerk-authed client so RLS narrows to vendors the caller actually owns.
  const userClient = await createClerkSupabaseServerClient()
  const ownVendor = await userClient
    .from('vendor_memberships')
    .select('vendor_id')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ vendor_id: string }>()

  if (ownVendor.error || !ownVendor.data) {
    return {
      ok: false,
      reason: 'unknown',
      error: ownVendor.error
        ? `[verify] membership lookup failed: ${ownVendor.error.code} ${ownVendor.error.message}`
        : '[verify] no active membership found',
    }
  }
  const vendorId = ownVendor.data.vendor_id

  const ext = EXT_BY_MIME[file.type] ?? 'bin'
  const storagePath = `${vendorId}/${docType}/${randomUUID()}.${ext}`

  // Upload as service role so we don't get tripped up by storage RLS quirks
  // around mime sniffing on PDFs. The `is_vendor_member()`-based read policy
  // still gates downloads correctly.
  const admin = createSupabaseAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())
  const upload = await admin.storage
    .from('vendor_verification')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (upload.error) {
    return {
      ok: false,
      reason: 'storage',
      error: `[verify] upload failed: ${upload.error.message}`,
    }
  }

  // Mark all prior submissions of this doc_type as not-latest.
  const supersede = await admin
    .from('vendor_verification_documents')
    .update({ is_latest: false })
    .eq('vendor_id', vendorId)
    .eq('doc_type', docType)
    .eq('is_latest', true)

  if (supersede.error) {
    // Best-effort: the new row insert below still wins, but we log so an admin
    // can spot the orphaned `is_latest` rows if they accumulate.
    console.warn(
      `[verify] is_latest supersede failed for vendor ${vendorId}: ${supersede.error.message}`,
    )
  }

  const insert = await admin.from('vendor_verification_documents').insert({
    vendor_id: vendorId,
    doc_type: docType,
    storage_path: storagePath,
    original_filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    status: 'pending_review',
    is_latest: true,
  })

  if (insert.error) {
    // Try to clean up the orphan storage object so we don't accumulate
    // unreferenced files when row insert fails.
    await admin.storage.from('vendor_verification').remove([storagePath])
    return {
      ok: false,
      reason: 'unknown',
      error: `[verify] document row insert failed: ${insert.error.code} ${insert.error.message}`,
    }
  }

  // If all required artifacts are now present, transition the vendor into
  // admin review automatically — admins shouldn't have to chase incomplete
  // applications.
  await maybeTransitionToAdminReview(vendorId)

  revalidatePath('/verify')
  revalidatePath('/pending')
  return { ok: true }
}

function isValidDocType(s: string): s is VerifyDocType {
  return (
    s === 'tin_certificate' ||
    s === 'business_license' ||
    s === 'sole_proprietor_declaration'
  )
}

/**
 * Auto-flip onboarding_status from `verification_pending` (or
 * `needs_corrections`) to `admin_review` once every required artifact is in
 * place. The cheap-but-correct rule used here:
 *
 *   - latest TIN certificate exists with status pending_review or approved
 *   - latest business license OR sole-proprietor declaration exists, same
 *   - a payout method row exists (set during /onboard submit)
 *   - an agreement row exists (set during /onboard submit)
 *
 * Anything more (TIN ↔ payout name match, BRELA cross-check) is the human
 * admin's job — handled in the dashboard review queue.
 */
async function maybeTransitionToAdminReview(vendorId: string): Promise<void> {
  const admin = createSupabaseAdminClient()

  const docs = await admin
    .from('vendor_verification_documents')
    .select('doc_type, status')
    .eq('vendor_id', vendorId)
    .eq('is_latest', true)
    .returns<Array<{ doc_type: string; status: string }>>()

  if (docs.error || !docs.data) {
    console.warn(
      `[verify] auto-transition: docs query failed for ${vendorId}: ${docs.error?.message ?? 'no data'}`,
    )
    return
  }

  const docTypes = new Set(
    docs.data
      .filter((d) => d.status === 'pending_review' || d.status === 'approved')
      .map((d) => d.doc_type),
  )

  const hasTin = docTypes.has('tin_certificate')
  const hasLicense =
    docTypes.has('business_license') ||
    docTypes.has('sole_proprietor_declaration')

  if (!hasTin || !hasLicense) return

  const [payouts, agreements] = await Promise.all([
    admin
      .from('vendor_payout_methods')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId),
    // Match only signatures against the *current* agreement version. Older
    // rows (e.g. the placeholder "v2026-05-vows-v1" from before the legal
    // Mkataba shipped) live on as audit history but don't satisfy the
    // verification gate — the vendor must re-sign the current agreement.
    admin
      .from('vendor_agreements')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('agreement_version', VENDOR_AGREEMENT_VERSION),
  ])

  if ((payouts.count ?? 0) === 0 || (agreements.count ?? 0) === 0) return

  await admin
    .from('vendors')
    .update({
      onboarding_status: 'admin_review',
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    // Only flip when state actually allows it — never re-promote an active or
    // suspended vendor by accident.
    .in('onboarding_status', ['verification_pending', 'needs_corrections'])
}

// =============================================================================
// Vendor agreement e-signature
// =============================================================================

export type SignAgreementResult =
  | { ok: true }
  | {
      ok: false
      error: string
      reason: 'unauth' | 'wrong-state' | 'invalid' | 'unknown'
    }

/**
 * Capture the vendor's e-signature on the OpusFesta Vendor Agreement.
 *
 * The signature event records:
 *   - the agreement version + SHA-256 of the agreement body at sign time
 *     (so the audit trail can prove what was agreed to even if the source
 *     copy is updated later)
 *   - the typed full name as the signature
 *   - the IP + user-agent for non-repudiation
 *
 * Re-running with the same `(vendor_id, agreement_version)` is a no-op due
 * to the unique constraint, so re-submits don't create duplicate rows.
 *
 * Triggers the same auto-transition to `admin_review` once all the other
 * verification artifacts are in place.
 */
export async function signVendorAgreement(formData: FormData): Promise<SignAgreementResult> {
  const typedName = String(formData.get('signedName') ?? '').trim()
  const acknowledged = formData.get('acknowledged') === 'true'
  const signatureImage = String(formData.get('signatureImage') ?? '').trim()

  // Page-3 identification block of the Mkataba. Captured at signing time so
  // the audit trail records the exact details the vendor declared on the
  // agreement form, independent of any later edits to the vendors row.
  const businessDetails = {
    businessName: String(formData.get('businessName') ?? '').trim(),
    tin: String(formData.get('tin') ?? '').trim(),
    businessAddress: String(formData.get('businessAddress') ?? '').trim(),
    contactPerson: String(formData.get('contactPerson') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    serviceType: String(formData.get('serviceType') ?? '').trim(),
  }

  if (!acknowledged) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Tick the acknowledgement box before signing.',
    }
  }
  if (typedName.length < 2) {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Type your full legal name to sign.',
    }
  }
  for (const [key, swahili] of [
    ['businessName', 'Jina la Biashara'],
    ['tin', 'TIN'],
    ['businessAddress', 'Anwani ya Biashara'],
    ['contactPerson', 'Mtu wa Mawasiliano'],
    ['email', 'Barua Pepe'],
    ['phone', 'WhatsApp/Simu'],
    ['serviceType', 'Aina ya Huduma'],
  ] as const) {
    if (!businessDetails[key]) {
      return {
        ok: false,
        reason: 'invalid',
        error: `Fill in ${swahili} before signing.`,
      }
    }
  }

  // Drawing is optional, but if present validate the data URL up front so we
  // fail before touching storage. Cap at 1 MB raw — way more than enough
  // for a hand-drawn signature; rejects accidental large pastes.
  let signaturePngBuffer: Buffer | null = null
  if (signatureImage) {
    const match = signatureImage.match(/^data:image\/png;base64,(.+)$/)
    if (!match) {
      return {
        ok: false,
        reason: 'invalid',
        error:
          'Drawn signature must be a PNG. Try clearing the canvas and signing again.',
      }
    }
    signaturePngBuffer = Buffer.from(match[1], 'base64')
    if (signaturePngBuffer.length > 1_000_000) {
      return {
        ok: false,
        reason: 'invalid',
        error: 'Drawn signature is too large. Clear the canvas and re-sign.',
      }
    }
  }

  const { userId } = await auth()
  if (!userId) {
    return { ok: false, reason: 'unauth', error: 'Sign in to continue.' }
  }

  const state = await getCurrentVendor()
  if (state.kind !== 'pending-approval') {
    return {
      ok: false,
      reason: 'wrong-state',
      error:
        state.kind === 'live'
          ? 'Your account is already approved.'
          : state.kind === 'suspended'
            ? 'Your account is suspended.'
            : "You haven't started a vendor application yet.",
    }
  }
  if (
    state.status !== 'verification_pending' &&
    state.status !== 'needs_corrections'
  ) {
    return {
      ok: false,
      reason: 'wrong-state',
      error: 'The agreement can only be signed during verification.',
    }
  }

  const userClient = await createClerkSupabaseServerClient()
  const ownVendor = await userClient
    .from('vendor_memberships')
    .select('vendor_id')
    .eq('status', 'active')
    .eq('role', 'owner')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ vendor_id: string }>()

  if (ownVendor.error || !ownVendor.data) {
    return {
      ok: false,
      reason: 'unknown',
      error: ownVendor.error
        ? `[verify] membership lookup failed: ${ownVendor.error.code} ${ownVendor.error.message}`
        : '[verify] only the vendor owner can sign the agreement',
    }
  }
  const vendorId = ownVendor.data.vendor_id

  // Resolve users.id for signed_by — admin client because RLS on users
  // would block this from a Clerk-authed read.
  const admin = createSupabaseAdminClient()
  const userLookup = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single<{ id: string }>()

  if (userLookup.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[verify] user lookup failed: ${userLookup.error.code} ${userLookup.error.message}`,
    }
  }

  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    null
  const userAgent = headerStore.get('user-agent') || null

  const agreementHash = createHash('sha256')
    .update(`${VENDOR_AGREEMENT_VERSION}\n${getVendorAgreement()}`)
    .digest('hex')

  const insertPayload: Record<string, unknown> = {
    vendor_id: vendorId,
    agreement_version: VENDOR_AGREEMENT_VERSION,
    agreement_text_hash: agreementHash,
    signed_by: userLookup.data.id,
    signed_full_name: typedName,
    signed_ip: ip,
    signed_user_agent: userAgent,
    signed_business_details: businessDetails,
  }

  let insert = await admin.from('vendor_agreements').insert(insertPayload)

  // PGRST204 ("column not in schema cache") fires when the
  // signed_business_details column hasn't been migrated yet (or PostgREST's
  // schema cache is stale). Retry without the extra column so signing isn't
  // blocked, and log a warning the operator can act on.
  if (insert.error && insert.error.code === 'PGRST204') {
    console.warn(
      `[verify] vendor_agreements.signed_business_details not in schema cache — apply migration 20260504000003 or run NOTIFY pgrst, 'reload schema'. Falling back without business details snapshot.`,
    )
    delete insertPayload.signed_business_details
    insert = await admin.from('vendor_agreements').insert(insertPayload)
  }

  if (insert.error) {
    // 23505 = unique constraint violation. The vendor already signed this
    // version — treat as success, the signature already exists.
    if (insert.error.code === '23505') {
      // Still upload the drawn signature if the row already existed but no
      // signature image was on file (e.g. retry after a network hiccup).
      if (signaturePngBuffer) {
        await uploadSignatureImage(admin, vendorId, signaturePngBuffer)
      }
      revalidatePath('/verify')
      revalidatePath('/pending')
      return { ok: true }
    }
    return {
      ok: false,
      reason: 'unknown',
      error: `[verify] agreement insert failed: ${insert.error.code} ${insert.error.message}`,
    }
  }

  // Drawing is optional — only upload when the vendor actually drew. We
  // upload AFTER the row insert succeeds so we never leave an orphan PNG
  // pointing at no signature record.
  if (signaturePngBuffer) {
    await uploadSignatureImage(admin, vendorId, signaturePngBuffer)
  }

  await maybeTransitionToAdminReview(vendorId)

  revalidatePath('/verify')
  revalidatePath('/pending')
  return { ok: true }
}

/**
 * Persist the drawn signature PNG to the vendor_verification storage bucket.
 *
 * Path convention is deterministic — `{vendor_id}/signature/{version}.png` —
 * so the read side can locate the image from the agreement row alone, with
 * no extra DB column needed. Re-signing the same version overwrites; older
 * versions stay alongside as audit history.
 *
 * Failures are logged but non-fatal: the agreement row is the legally
 * binding artifact (typed name + IP + UA + body hash), and a missing PNG
 * shouldn't block the verification gate.
 */
async function uploadSignatureImage(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  vendorId: string,
  png: Buffer,
): Promise<void> {
  const path = `${vendorId}/signature/${VENDOR_AGREEMENT_VERSION}.png`
  const { error } = await admin.storage
    .from('vendor_verification')
    .upload(path, png, {
      contentType: 'image/png',
      upsert: true,
    })
  if (error) {
    console.warn(
      `[verify] signature image upload failed (path=${path}): ${error.message}`,
    )
  }
}

