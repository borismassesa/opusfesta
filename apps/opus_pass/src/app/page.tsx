import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { PreviewBanner } from '@/components/PreviewBanner'
import { Hero } from '@/components/home/Hero'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import { Stationery } from '@/components/home/Stationery'
import { Promises } from '@/components/home/Promises'
import { Features } from '@/components/home/Features'
import { InfoSection } from '@/components/home/InfoSection'

export const metadata: Metadata = {
  title: 'OpusPass — Your wedding, in one digital pass',
  description:
    'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass. Free to start. Built for couples in Tanzania.',
  openGraph: {
    title: 'OpusPass — Your wedding, in one digital pass',
    description:
      'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass.',
    images: [{ url: '/assets/images/churchcouples.jpg', width: 1200, height: 630, alt: 'OpusPass — Wedding Invitations in Tanzania' }],
    type: 'website',
  },
}

export default async function HomePage() {
  const { isEnabled: isDraft } = await draftMode()
  return (
    <>
      {isDraft && <PreviewBanner />}
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stationery />
        <Promises />
        <InvitationShowcase />
        <InfoSection />
      </main>
      <Footer />
    </>
  )
}
