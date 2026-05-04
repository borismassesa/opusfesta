import { Suspense } from 'react'
import type { Metadata } from 'next'
import VendorsBrowsePage from '@/components/vendors/VendorsBrowsePage'
import PageTransition from '@/components/ui/PageTransition'
import { loadVendorsFromSupabase } from '@/lib/cms/vendors'

// Browse needs the live vendor list (curated `website_vendors` rows + any
// marketplace vendors approved through admin review). Force-dynamic so a
// vendor approved 30 seconds ago shows up on the next page load instead of
// at the next deploy.
export const dynamic = 'force-dynamic'

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
