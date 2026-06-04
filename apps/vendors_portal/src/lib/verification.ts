import { randomUUID } from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { VENDOR_AGREEMENT_VERSION } from '@/lib/onboarding/vendor-agreement'

// Server-only helpers shared by the authenticated desktop upload action and
// the token-scoped phone-capture action. Both store an identity photo for a
// vendor and re-evaluate whether the application can enter admin review. Not
// 'use server' — plain async functions called by the action files; never
// imported by client components.

export type CaptureKind = 'front' | 'back' | 'selfie'

const DOC_TYPE: Record<CaptureKind, string> = {
  front: 'national_id_front',
  back: 'national_id_back',
  selfie: 'selfie_liveness',
}

const MAX_BYTES = 15 * 1024 * 1024

export type StoreResult = { ok: true } | { ok: false; error: string }

function parseImageDataUrl(
  dataUrl: string,
): { buffer: Buffer; mime: string; ext: string } | null {
  const m = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(dataUrl)
  if (!m) return null
  const mime = m[1]
  const ext = m[2] === 'jpeg' ? 'jpg' : m[2]
  return { buffer: Buffer.from(m[3], 'base64'), mime, ext }
}

/**
 * Store one identity capture (National ID front/back or liveness selfie),
 * supplied as a JPEG/PNG data URL: upload to the `vendor_verification` bucket,
 * supersede any prior latest doc of that type, insert a fresh `pending_review`
 * row, then re-check whether the vendor can move to admin review.
 */
export async function storeVerificationShot(
  vendorId: string,
  kind: CaptureKind,
  dataUrl: string,
): Promise<StoreResult> {
  const parsed = parseImageDataUrl(dataUrl)
  if (!parsed) return { ok: false, error: 'Photo must be a JPEG or PNG image.' }
  if (parsed.buffer.length === 0) {
    return { ok: false, error: 'Photo is empty — please retake it.' }
  }
  if (parsed.buffer.length > MAX_BYTES) {
    return { ok: false, error: 'Photo is too large — please retake it.' }
  }

  const docType = DOC_TYPE[kind]
  const admin = createSupabaseAdminClient()
  const storagePath = `${vendorId}/${docType}/${randomUUID()}.${parsed.ext}`

  const up = await admin.storage
    .from('vendor_verification')
    .upload(storagePath, parsed.buffer, {
      contentType: parsed.mime,
      upsert: false,
    })
  if (up.error) {
    // Log the raw cause server-side; return a clean, user-safe message (this
    // can surface on the unauthenticated phone-capture screen).
    console.warn(`[verify] capture upload failed (${docType}): ${up.error.message}`)
    return { ok: false, error: 'Could not save that photo. Please retake it.' }
  }

  // Supersede prior latest doc of this type. Capture the result — a silent
  // failure here would leave two is_latest=true rows (esp. on retake), which
  // skews the progress gate. Log if it fails (the insert below still wins).
  const supersede = await admin
    .from('vendor_verification_documents')
    .update({ is_latest: false })
    .eq('vendor_id', vendorId)
    .eq('doc_type', docType)
    .eq('is_latest', true)
  if (supersede.error) {
    console.warn(
      `[verify] is_latest supersede failed for vendor ${vendorId} (${docType}): ${supersede.error.message}`,
    )
  }

  const ins = await admin.from('vendor_verification_documents').insert({
    vendor_id: vendorId,
    doc_type: docType,
    storage_path: storagePath,
    original_filename: `${kind}.${parsed.ext}`,
    mime_type: parsed.mime,
    size_bytes: parsed.buffer.length,
    status: 'pending_review',
    is_latest: true,
  })
  if (ins.error) {
    await admin.storage.from('vendor_verification').remove([storagePath])
    console.warn(
      `[verify] capture row insert failed for vendor ${vendorId} (${docType}): ${ins.error.code} ${ins.error.message}`,
    )
    return { ok: false, error: 'Could not save that photo. Please retake it.' }
  }

  await maybeTransitionToAdminReview(vendorId)
  return { ok: true }
}

/**
 * Is the vendor still in a state where document uploads are accepted? The
 * authenticated desktop path gates on this via requirePendingVendor; the
 * public token path must re-check it too, since a 15-min token can outlive the
 * state it was minted for (admin may approve/suspend mid-window).
 */
export async function isVendorUploadEligible(vendorId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient()
  const v = await admin
    .from('vendors')
    .select('onboarding_status')
    .eq('id', vendorId)
    .maybeSingle<{ onboarding_status: string }>()
  const s = v.data?.onboarding_status
  return s === 'verification_pending' || s === 'needs_corrections'
}

/** Which captures are done (latest, not-rejected): ID front, back, selfie. */
export async function getVerificationCaptureProgress(
  vendorId: string,
): Promise<{ front: boolean; back: boolean; selfie: boolean }> {
  const admin = createSupabaseAdminClient()
  const docs = await admin
    .from('vendor_verification_documents')
    .select('doc_type, status')
    .eq('vendor_id', vendorId)
    .eq('is_latest', true)
    .in('doc_type', ['national_id_front', 'national_id_back', 'selfie_liveness'])
    .returns<Array<{ doc_type: string; status: string }>>()
  if (docs.error) {
    console.warn(
      `[verify] capture-progress query failed for ${vendorId}: ${docs.error.message}`,
    )
  }
  const present = new Set(
    (docs.data ?? [])
      .filter((d) => d.status !== 'rejected')
      .map((d) => d.doc_type),
  )
  return {
    front: present.has('national_id_front'),
    back: present.has('national_id_back'),
    selfie: present.has('selfie_liveness'),
  }
}

/**
 * Auto-flip `verification_pending` / `needs_corrections` to `admin_review`
 * once the required artifacts are in place. Rule: National ID front + back +
 * a liveness selfie are REQUIRED; TIN certificate and business license are
 * optional. A payout method and a current-version signed agreement are still
 * required.
 */
export async function maybeTransitionToAdminReview(
  vendorId: string,
): Promise<void> {
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

  const present = new Set(
    docs.data
      .filter((d) => d.status === 'pending_review' || d.status === 'approved')
      .map((d) => d.doc_type),
  )
  const hasIdentity =
    present.has('national_id_front') &&
    present.has('national_id_back') &&
    present.has('selfie_liveness')
  if (!hasIdentity) return

  const [payouts, agreements] = await Promise.all([
    admin
      .from('vendor_payout_methods')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId),
    admin
      .from('vendor_agreements')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('agreement_version', VENDOR_AGREEMENT_VERSION),
  ])

  if (payouts.error || agreements.error) {
    console.warn(
      `[verify] auto-transition: payout/agreement check failed for ${vendorId}: ${payouts.error?.message ?? ''} ${agreements.error?.message ?? ''}`,
    )
    return
  }
  if ((payouts.count ?? 0) === 0 || (agreements.count ?? 0) === 0) return

  const transition = await admin
    .from('vendors')
    .update({
      onboarding_status: 'admin_review',
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .in('onboarding_status', ['verification_pending', 'needs_corrections'])
  if (transition.error) {
    // A completing capture left the vendor stuck in verification — surface it
    // so it's debuggable instead of silently failing to advance.
    console.warn(
      `[verify] auto-transition to admin_review failed for ${vendorId}: ${transition.error.code} ${transition.error.message}`,
    )
  }
}
