import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VendorDetailPage from '@/components/vendors/VendorDetailPage'
import { getVendor, vendors } from '@/lib/vendors'

export function generateStaticParams() {
  return vendors.map((vendor) => ({ slug: vendor.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const vendor = getVendor(slug)

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
  const vendor = getVendor(slug)

  if (!vendor) {
    notFound()
  }

  return <VendorDetailPage vendor={vendor} />
}
