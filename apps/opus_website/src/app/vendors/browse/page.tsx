import { Suspense } from 'react'
import type { Metadata } from 'next'
import VendorsBrowsePage from '@/components/vendors/VendorsBrowsePage'
import PageTransition from '@/components/ui/PageTransition'
import { loadVendorsFromSupabase } from '@/lib/cms/vendors'

// Browse needs the vendor list (curated `website_vendors` rows + marketplace
// vendors approved through admin review). ISR (10-min window) instead of
// force-dynamic: cached on the CDN, so a newly approved vendor appears within
// ~10 minutes instead of every request re-rendering at the origin.
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Browse Wedding Vendors | OpusFesta',
  description:
    'Search and filter verified wedding vendors across Tanzania — venues, photographers, caterers, florists, and more. Find the perfect team for your big day.',
}

export default async function VendorsBrowseRoutePage() {
  const vendors = await loadVendorsFromSupabase()
  return (
    <PageTransition>
      <Suspense>
        <VendorsBrowsePage initialVendors={vendors} />
      </Suspense>
    </PageTransition>
  )
}
