import { Suspense } from 'react'
import type { Metadata } from 'next'
import VendorsBrowsePage from '@/components/vendors/VendorsBrowsePage'
import PageTransition from '@/components/ui/PageTransition'
import { loadVendorsFromSupabase, loadVendorCategoriesFromSupabase } from '@/lib/cms/vendors'

export const metadata: Metadata = {
  title: 'Browse Wedding Vendors | OpusFesta',
  description:
    'Search and filter verified wedding vendors across Tanzania — venues, photographers, caterers, florists, and more. Find the perfect team for your big day.',
}

export default async function VendorsBrowseRoutePage() {
  const [vendors, categories] = await Promise.all([
    loadVendorsFromSupabase(),
    loadVendorCategoriesFromSupabase(),
  ])

  return (
    <PageTransition>
      <Suspense>
        <VendorsBrowsePage vendors={vendors} categories={categories} />
      </Suspense>
    </PageTransition>
  )
}
