import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { PreviewBanner } from '@/components/PreviewBanner'
import { Hero } from '@/components/home/Hero'
import { Manifesto } from '@/components/home/Manifesto'
import { Showcase } from '@/components/home/Showcase'
import { WhyOpusPass } from '@/components/home/WhyOpusPass'
import { InvitationShowcase } from '@/components/home/InvitationShowcase'
import { Promises } from '@/components/home/Promises'
import { Features } from '@/components/home/Features'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://opuspass.opusfesta.com'
const OPUS_PASS_LOGO = `${BASE}/assets/logo/OpusPass%20Logo.svg`

// CMS-driven page: ISR safety net so published changes appear on the public
// site within ~60s even if the admin's on-demand revalidation doesn't reach
// this deployment. See apps/opus_admin/src/lib/revalidate.ts.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'OpusPass — Your wedding, in one digital pass',
  description:
    'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass. Free to start. Built for couples in Tanzania.',
  openGraph: {
    title: 'OpusPass — Your wedding, in one digital pass',
    description:
      'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass.',
    // Absolute URL so link scrapers resolve the OG image against the subdomain.
    images: [{ url: OPUS_PASS_LOGO, alt: 'OpusPass' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [OPUS_PASS_LOGO],
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
        <Showcase />
        <WhyOpusPass />
        <Features />
        <InvitationShowcase />
        <div className="bg-[#FAF6EF]">
          <Manifesto />
          <Promises />
        </div>
      </main>
      <Footer />
    </>
  )
}
