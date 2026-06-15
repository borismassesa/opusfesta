import { Check } from 'lucide-react'

import { loadHomepageManifestoContent } from '@/lib/cms/homepage-manifesto'
import { assetPath } from '@/lib/asset-path'

export async function Manifesto() {
  const content = await loadHomepageManifestoContent()
  return (
    <section className="px-4 pt-20 pb-10 sm:px-6 sm:pt-28 sm:pb-12 lg:pt-32">
      <p className="mx-auto max-w-4xl text-center text-[1.6rem] font-black leading-[1.3] tracking-tight text-[#1A1A1A] sm:text-4xl sm:leading-[1.3] lg:text-[3.1rem]">
        {/* Brand mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath('/assets/logo/opusfesta-logo-mark.png')}
          alt="OpusFesta"
          className="mr-1 inline-block h-[0.95em] w-[0.95em] -translate-y-[0.05em] align-middle"
        />{' '}
        {content.segment_1}{' '}
        {/* Inline pill chip */}
        <span className="inline-flex -translate-y-[0.1em] items-center gap-1 rounded-full bg-white px-2.5 py-1 align-middle text-[0.42em] font-bold text-[#1A1A1A]/70 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06]">
          {content.pill_label}
          <Check className="h-[1.6em] w-[1.6em] text-[#3f6b1f]" />
        </span>{' '}
        {content.segment_2}{' '}
        <InlineThumb src={content.invite_image_url} />{' '}
        {content.segment_3}{' '}
        <InlineThumb src={content.guest_image_url} />{' '}
        {content.segment_4}{' '}
        <InlineThumb src={content.place_image_url} />{' '}
        {content.segment_5}
      </p>
    </section>
  )
}

// Inline thumbnail rendered between manifesto phrases. Skips rendering entirely
// when the CMS leaves the image empty — passing an empty src makes the browser
// refetch the whole page (and logs a console error).
function InlineThumb({ src }: { src: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath(src)}
      alt=""
      className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] object-cover align-middle shadow-sm ring-1 ring-black/10"
    />
  )
}
