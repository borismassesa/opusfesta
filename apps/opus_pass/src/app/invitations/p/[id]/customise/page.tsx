import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadInvitationProduct } from '@/lib/cms/invitations-products'
import CustomiseClient from './CustomiseClient'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params
  const product = await loadInvitationProduct(id)
  if (!product) return { title: 'Product not found | OpusFesta' }
  return {
    title: `Customise ${product.name} | OpusFesta`,
    description: `Personalise ${product.name} — add your names, date, venue, colours and message, then send it to every guest by WhatsApp or SMS.`,
  }
}

export default async function CustomiseProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const product = await loadInvitationProduct(id)
  if (!product) return notFound()
  return <CustomiseClient product={product} />
}
