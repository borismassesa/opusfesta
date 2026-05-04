import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VendorDetailPage from '@/components/vendors/VendorDetailPage'
import { getVendor } from '@/lib/vendors'
import { getVendorFromDb } from '@/lib/vendors-db'

// Read the vendor from Supabase on every request so storefront edits made in
// the vendors_portal show up immediately. Falls back to the hardcoded seed
// list (apps/opus_website/src/lib/vendors.ts) for slugs not yet in the DB —
// keeps the legacy demo vendors live during the migration.
export const dynamic = 'force-dynamic'

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
