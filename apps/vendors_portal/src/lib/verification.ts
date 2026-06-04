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
    return { ok: false, error: `[verify] capture upload failed: ${up.error.message}` }
  }

  await admin
    .from('vendor_verification_documents')
    .update({ is_latest: false })
    .eq('vendor_id', vendorId)
    .eq('doc_type', docType)
    .eq('is_latest', true)

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
    return {
      ok: false,
      error: `[verify] capture row insert failed: ${ins.error.code} ${ins.error.message}`,
    }
  }

  await maybeTransitionToAdminReview(vendorId)
  return { ok: true }
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

  if ((payouts.count ?? 0) === 0 || (agreements.count ?? 0) === 0) return

  await admin
    .from('vendors')
    .update({
      onboarding_status: 'admin_review',
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .in('onboarding_status', ['verification_pending', 'needs_corrections'])
}
