import { Check } from 'lucide-react'

export function Manifesto() {
  return (
    <section className="px-4 pt-20 pb-10 sm:px-6 sm:pt-28 sm:pb-12 lg:pt-32">
      <p className="mx-auto max-w-4xl text-center text-[1.6rem] font-black leading-[1.3] tracking-tight text-[#1A1A1A] sm:text-4xl sm:leading-[1.3] lg:text-[3.1rem]">
        {/* Brand mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/opusfesta-logo-mark.png"
          alt="OpusFesta"
          className="mr-1 inline-block h-[0.95em] w-[0.95em] -translate-y-[0.05em] align-middle"
        />{' '}
        OpusPass brings your invites,{' '}
        {/* Inline pill chip */}
        <span className="inline-flex -translate-y-[0.1em] items-center gap-1 rounded-full bg-white px-2.5 py-1 align-middle text-[0.42em] font-bold text-[#1A1A1A]/70 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06]">
          RSVP
          <Check className="h-[1.6em] w-[1.6em] text-[#3f6b1f]" />
        </span>{' '}
        guest list and wedding website into one beautifully simple place. Send a{' '}
        {/* Inline thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/invitation-svgs/classic-serif.svg"
          alt=""
          className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] object-cover align-middle shadow-sm ring-1 ring-black/10"
        />{' '}
        design by WhatsApp or SMS, let guests{' '}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/cutesy_couple.jpg"
          alt=""
          className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] object-cover align-middle shadow-sm ring-1 ring-black/10"
        />{' '}
        tap to confirm — designed for couples in{' '}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/flowers_pinky.jpg"
          alt=""
          className="inline-block h-[1.05em] w-[0.85em] -translate-y-[0.08em] rounded-[0.18em] object-cover align-middle shadow-sm ring-1 ring-black/10"
        />{' '}
        Tanzania.
      </p>
    </section>
  )
}
