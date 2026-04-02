import Link from 'next/link'
import { MapPin, Star, ShieldCheck, ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import StaggerReveal from '@/components/ui/StaggerReveal'
import VendorCard from '@/components/vendors/VendorCard'
import {
  VENDORS_BASE_PATH,
  type Vendor,
  vendors,
} from '@/lib/vendors'

export default function VendorDetailPage({ vendor }: { vendor: Vendor }) {
  const relatedVendors = vendors
    .filter((candidate) => candidate.slug !== vendor.slug && candidate.categoryId === vendor.categoryId)
    .slice(0, 3)

  return (
    <main className="bg-[#FFFFFF] text-[#1A1A1A]">
      <section className="px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-20 md:pb-18 md:pt-24">
        <div className="mx-auto max-w-[84rem]">
          <Reveal direction="up" className="grid gap-8 xl:grid-cols-[0.44fr_0.56fr] xl:gap-10">
            <div className="max-w-xl">
              <Link
                href={VENDORS_BASE_PATH}
                className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-hover)] transition-colors hover:text-[#1A1A1A]"
              >
                Back to all vendors
              </Link>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                <span>{vendor.category}</span>
                <span>/</span>
                <span>{vendor.priceRange}</span>
                <span>/</span>
                <span>{vendor.city}</span>
              </div>
              <h1 className="mt-5 max-w-[11ch] text-[2.2rem] font-black uppercase leading-[0.92] tracking-tighter sm:text-6xl">
                {vendor.name}
              </h1>
              <p className="mt-5 text-base font-medium leading-relaxed text-gray-600 sm:text-xl">
                {vendor.excerpt}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-gray-200 bg-[#FAF7FB] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Rating</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Star size={16} className="text-[var(--accent)]" fill="currentColor" />
                    <span className="text-lg font-black">{vendor.rating.toFixed(1)}</span>
                    <span className="text-sm font-medium text-gray-500">from {vendor.reviewCount} reviews</span>
                  </div>
                </div>
                <div className="rounded-[22px] border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Location</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
                    <MapPin size={15} className="text-[var(--accent-hover)]" />
                    {vendor.city}
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-[28px] bg-[#111111] p-5 text-white sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <ShieldCheck size={20} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter">Why this vendor stands out</h2>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white/72">
                      Verified profile, clearer pricing context, and a presentation style consistent with the rest of the Opus browse experience.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    vendor.badge ?? 'Verified',
                    vendor.category,
                    vendor.city,
                  ].map((item) => (
                    <span key={item} className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/88">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-gray-100 shadow-[0_22px_60px_rgba(17,17,17,0.08)]">
              <div className="aspect-[4/5] sm:aspect-[16/11]">
                {vendor.heroMedia.type === 'video' ? (
                  <video
                    src={vendor.heroMedia.src}
                    poster={vendor.heroMedia.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.heroMedia.src} alt={vendor.heroMedia.alt} className="h-full w-full object-cover" />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-18 md:pb-22">
        <div className="mx-auto max-w-[84rem]">
          <Reveal direction="up" className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-hover)]">Related vendors</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl">
                More in this category.
              </h2>
            </div>
            <Link href={VENDORS_BASE_PATH} className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">
              View directory
              <ArrowRight size={15} />
            </Link>
          </Reveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
            {relatedVendors.map((relatedVendor) => (
              <VendorCard
                key={relatedVendor.id}
                vendor={relatedVendor}
                compact
                mediaClassName="aspect-[16/10]"
                className="self-start"
              />
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  )
}
