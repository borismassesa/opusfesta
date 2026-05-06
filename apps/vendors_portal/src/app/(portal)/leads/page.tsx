import type { InquiryRow } from '@/lib/mock-data'
import { recentInquiries } from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import type { VendorPricingPackage } from '@/lib/vendors'
import { getCurrentVendor } from '@/lib/vendor'
import LeadsClient, { type LeadsSource } from './LeadsClient'

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop'

type DbInquiryStatus =
  | 'pending'
  | 'responded'
  | 'accepted'
  | 'declined'
  | 'closed'

const STATUS_TO_UI: Record<DbInquiryStatus, InquiryRow['status']> = {
  pending: 'new',
  responded: 'replied',
  accepted: 'booked',
  declined: 'declined',
  closed: 'closed',
}

type InquiryRowFromDb = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  event_date: string | null
  budget: string | null
  location: string | null
  message: string | null
  guest_count: number | null
  status: DbInquiryStatus | null
}

type VendorPricingRow = {
  pricing_details: VendorPricingPackage[] | null
}

type VendorPackagesRow = {
  packages: unknown
}

function formatEventDate(date: string | null): string {
  if (!date) return 'Date TBC'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) {
    console.warn('[leads] invalid event_date in DB:', date)
    return 'Date TBC'
  }
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapStatus(status: DbInquiryStatus | null): InquiryRow['status'] {
  if (!status) return 'new'
  const mapped = STATUS_TO_UI[status]
  if (!mapped) {
    console.warn('[leads] unmapped inquiry_status:', status)
    return 'new'
  }
  return mapped
}

function mapRow(row: InquiryRowFromDb): InquiryRow {
  return {
    id: row.id,
    couple: row.name ?? 'Anonymous lead',
    date: formatEventDate(row.event_date),
    eventDateIso: row.event_date ?? undefined,
    budget: row.budget ?? '—',
    location: row.location ?? '—',
    status: mapStatus(row.status),
    avatarUrl: PLACEHOLDER_AVATAR,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    message: row.message ?? undefined,
    guestCount: row.guest_count ?? undefined,
  }
}

async function loadInquiries(): Promise<{
  inquiries: InquiryRow[]
  source: LeadsSource
  vendorName: string
  packages: VendorPricingPackage[]
}> {
  const state = await getCurrentVendor()
  if (state.kind === 'no-env') {
    return {
      inquiries: recentInquiries,
      source: { kind: 'no-env' },
      vendorName: 'Your Business',
      packages: [],
    }
  }
  if (state.kind === 'no-application') {
    return { inquiries: [], source: { kind: 'no-application' }, vendorName: '', packages: [] }
  }
  if (state.kind === 'pending-approval') {
    return {
      inquiries: [],
      source: { kind: 'pending-approval' },
      vendorName: state.vendorName,
      packages: [],
    }
  }
  if (state.kind === 'suspended') {
    return { inquiries: [], source: { kind: 'suspended' }, vendorName: state.vendorName, packages: [] }
  }

  const supabase = await createClerkSupabaseServerClient()
  const inquiries = await supabase
    .from('inquiries')
    .select('id, name, email, phone, event_date, budget, location, message, guest_count, status')
    .eq('vendor_id', state.vendor.id)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<InquiryRowFromDb[]>()

  if (inquiries.error) {
    throw new Error(
      `[leads] inquiries query failed: ${inquiries.error.code} ${inquiries.error.message}`,
    )
  }

  const [websiteVendorRow, storefrontRow] = await Promise.all([
    supabase
      .from('website_vendors')
      .select('pricing_details')
      .eq('id', state.vendor.id)
      .maybeSingle<VendorPricingRow>(),
    supabase
      .from('vendors')
      .select('packages')
      .eq('id', state.vendor.id)
      .maybeSingle<VendorPackagesRow>(),
  ])

  const pricingDetails: VendorPricingPackage[] =
    websiteVendorRow.data?.pricing_details ?? []

  const storefrontPackages: VendorPricingPackage[] = Array.isArray(
    storefrontRow.data?.packages,
  )
    ? (storefrontRow.data.packages as Array<Record<string, unknown>>)
        .filter(
          (e): e is Record<string, unknown> =>
            Boolean(e) && typeof e === 'object' && typeof e.name === 'string' && e.name !== '',
        )
        .map((e) => ({
          label: e.name as string,
          value: typeof e.price === 'string' ? e.price : '',
        }))
    : []

  // Storefront packages are the canonical source; pricing_details fills any gaps.
  const seen = new Set<string>()
  const packages: VendorPricingPackage[] = []
  for (const pkg of [...storefrontPackages, ...pricingDetails]) {
    const key = pkg.label.trim().toLowerCase()
    if (key && !seen.has(key)) {
      seen.add(key)
      packages.push(pkg)
    }
  }

  return {
    inquiries: (inquiries.data ?? []).map(mapRow),
    source: { kind: 'live' },
    vendorName: state.vendor.businessName,
    packages,
  }
}

export default async function LeadsPage() {
  const { inquiries, source, vendorName, packages } = await loadInquiries()
  return <LeadsClient inquiries={inquiries} source={source} vendorName={vendorName} packages={packages} />
}
