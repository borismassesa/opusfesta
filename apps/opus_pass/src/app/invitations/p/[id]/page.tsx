import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PRODUCTS, findProductById } from '@/data/invitations-products'
import ProductDetailClient from './ProductDetailClient'

type Params = { id: string }

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const product = findProductById(id)
  if (!product) return { title: 'Product not found | OpusFesta' }
  return {
    title: `${product.name} | OpusFesta`,
    description: `${product.name} — ${product.category} by ${product.designer}. Bilingual digital invitation, sent by WhatsApp or SMS.`,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const product = findProductById(id)
  if (!product) return notFound()
  return <ProductDetailClient product={product} />
}
