import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import InquiriesClient from './InquiriesClient'

export const dynamic = 'force-dynamic'

type InquirySummary = {
  id: string
  vendor_id: string | null
  vendor_name: string | null
  vendor_slug: string | null
  vendor_page_slug: string | null
  status: 'pending' | 'responded' | 'accepted' | 'declined' | 'closed' | null
  created_at: string
  event_date: string | null
  location: string | null
  guest_count: number | null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function resolvePageSlug(
  vendorSlug: string | null,
  vendorId: string | null,
  slugByVendorId: Map<string, string>,
): string | null {
  if (vendorSlug && !UUID_RE.test(vendorSlug)) return vendorSlug
  if (vendorId) return slugByVendorId.get(vendorId) ?? null
  return null
}

export default async function InquiriesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser().catch(() => null)
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null

  let initialInquiries: InquirySummary[] | null = null

  if (email) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, vendor_id, vendor_name, vendor_slug, status, created_at, event_date, location, guest_count')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(30)
    if (error) console.error('[inquiries-page] fetch failed', error.code)

    const rawInquiries = (data ?? []) as Array<Omit<InquirySummary, 'vendor_page_slug'> & { vendor_page_slug?: string | null }>

    const vendorIds = Array.from(
      new Set(
        rawInquiries
          .map((inq) => inq.vendor_id)
          .filter((id): id is string => Boolean(id)),
      ),
    )

    const slugByVendorId = new Map<string, string>()
    if (vendorIds.length > 0) {
      const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('id, slug')
        .in('id', vendorIds)

      if (vendorError) {
        console.error('[inquiries-page] vendor slug lookup failed', vendorError.code)
      } else {
        for (const vendor of vendors ?? []) {
          if (vendor?.id && vendor?.slug) {
            slugByVendorId.set(vendor.id, vendor.slug)
          }
        }
      }
    }

    initialInquiries = rawInquiries.map((inq) => ({
      ...inq,
      vendor_page_slug: resolvePageSlug(inq.vendor_slug, inq.vendor_id, slugByVendorId),
    }))
  }

  return (
    <InquiriesClient
      initialEmail={email}
      initialInquiries={initialInquiries}
    />
  )
}
