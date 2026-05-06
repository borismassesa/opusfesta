import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import {
  getVendorAgreement,
  VENDOR_AGREEMENT_PDF_URL,
  VENDOR_AGREEMENT_VERSION,
} from '@/lib/onboarding/vendor-agreement'
import VerifyClient, {
  type AgreementBusinessDefaults,
  type VerifyDocSlot,
} from './VerifyClient'

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

type VendorBusinessRow = {
  business_name: string | null
  category: string | null
  location: {
    street?: string | null
    street2?: string | null
    city?: string | null
    region?: string | null
    postalCode?: string | null
  } | null
  contact_info: {
    phone?: string | null
    email?: string | null
    whatsapp?: string | null
  } | null
}

function buildBusinessAddress(
  loc: VendorBusinessRow['location'],
): string {
  if (!loc) return ''
  return [loc.street, loc.street2, loc.city, loc.region, loc.postalCode]
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(', ')
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
  const clerkUser = await currentUser()

  // The "Already on file" panel was removed — the timeline's Application step
  // is enough confirmation, and the bottom panel was bloating the page. So we
  // no longer fetch profile or payout details here; just the docs, the current
  // agreement signature, and the vendor's business identifiers (used to
  // pre-fill the page-3 block on the Mkataba sign form).
  const [docsRes, agreementRes, vendorRes] = await Promise.all([
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
    supabase
      .from('vendors')
      .select('business_name, category, location, contact_info')
      .eq('id', state.vendorId)
      .maybeSingle<VendorBusinessRow>(),
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

  // Pre-fill the page-3 identification block on the Mkataba sign form with
  // whatever the vendor already entered during onboarding. The vendor can
  // edit any field before signing — TIN is intentionally blank because it's
  // not captured during onboarding (only the certificate file is uploaded).
  const v = vendorRes.data
  const contactPersonFromClerk =
    [clerkUser?.firstName, clerkUser?.lastName]
      .filter((p): p is string => Boolean(p && p.trim()))
      .join(' ')
      .trim() || ''
  const businessDefaults: AgreementBusinessDefaults = {
    businessName: v?.business_name?.trim() ?? '',
    tin: '',
    businessAddress: buildBusinessAddress(v?.location ?? null),
    contactPerson: contactPersonFromClerk,
    email:
      v?.contact_info?.email?.trim() ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      '',
    phone:
      v?.contact_info?.whatsapp?.trim() ||
      v?.contact_info?.phone?.trim() ||
      '',
    serviceType: v?.category ?? '',
  }

  return (
    <VerifyClient
      status={state.status}
      slots={slots}
      agreementBody={getVendorAgreement()}
      agreementPdfUrl={VENDOR_AGREEMENT_PDF_URL}
      agreementVersion={VENDOR_AGREEMENT_VERSION}
      agreementBusinessDefaults={businessDefaults}
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
