import type { Metadata } from 'next'
import VendorsIndexPage from '@/components/vendors/VendorsIndexPage'
import PageTransition from '@/components/ui/PageTransition'
import { loadVendorsFromSupabase, loadVendorCategoriesFromSupabase } from '@/lib/cms/vendors'

export const metadata: Metadata = {
  title: 'Find Vendors | OpusFesta',
  description:
    'Discover verified photographers, venues, caterers, and more across Tanzania. Every vendor is reviewed, background-checked, and ready to make your wedding unforgettable.',
}

export default async function VendorsPage() {
  const [vendors, categories] = await Promise.all([
    loadVendorsFromSupabase(),
    loadVendorCategoriesFromSupabase(),
  ])

  return (
    <PageTransition>
      <VendorsIndexPage vendors={vendors} categories={categories} />
    </PageTransition>
  )
}
