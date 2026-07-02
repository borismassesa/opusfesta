'use server'

import { createHash, randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  type AgreementDocId,
  getAgreementBody,
  getAgreementDoc,
} from '@/lib/onboarding/vendor-agreement'
import { createCaptureToken } from '@/lib/capture-token'
import {
  getVerificationCaptureProgress,
  maybeTransitionToAdminReview,
  storeVerificationShot,
  type CaptureKind,
} from '@/lib/verification'

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

const MAX_BYTES = 25 * 1024 * 1024 // 25MB — matches the storage bucket limit

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
      error: 'File is over 25MB. Compress or trim before uploading.',
    }
  }

  let state
  try {
    state = await getCurrentVendor()
  } catch (err) {
    console.error('[verify] uploadVerificationDocument: getCurrentVendor threw', err)
    return {
      ok: false,
      reason: 'invalid',
      error: 'Something went wrong loading your vendor record. Please refresh and try again.',
    }
  }
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

  // Use the vendor id getCurrentVendor already resolved for THIS caller (it
  // filters vendor_memberships by the authenticated user's id via the admin
  // client). Never re-resolve through an RLS-only membership query: when the
  // Clerk 'supabase' JWT template is absent, createClerkSupabaseServerClient
  // falls back to the service-role client, and an unfiltered query returns the
  // globally-oldest active vendor — writing this vendor's documents onto
  // someone else's record.
  const vendorId = state.vendorId

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
  return { ok: true }
}

function isValidDocType(s: string): s is VerifyDocType {
  return (
    s === 'tin_certificate' ||
    s === 'business_license' ||
    s === 'sole_proprietor_declaration'
  )
}

// The `admin_review` auto-transition now lives in @/lib/verification (shared
// with the phone-capture path) and requires National ID front+back rather than
// TIN + license. Imported above as `maybeTransitionToAdminReview`.

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
 * Capture the vendor's e-signature on one document of the OpusFesta
 * OF-LGL-AGR-002 agreement family — the main contract, Schedule A
 * (Masharti ya Kibiashara), or Schedule B (Viwango na Ulinzi). The document
 * is selected by the `documentId` form field; each is signed independently
 * and persisted as its own `vendor_agreements` row.
 *
 * The signature event records:
 *   - the document's version + SHA-256 of that document's body at sign time
 *     (so the audit trail can prove what was agreed to even if the source
 *     copy is updated later)
 *   - the typed full name as the signature
 *   - the SEHEMU B identification block the vendor filled in (full 7-field
 *     business table for the main contract; the lighter business-name /
 *     position / NIDA block for the schedules)
 *   - the IP + user-agent for non-repudiation
 *
 * Re-running with the same `(vendor_id, agreement_version)` is a no-op due
 * to the unique constraint, so re-submits don't create duplicate rows.
 *
 * Triggers the auto-transition to `admin_review` once every document in the
 * family is signed and the other verification artifacts are in place.
 */
