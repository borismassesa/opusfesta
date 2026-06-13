import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadInvitationProduct, loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadPackagesContent } from '@/lib/cms/packages'
import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const product = await loadInvitationProduct(id)
  if (!product) return { title: 'Product not found | OpusFesta' }
  return {
    title: `${product.name} | OpusFesta`,
    description: `${product.name} — ${product.category}. Bilingual digital invitation, sent by WhatsApp or SMS.`,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const [product, allProducts, packages] = await Promise.all([
    loadInvitationProduct(id),
    loadInvitationProducts(),
    loadPackagesContent(),
  ])
  if (!product) return notFound()
  return (
    <ProductDetailClient
      product={product}
      allProducts={allProducts}
      packages={packages}
    />
  )
}
