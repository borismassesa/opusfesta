'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { InvitationsHeroContent } from '@/lib/cms/invitations-hero'

// Branded placeholder shown on the server and the first client render, before
// the client-only animated hero mounts. It uses the default copy (a client
// component can't import the loader's FALLBACK — that pulls in next/headers —
// and next/dynamic's `loading` can't receive props). The real, CMS-driven
// headline + buttons render inside the animated hero once it mounts.
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

// The morph hero is a heavy, purely-decorative animation. Code-split it so its
// chunk loads lazily; `ssr: false` is intentionally NOT used here — in the App
// Router it makes the server emit a <Suspense> boundary that the client's first
// hydration pass doesn't match (a "<Suspense> vs <div>" hydration error). The
// `mounted` gate below is what keeps it client-only instead.
const ScrollMorphHero = dynamic(() => import('@/components/ui/scroll-morph-hero'), {
  loading: () => <HeroPlaceholder />,
})

export default function ScrollMorphHeroClient({ hero }: { hero: InvitationsHeroContent }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Server render and the first client render both produce the placeholder, so
  // hydration matches exactly. The animated hero mounts client-only afterwards.
  if (!mounted) return <HeroPlaceholder />
  return <ScrollMorphHero hero={hero} />
}
