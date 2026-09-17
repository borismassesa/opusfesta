import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicInvite } from '@/lib/dashboard/queries'
import { formatLongDate, eventInvitePath, publicOrigin } from '@/lib/dashboard/share'
import PublicInviteClient from './PublicInviteClient'

// Always reflect the couple's latest details + sharing state.
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getPublicInvite(slug)
  const origin = publicOrigin()

  // Unknown / disabled link: don't index, generic title, no rich preview.
  if (!data) {
    return { title: 'Mwaliko — OpusPass', robots: { index: false, follow: false } }
  }

  const url = `${origin}${eventInvitePath(slug)}`
  const title = `Karibu kwenye harusi ya ${data.coupleName}`
  const description =
    [formatLongDate(data.weddingDate), data.city].filter(Boolean).join(' • ') ||
    'Tap to view the invitation and RSVP'

  // When the couple uploaded an invitation preview image, serve it verbatim:
  // it's the exact picture the WhatsApp template carries as its header, so a
  // guest who is forwarded this link sees the same artwork as a guest who got
  // the template. Setting openGraph.images here overrides the sibling
  // opengraph-image route, which stays the fallback for everyone else.
  const previewImage = data.previewImageUrl
  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      siteName: 'OpusPass',
      title,
      description,
      ...(previewImage ? { images: [{ url: previewImage, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(previewImage ? { images: [previewImage] } : {}),
    },
  }
}

export default async function PublicInvitePage({ params }: PageProps) {
  const { slug } = await params
  const data = await getPublicInvite(slug)
  if (!data) notFound()
  return <PublicInviteClient data={data} />
}
