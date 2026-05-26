import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VendorDetailPage from '@/components/vendors/VendorDetailPage'
import { getVendor } from '@/lib/vendors'
import { getVendorFromDb } from '@/lib/vendors-db'

// Read the vendor from Supabase, falling back to the hardcoded seed list
// (apps/opus_website/src/lib/vendors.ts) for slugs not yet in the DB. ISR
// (10-min window) instead of force-dynamic: storefront edits from the
// vendors_portal surface within ~10 minutes instead of re-rendering on every
// request. (Follow-up: have the portal POST /api/revalidate for instant updates.)
export const revalidate = 600

async function loadVendor(slug: string) {
  const fromDb = await getVendorFromDb(slug)
  if (fromDb) return fromDb
  return getVendor(slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const vendor = await loadVendor(slug)

  if (!vendor) {
    return { title: 'Vendor Not Found | OpusFesta' }
  }

  return {
    title: `${vendor.name} | OpusFesta Vendors`,
    description: vendor.excerpt,
  }
}

export default async function VendorSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const vendor = await loadVendor(slug)

  if (!vendor) {
    notFound()
  }

  return <VendorDetailPage vendor={vendor} />
}
