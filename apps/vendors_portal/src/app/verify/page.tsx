import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { AGREEMENT_DOCS } from '@/lib/onboarding/vendor-agreement'
import VerifyClient, {
  type AgreementBusinessDefaults,
  type AgreementDocView,
  type VerifyDocSlot,
} from './VerifyClient'
import VerifyStatusScreen from './VerifyStatusScreen'

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
    houseNumber?: string | null
    street?: string | null
    ward?: string | null
    district?: string | null
    city?: string | null // legacy (pre-migration locality)
    region?: string | null
    landmark?: string | null
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
  return [
    loc.houseNumber,
    loc.street,
    loc.ward,
    loc.district ?? loc.city, // district, falling back to legacy city
    loc.region,
    loc.landmark,
    loc.postalCode,
  ]
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(', ')
}

export default async function VerifyPage() {
  const state = await getCurrentVendor()

  // /verify is the single vendor status surface (the old /pending route was
  // retired). Route the states that don't belong on the document hub:
  //   - live                         → dashboard
  //   - not yet applied / mid-apply  → back into the onboarding wizard
  //   - suspended / admin review     → a lightweight status screen here
  if (state.kind === 'live') redirect('/dashboard')
  if (state.kind === 'no-application') redirect('/onboard')
  if (state.kind === 'no-env') redirect('/onboard')
  if (state.kind === 'suspended') {
    return <VerifyStatusScreen variant="suspended" />
  }
  if (state.status === 'application_in_progress') redirect('/onboard')
  // Remaining: `verification_pending`, `needs_corrections`, and `admin_review`.
  // All three render the verification journey below — `admin_review` shows every
  // step done with "Under review" active (a completed, waiting-on-us timeline).

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
      .eq('vendor_id', state.vendorId)
      .eq('is_latest', true)
      .order('uploaded_at', { ascending: false })
      .returns<VendorDocRow[]>(),
    // Pull every signature against the current OF-LGL-AGR-002 family (main
    // contract + Schedule A + Schedule B). Each document is signed
    // independently, so we map the rows back onto the document registry below.
    // Older signatures against retired versions (e.g. the placeholder
    // "v2026-05-vows-v1") stay in the DB as audit history but don't count —
    // they're filtered out by the `.in(...)` on the current version set.
    supabase
      .from('vendor_agreements')
      .select('agreement_version, signed_at')
      .eq('vendor_id', state.vendorId)
      .in(
        'agreement_version',
        AGREEMENT_DOCS.map((d) => d.version),
      )
      .order('signed_at', { ascending: false })
      .returns<VendorAgreementRow[]>(),
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
      required: false,
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
      required: false,
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

  // National ID + liveness selfie progress — the required identity step. A
  // capture counts once its latest doc exists and hasn't been rejected.
  const idCaptured = (docType: string): boolean => {
    const d = docByType.get(docType)
    return !!d && d.status !== 'rejected'
  }
  const nationalId = {
    front: idCaptured('national_id_front'),
    back: idCaptured('national_id_back'),
    selfie: idCaptured('selfie_liveness'),
  }

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

  // Map each document in the registry onto its signature status. A document
  // counts as signed once a row exists for its version; the timeline step is
  // "done" only when all three are signed.
  const signedAtByVersion = new Map<string, string>()
  for (const row of agreementRes.data ?? []) {
    // Rows are ordered signed_at desc, so the first hit per version is latest.
    if (!signedAtByVersion.has(row.agreement_version)) {
      signedAtByVersion.set(row.agreement_version, row.signed_at)
    }
  }
  const agreementDocs: AgreementDocView[] = AGREEMENT_DOCS.map((d) => ({
    id: d.id,
    version: d.version,
    code: d.code,
    title: d.title,
    subtitle: d.subtitle,
    pdfUrl: d.pdfUrl,
    downloadName: d.downloadName,
    fields: d.fields,
    signedAt: signedAtByVersion.get(d.version) ?? null,
  }))

  return (
    <VerifyClient
      status={state.status}
      slots={slots}
      nationalId={nationalId}
      agreementDocs={agreementDocs}
      agreementBusinessDefaults={businessDefaults}
    />
  )
}
