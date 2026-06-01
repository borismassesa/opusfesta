'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

// Branded placeholder shown while the (client-only) animated hero loads — the
// title + buttons in their resting position, so there's never a blank white
// screen. The animated cards fade in around them once the chunk arrives.
function HeroPlaceholder() {
  return (
    <div className="h-[230vh] w-full bg-white">
      <div className="sticky top-0 flex h-screen w-full -translate-y-[4%] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 md:text-4xl">
          Invitations for every celebration.
        </h1>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/invitations/catalog"
            className="inline-flex items-center rounded-full bg-[#1A1A1A] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
          >
            Browse designs
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-7 py-3 text-sm font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]"
          >
            Get started free
          </Link>
        </div>
      </div>
    </div>
  )
}

// The morph hero is a heavy, purely-decorative animation. Rendering it
// client-only (ssr: false) avoids any hydration mismatch; the placeholder above
// keeps the screen branded (not blank) until it mounts.
const ScrollMorphHero = dynamic(() => import('@/components/ui/scroll-morph-hero'), {
  ssr: false,
  loading: () => <HeroPlaceholder />,
})

export default function ScrollMorphHeroClient() {
  return <ScrollMorphHero />
}
