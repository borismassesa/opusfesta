import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'

export function WhyOpusPass() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Headline */}
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-black leading-[1.1] tracking-tight text-[#1A1A1A] sm:text-4xl lg:text-5xl">
          The #1 reason couples choose OpusPass is to plan their whole wedding in one place
        </h2>

        {/* Two columns: image left, copy right, gap between */}
        <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-2 lg:gap-20">
          {/* Left: photo card with floating overlays (left-aligned) */}
          <div className="relative mx-auto w-full max-w-[380px] lg:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06]">
              <Image
                src="/assets/images/cutesy_couple.jpg"
                alt="A couple planning their wedding"
                fill
                sizes="(min-width: 1024px) 24rem, 90vw"
                className="object-cover"
              />
            </div>

            {/* Floating product chip — straddling the top-left edge */}
            <div className="absolute -left-5 top-12 flex items-center gap-2.5 rounded-2xl bg-white px-2.5 py-2 shadow-[0_14px_35px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.05]">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="/assets/images/flowers_pinky.jpg"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="pr-1 leading-tight">
                <span className="block text-sm font-extrabold text-[#1A1A1A]">Save the Date</span>
                <span className="block text-xs text-[#1A1A1A]/55">Wedding invite</span>
              </span>
            </div>

            {/* Floating CTA pill — straddling the bottom edge */}
            <Link
              href="/sign-up"
              className="absolute -bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-extrabold text-[var(--on-accent)] shadow-[0_16px_35px_-10px_rgba(0,0,0,0.4)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              <Tag className="h-4 w-4" />
              Get started
            </Link>
          </div>

          {/* Right: copy + buttons */}
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A] sm:text-3xl">
              Planning that actually feels effortless
            </h3>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#1A1A1A]/70 sm:text-lg lg:mx-0">
              Couples tell us everything just flows — invitations, live RSVPs, your guest list and a
              free wedding website all talk to each other, so nothing slips through the cracks. Spend
              less time on admin, and more time celebrating.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/guests-and-rsvp"
                className="inline-flex items-center rounded-full bg-[#1A1A1A] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                How it works
              </Link>
              <Link
                href="/invitations"
                className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-7 py-3.5 text-sm font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]"
              >
                Browse designs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
