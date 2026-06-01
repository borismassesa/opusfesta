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

export const metadata: Metadata = {
  title: 'OpusPass — Your wedding, in one digital pass',
  description:
    'Digital invitations, live RSVP tracking, and a beautiful wedding website — all in one pass. Free to start. Built for couples in Tanzania.',
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
