import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadInvitationProduct, loadInvitationProducts } from '@/lib/cms/invitations-products'
import { loadMockupCarouselImages } from '@/lib/cms/mockup-carousel'
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
    description: `${product.name} — ${product.category} by ${product.designer}. Bilingual digital invitation, sent by WhatsApp or SMS.`,
  }
}

const SVG_MAX_BYTES = 512 * 1024 // 512 KB — skip prefetch for oversized uploads

async function fetchSvg(url: string | undefined): Promise<string | null> {
  if (!url) return null
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const href = url.startsWith('http') ? url : `${base}${url}`
    const res = await fetch(href, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const contentLength = res.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > SVG_MAX_BYTES) return null
    const text = await res.text()
    if (text.length > SVG_MAX_BYTES) return null
    return text.trimStart().startsWith('<svg') || text.trimStart().startsWith('<?xml') ? text : null
  } catch {
    return null
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const [product, allProducts, mockup, packages] = await Promise.all([
    loadInvitationProduct(id),
    loadInvitationProducts(),
    loadMockupCarouselImages(),
    loadPackagesContent(),
  ])
  if (!product) return notFound()
  const designSvg = await fetchSvg(product.imageUrl)
  return (
    <ProductDetailClient
      product={product}
      allProducts={allProducts}
      mockupImages={mockup.images}
      mockupScenes={mockup.scenes}
      mockupPlacements={mockup.placements}
      designSvg={designSvg}
      packages={packages}
    />
  )
}