export async function signVendorAgreement(formData: FormData): Promise<SignAgreementResult> {
  const documentId = String(formData.get('documentId') ?? 'main') as AgreementDocId
  let doc
  try {
    doc = getAgreementDoc(documentId)
  } catch {
    return {
      ok: false,
      reason: 'invalid',
      error: 'Unknown agreement document.',
    }
  }

  const typedName = String(formData.get('signedName') ?? '').trim()
  const acknowledged = formData.get('acknowledged') === 'true'
  const signatureImage = String(formData.get('signatureImage') ?? '').trim()

  // SEHEMU B identification block, captured at signing time so the audit
  // trail records exactly what the vendor declared on the form — independent
  // of any later edits to the vendors row. The main contract carries the full
  // business table; the schedules carry the lighter block printed on their
  // own signature page.
  const businessDetails: Record<string, string> =
    doc.fields === 'full'
      ? {
          businessName: String(formData.get('businessName') ?? '').trim(),
          tin: String(formData.get('tin') ?? '').trim(),
          businessAddress: String(formData.get('businessAddress') ?? '').trim(),
          contactPerson: String(formData.get('contactPerson') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: String(formData.get('phone') ?? '').trim(),
          serviceType: String(formData.get('serviceType') ?? '').trim(),
        }
      : {
          businessName: String(formData.get('businessName') ?? '').trim(),
          position: String(formData.get('position') ?? '').trim(),
          nida: String(formData.get('nida') ?? '').trim(),
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
  const requiredFields: ReadonlyArray<[string, string]> =
    doc.fields === 'full'
      ? [
          ['businessName', 'Jina la Biashara'],
          ['tin', 'TIN'],
          ['businessAddress', 'Anwani ya Biashara'],
          ['contactPerson', 'Mtu wa Mawasiliano'],
          ['email', 'Barua Pepe'],
          ['phone', 'WhatsApp/Simu'],
          ['serviceType', 'Aina ya Huduma'],
        ]
      : [
          ['businessName', 'Jina la Biashara'],
          ['position', 'Cheo'],
          ['nida', 'Kitambulisho (NIDA)'],
        ]
  for (const [key, swahili] of requiredFields) {
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

  let state
  try {
    state = await getCurrentVendor()
  } catch (err) {
    console.error('[verify] signVendorAgreement: getCurrentVendor threw', err)
    return {
      ok: false,
      reason: 'invalid',
      error: 'Something went wrong loading your vendor record. Please refresh and try again.',
    }
  }
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

  // Sign against the vendor getCurrentVendor resolved for THIS caller — it
  // filters vendor_memberships by the authenticated user's id via the admin
  // client. Never re-resolve through an RLS-only membership query: when the
  // Clerk 'supabase' JWT template is absent, createClerkSupabaseServerClient
  // falls back to the service-role client, and an unfiltered query returns the
  // globally-oldest active vendor. That wrote signatures onto another vendor's
  // record, where the (vendor_id, agreement_version) unique constraint turned
  // every re-submit into a silent no-op — the vendor could never finish
  // signing.
  const vendorId = state.vendorId

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

  // Owner gate, checked explicitly against this vendor + this user (never via
  // RLS scoping alone): only the owner may bind the business to the agreement.
  const membership = await admin
    .from('vendor_memberships')
    .select('role')
    .eq('vendor_id', vendorId)
    .eq('user_id', userLookup.data.id)
    .eq('status', 'active')
    .maybeSingle<{ role: string }>()

  if (membership.error) {
    return {
      ok: false,
      reason: 'unknown',
      error: `[verify] membership lookup failed: ${membership.error.code} ${membership.error.message}`,
    }
  }
  if (membership.data?.role !== 'owner') {
    // Legacy fallback mirroring is_vendor_member(): a vendor row that predates
    // the membership backfill still identifies its owner via vendors.user_id.
    const legacyOwner = await admin
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .eq('user_id', userLookup.data.id)
      .maybeSingle<{ id: string }>()
    if (legacyOwner.error || !legacyOwner.data) {
      return {
        ok: false,
        reason: 'unauth',
        error: 'Only the vendor owner can sign the agreement.',
      }
    }
  }

  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    null
  const userAgent = headerStore.get('user-agent') || null

  const agreementHash = createHash('sha256')
    .update(`${doc.version}\n${getAgreementBody(doc.id)}`)
    .digest('hex')

  const insertPayload: Record<string, unknown> = {
    vendor_id: vendorId,
    agreement_version: doc.version,
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
        await uploadSignatureImage(admin, vendorId, doc.version, signaturePngBuffer)
      }
      revalidatePath('/verify')
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
    await uploadSignatureImage(admin, vendorId, doc.version, signaturePngBuffer)
  }

  await maybeTransitionToAdminReview(vendorId)

  revalidatePath('/verify')
  return { ok: true }
}

/**
 * Persist the drawn signature PNG to the vendor_verification storage bucket.
 *
 * Path convention is deterministic — `{vendor_id}/signature/{version}.png` —
 * so the read side can locate the image from the agreement row alone, with
 * no extra DB column needed. Each document in the family has its own version,
 * so each gets its own signature PNG. Re-signing the same version overwrites;
 * older versions stay alongside as audit history.
 *
 * Failures are logged but non-fatal: the agreement row is the legally
 * binding artifact (typed name + IP + UA + body hash), and a missing PNG
 * shouldn't block the verification gate.
 */
async function uploadSignatureImage(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  vendorId: string,
  version: string,
  png: Buffer,
): Promise<void> {
  const path = `${vendorId}/signature/${version}.png`
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

// =============================================================================
// National ID — camera capture (desktop) + phone-handoff token
// =============================================================================

export type NationalIdResult =
  | { ok: true }
  | {
      ok: false
      error: string
      reason: 'wrong-state' | 'invalid' | 'unknown'
    }

/** Gate National ID actions to the right state + resolve the vendor id. */
async function requirePendingVendor(): Promise<
  | { ok: true; vendorId: string }
  | { ok: false; error: string; reason: 'wrong-state' | 'unknown' }
> {
  let state
  try {
    state = await getCurrentVendor()
  } catch (err) {
    console.error('[verify] requirePendingVendor: getCurrentVendor threw', err)
    return {
      ok: false,
      reason: 'unknown',
      error: 'Something went wrong loading your vendor record. Please refresh and try again.',
    }
  }
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
      error: 'Verification is only open while your application is in review.',
    }
  }
  // Use the vendor id that getCurrentVendor already resolved for THIS caller
  // (it filters vendor_memberships by the authenticated user's id). Never
  // re-resolve via an RLS-only query: createClerkSupabaseServerClient falls
  // back to the service-role client when the Clerk 'supabase' JWT template is
  // absent, which bypasses RLS and would return the globally-oldest active
  // vendor — silently writing one applicant's National ID + selfie onto a
  // different vendor's record.
  return { ok: true, vendorId: state.vendorId }
}

/**
 * Store a camera-captured identity photo (National ID front/back or the
 * liveness selfie) for the signed-in vendor on this device. `dataUrl` is a
 * JPEG/PNG data URL from the camera — no file upload path.
 */
export async function uploadNationalIdShot(
  kind: CaptureKind,
  dataUrl: string,
): Promise<NationalIdResult> {
  if (kind !== 'front' && kind !== 'back' && kind !== 'selfie') {
    return { ok: false, reason: 'invalid', error: 'Invalid capture type.' }
  }
  const guard = await requirePendingVendor()
  if (!guard.ok) return guard
  const res = await storeVerificationShot(guard.vendorId, kind, dataUrl)
  if (!res.ok) return { ok: false, reason: 'unknown', error: res.error }
  revalidatePath('/verify')
  return { ok: true }
}

/**
 * Mint a short-lived token authorizing a phone (not signed in) to capture the
 * National ID for this vendor. The client builds the capture URL
 * `/verify/capture/<token>` and renders it as a QR code.
 */
export async function createNationalIdCaptureToken(): Promise<
  { ok: true; token: string } | { ok: false; error: string }
> {
  const guard = await requirePendingVendor()
  if (!guard.ok) return { ok: false, error: guard.error }
  return { ok: true, token: createCaptureToken(guard.vendorId) }
}

/** Poll target for the desktop: which captures are done so far. */
export async function getNationalIdProgressAction(): Promise<{
  front: boolean
  back: boolean
  selfie: boolean
}> {
  const guard = await requirePendingVendor()
  if (!guard.ok) return { front: false, back: false, selfie: false }
  return getVerificationCaptureProgress(guard.vendorId)
}

