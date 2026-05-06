import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import VendorReviewClient, {
  type VendorReviewProps,
} from './VendorReviewClient'

export const dynamic = 'force-dynamic'

type VendorRow = {
  id: string
  vendor_code: string | null
  slug: string
  business_name: string
  category: string
  bio: string | null
  description: string | null
  location: {
    street?: string | null
    street2?: string | null
    city?: string | null
    region?: string | null
    postalCode?: string | null
    country?: string | null
    homeMarket?: string | null
    serviceMarkets?: string[] | null
  } | null
  contact_info: {
    phone?: string | null
    email?: string | null
    whatsapp?: string | null
  } | null
  social_links: Record<string, string | null> | null
  services_offered: Array<{ id?: string; title?: string; custom?: boolean }> | null
  years_in_business: number | null
  onboarding_status: string
  onboarding_started_at: string | null
  onboarding_completed_at: string | null
  suspended_at: string | null
  suspension_reason: string | null
  created_at: string
  updated_at: string
  // Storefront persistence columns from migration 20260503000003.
  team: Array<Record<string, unknown>> | null
  faqs: Array<Record<string, unknown>> | null
  packages: Array<Record<string, unknown>> | null
  awards: string | null
  hours: Record<string, { open?: boolean; from?: string; to?: string }> | null
  languages: string[] | null
  response_time_hours: string | null
  locally_owned: boolean | null
  parallel_booking_capacity: number | null
  deposit_percent: string | null
  cancellation_level: string | null
  reschedule_policy: string | null
  style: string | null
  personality: string | null
}

type ApplicationSnapshotRow = {
  application_snapshot: Record<string, unknown> | null
}

type PackagesRow = {
  packages:
    | Array<{
        id?: string
        name?: string
        price?: string
        description?: string
      }>
    | null
}

type DocRow = {
  id: string
  doc_type: string
  storage_path: string
  original_filename: string | null
  mime_type: string | null
  size_bytes: number | null
  status: string
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  uploaded_at: string
  is_latest: boolean
}

type PayoutRow = {
  id: string
  method_type: string
  provider: string | null
  account_number: string
  account_holder_name: string
  status: string
  is_default: boolean
  created_at: string
}

type AgreementRow = {
  id: string
  agreement_version: string
  agreement_text_hash: string
  signed_full_name: string
  signed_ip: string | null
  signed_user_agent: string | null
  signed_at: string
}

