import { redirect } from 'next/navigation'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  getVendorAgreement,
  VENDOR_AGREEMENT_PDF_URL,
  VENDOR_AGREEMENT_VERSION,
} from '@/lib/onboarding/vendor-agreement'
import VerifyClient, { type VerifyDocSlot } from './VerifyClient'

export const dynamic = 'force-dynamic'

type VendorDocRow = {
  doc_type: string
  status: 'pending_review' | 'approved' | 'rejected'
  rejection_reason: string | null
  original_filename: string | null
  uploaded_at: string
}

type VendorAgreementRow = {
  agreement_version: string
  signed_at: string
}

export default async function VerifyPage() {
  const state = await getCurrentVendor()

  // Funnel everyone who shouldn't see the verify hub to /pending. The portal
  // layout would already have caught a `live` user — this guard is for the
  // standalone /verify route which lives outside (portal).
  if (state.kind === 'live') redirect('/dashboard')
  if (state.kind === 'no-application') redirect('/pending')
  if (state.kind === 'suspended') redirect('/pending')
  if (state.kind === 'no-env') redirect('/pending')

  // Only `pending-approval` vendors should be here, and only in the substates
  // where document uploads make sense.
  if (
    state.status !== 'verification_pending' &&
    state.status !== 'needs_corrections'
  ) {
    redirect('/pending')
  }

  const supabase = await createClerkSupabaseServerClient()

  // The "Already on file" panel was removed — the timeline's Application step
  // is enough confirmation, and the bottom panel was bloating the page. So we
  // no longer fetch profile or payout details here; just the docs and the
  // current-version agreement signature.
  const [docsRes, agreementRes] = await Promise.all([
    supabase
      .from('vendor_verification_documents')
      .select(
        'doc_type, status, rejection_reason, original_filename, uploaded_at',
      )
      .eq('is_latest', true)
      .order('uploaded_at', { ascending: false })
      .returns<VendorDocRow[]>(),
    // Only signatures against the *current* agreement version satisfy the
    // verification gate. Old signatures (e.g. the placeholder
    // "v2026-05-vows-v1" written when Vendor Vows acceptance was wrongly
    // recorded as the legal agreement) stay in the DB as audit history but
    // don't count as "signed" — the vendor must e-sign the real Mkataba
    // (OF-LGL-AGR-002) before admin review.
    supabase
      .from('vendor_agreements')
      .select('agreement_version, signed_at')
      .eq('agreement_version', VENDOR_AGREEMENT_VERSION)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle<VendorAgreementRow>(),
  ])

  if (docsRes.error) {
    throw new Error(
      `[verify] documents query failed: ${docsRes.error.code} ${docsRes.error.message}`,
    )
  }

  const docs = docsRes.data ?? []
  const docByType = new Map<string, VendorDocRow>()
  for (const d of docs) docByType.set(d.doc_type, d)

  const tinDoc = docByType.get('tin_certificate')
  const licenseDoc =
    docByType.get('business_license') ??
    docByType.get('sole_proprietor_declaration')

  const slots: VerifyDocSlot[] = [
    {
      docType: 'tin_certificate',
      title: 'TRA TIN certificate',
      description:
        'Your tax ID certificate from the Tanzania Revenue Authority. A clear photo or PDF of the official certificate.',
      required: true,
      currentDoc: tinDoc
        ? {
            status: tinDoc.status,
            filename: tinDoc.original_filename,
            uploadedAt: tinDoc.uploaded_at,
            rejectionReason: tinDoc.rejection_reason,
          }
        : null,
    },
    {
      docType: 'business_license',
      altDocType: 'sole_proprietor_declaration',
      title: 'Business license',
      description:
        'BRELA registration, council license, or — if you trade as yourself — a sole-proprietor declaration. We accept either.',
      required: true,
      currentDoc: licenseDoc
        ? {
            status: licenseDoc.status,
            filename: licenseDoc.original_filename,
            uploadedAt: licenseDoc.uploaded_at,
            rejectionReason: licenseDoc.rejection_reason,
            // The actual doc_type that was uploaded — used to highlight which
            // toggle the vendor chose previously.
            uploadedAs: docByType.has('business_license')
              ? 'business_license'
              : 'sole_proprietor_declaration',
          }
        : null,
    },
  ]

  return (
    <VerifyClient
      status={state.status}
      slots={slots}
      agreementBody={getVendorAgreement()}
      agreementPdfUrl={VENDOR_AGREEMENT_PDF_URL}
      agreementVersion={VENDOR_AGREEMENT_VERSION}
      agreement={
        agreementRes.data
          ? {
              version: agreementRes.data.agreement_version,
              signedAt: agreementRes.data.signed_at,
            }
          : null
      }
    />
  )
}
