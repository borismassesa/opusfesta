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
  const [product, ticketProduct] = await Promise.all([
    loadInvitationProduct(id),
    // Load p23 (QR ticket) to get the admin-configured accent colour options.
    loadInvitationProduct('p23'),
  ])
  if (!product) return notFound()

  const ticketAccentOptions =
    ticketProduct && ticketProduct.palettes.length > 0
      ? ticketProduct.palettes.map((p) => ({ name: p.name ?? p.accent, value: p.accent }))
      : undefined

  return <CustomiseClient product={product} ticketAccentOptions={ticketAccentOptions} />
}