export default async function VendorReviewPage({
  params,
}: {
  params: Promise<{ vendorId: string }>
}) {
  const { vendorId } = await params

  const admin = createSupabaseAdminClient()

  const [vendorRes, docsRes, payoutRes, agreementRes] = await Promise.all([
    // Core columns guaranteed to exist after migrations 001 + 056. We pull
    // `packages` in a separate best-effort query below so a missing column
    // (migration 021 not yet applied to the project, or stale PostgREST
    // schema cache) doesn't blow up the whole review page.
    admin
      .from('vendors')
      .select(
        `id, vendor_code, slug, business_name, category, bio, description,
         location, contact_info, social_links, services_offered,
         years_in_business, onboarding_status, onboarding_started_at,
         onboarding_completed_at, suspended_at, suspension_reason,
         created_at, updated_at,
         team, faqs, packages, awards, hours, languages, response_time_hours,
         locally_owned, parallel_booking_capacity, deposit_percent,
         cancellation_level, reschedule_policy, style, personality`,
      )
      .eq('id', vendorId)
      .maybeSingle<VendorRow>(),
    admin
      .from('vendor_verification_documents')
      .select(
        `id, doc_type, storage_path, original_filename, mime_type, size_bytes,
         status, rejection_reason, reviewed_by, reviewed_at, uploaded_at,
         is_latest`,
      )
      .eq('vendor_id', vendorId)
      .order('uploaded_at', { ascending: false })
      .returns<DocRow[]>(),
    admin
      .from('vendor_payout_methods')
      .select(
        `id, method_type, provider, account_number, account_holder_name,
         status, is_default, created_at`,
      )
      .eq('vendor_id', vendorId)
      .eq('is_default', true)
      .maybeSingle<PayoutRow>(),
    admin
      .from('vendor_agreements')
      .select(
        `id, agreement_version, agreement_text_hash, signed_full_name,
         signed_ip, signed_user_agent, signed_at`,
      )
      .eq('vendor_id', vendorId)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle<AgreementRow>(),
  ])

  if (vendorRes.error) {
    throw new Error(
      `[admin] vendor query failed: ${vendorRes.error.code} ${vendorRes.error.message}`,
    )
  }
  if (!vendorRes.data) notFound()

  const v = vendorRes.data

  // Best-effort fetch of `packages` (added by migration 021). If the column
  // isn't present on the project (42703) or PostgREST hasn't reloaded its
  // schema cache (PGRST204), we degrade to an empty list rather than fail
  // the whole review page.
  let packages: NonNullable<PackagesRow['packages']> = []
  const packagesRes = await admin
    .from('vendors')
    .select('packages')
    .eq('id', vendorId)
    .maybeSingle<PackagesRow>()

  if (packagesRes.error) {
    if (
      packagesRes.error.code === '42703' ||
      packagesRes.error.code === 'PGRST204'
    ) {
      console.warn(
        `[admin] vendors.packages not available (${packagesRes.error.code}). Apply migration 021 or run NOTIFY pgrst, 'reload schema'. Showing empty packages list.`,
      )
    } else {
      console.warn(
        `[admin] vendors.packages query failed: ${packagesRes.error.code} ${packagesRes.error.message}`,
      )
    }
  } else if (packagesRes.data?.packages) {
    packages = packagesRes.data.packages
  }

  // Best-effort fetch of `application_snapshot` (added by migration
  // 20260502000001). Same degradation pattern as packages — vendors that
  // onboarded *before* this migration won't have a snapshot, and that's fine.
  let applicationSnapshot: Record<string, unknown> | null = null
  const snapshotRes = await admin
    .from('vendors')
    .select('application_snapshot')
    .eq('id', vendorId)
    .maybeSingle<ApplicationSnapshotRow>()

  if (snapshotRes.error) {
    if (
      snapshotRes.error.code === '42703' ||
      snapshotRes.error.code === 'PGRST204'
    ) {
      console.warn(
        `[admin] vendors.application_snapshot not available (${snapshotRes.error.code}). Apply migration 20260502000001 or run NOTIFY pgrst, 'reload schema'.`,
      )
    } else {
      console.warn(
        `[admin] vendors.application_snapshot query failed: ${snapshotRes.error.code} ${snapshotRes.error.message}`,
      )
    }
  } else {
    applicationSnapshot = snapshotRes.data?.application_snapshot ?? null
  }
  const docs = docsRes.data ?? []
  const latestDocs = docs.filter((d) => d.is_latest)
  const docByType = new Map<string, DocRow>()
  for (const d of latestDocs) docByType.set(d.doc_type, d)

  const tin = docByType.get('tin_certificate') ?? null
  const license =
    docByType.get('business_license') ??
    docByType.get('sole_proprietor_declaration') ??
    null

  // Resolve the agreement signature image path by convention. We don't store
  // it on the agreement row — paths follow `{vendor_id}/signature/{version}.png`
  // and the upload uses upsert. If the file doesn't exist (vendor only typed
  // their name, didn't draw), the storage check returns null gracefully.
  let signatureImagePath: string | null = null
  if (agreementRes.data) {
    const candidate = `${vendorId}/signature/${agreementRes.data.agreement_version}.png`
    const { data: existCheck } = await admin.storage
      .from('vendor_verification')
      .list(`${vendorId}/signature`, { limit: 100 })
    if (
      existCheck?.some(
        (f) => f.name === `${agreementRes.data!.agreement_version}.png`,
      )
    ) {
      signatureImagePath = candidate
    }
  }

  const props: VendorReviewProps = {
    vendor: {
      id: v.id,
      vendorCode: v.vendor_code,
      slug: v.slug,
      businessName: v.business_name,
      category: v.category,
      bio: v.bio,
      description: v.description,
      yearsInBusiness: v.years_in_business,
      location: v.location,
      contact: v.contact_info,
      socialLinks: v.social_links,
      services: v.services_offered ?? [],
      packages,
      applicationSnapshot,
      onboardingStatus: v.onboarding_status,
      onboardingStartedAt: v.onboarding_started_at,
      onboardingCompletedAt: v.onboarding_completed_at,
      suspendedAt: v.suspended_at,
      suspensionReason: v.suspension_reason,
      updatedAt: v.updated_at,
      // Editable storefront columns — passed straight through. Editors
      // hydrate their internal state from these on first render.
      teamColumn: v.team ?? [],
      faqsColumn: v.faqs ?? [],
      packagesColumn: v.packages ?? [],
      awardsColumn: v.awards,
      hoursColumn: v.hours,
      languagesColumn: v.languages ?? [],
      responseTimeHoursColumn: v.response_time_hours,
      locallyOwnedColumn: v.locally_owned,
      parallelBookingCapacityColumn: v.parallel_booking_capacity,
      depositPercentColumn: v.deposit_percent,
      cancellationLevelColumn: v.cancellation_level,
      reschedulePolicyColumn: v.reschedule_policy,
      styleColumn: v.style,
      personalityColumn: v.personality,
    },
    tin: tin && {
      id: tin.id,
      docType: tin.doc_type,
      storagePath: tin.storage_path,
      filename: tin.original_filename,
      mimeType: tin.mime_type,
      sizeBytes: tin.size_bytes,
      status: tin.status,
      rejectionReason: tin.rejection_reason,
      reviewedAt: tin.reviewed_at,
      uploadedAt: tin.uploaded_at,
    },
    license: license && {
      id: license.id,
      docType: license.doc_type,
      storagePath: license.storage_path,
      filename: license.original_filename,
      mimeType: license.mime_type,
      sizeBytes: license.size_bytes,
      status: license.status,
      rejectionReason: license.rejection_reason,
      reviewedAt: license.reviewed_at,
      uploadedAt: license.uploaded_at,
    },
    payout: payoutRes.data && {
      id: payoutRes.data.id,
      methodType: payoutRes.data.method_type,
      provider: payoutRes.data.provider,
      accountNumber: payoutRes.data.account_number,
      accountHolderName: payoutRes.data.account_holder_name,
      status: payoutRes.data.status,
    },
    agreement: agreementRes.data && {
      id: agreementRes.data.id,
      version: agreementRes.data.agreement_version,
      textHash: agreementRes.data.agreement_text_hash,
      signedFullName: agreementRes.data.signed_full_name,
      signedIp: agreementRes.data.signed_ip,
      signedUserAgent: agreementRes.data.signed_user_agent,
      signedAt: agreementRes.data.signed_at,
      signatureImagePath,
    },
    historicalDocs: docs
      .filter((d) => !d.is_latest)
      .map((d) => ({
        id: d.id,
        docType: d.doc_type,
        storagePath: d.storage_path,
        filename: d.original_filename,
        status: d.status,
        rejectionReason: d.rejection_reason,
        uploadedAt: d.uploaded_at,
      })),
  }

  return <VendorReviewClient {...props} />
}
