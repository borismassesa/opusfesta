import { Suspense } from 'react'
import type { Metadata } from 'next'
import VendorsBrowsePage from '@/components/vendors/VendorsBrowsePage'
import PageTransition from '@/components/ui/PageTransition'

export const metadata: Metadata = {
  title: 'Browse Wedding Vendors | OpusFesta',
  description:
    'Search and filter verified wedding vendors across Tanzania — venues, photographers, caterers, florists, and more. Find the perfect team for your big day.',
}

export default function VendorsBrowseRoutePage() {
  return (
    <PageTransition>
      <Suspense>
        <VendorsBrowsePage />
      </Suspense>
    </PageTransition>
  )
}
