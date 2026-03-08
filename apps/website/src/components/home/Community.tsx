"use client"

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

export function Community() {
  const { content } = useContent();
  const { community } = content;
  const containerRef = useRef<HTMLElement>(null);
  const vendors = community?.vendors || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const revealTargets = containerRef.current?.querySelectorAll(".community-reveal");
      if (revealTargets) {
        gsap.fromTo(
          revealTargets,
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
            }
          }
        );
      }

      const cards = containerRef.current?.querySelectorAll(".community-vendor-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 65%",
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [vendors.length]);

  return (
    <section
      ref={containerRef}
      className="relative border-b border-border bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,var(--primary)_2%)_0%,var(--background)_100%)] py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-8 border-b border-border/50 pb-10 md:grid-cols-2 md:gap-12">
          <div className="community-reveal text-center md:text-left">
            <div className="mb-5 flex items-center justify-center gap-3 md:justify-start">
              <span className="h-px w-12 bg-accent"></span>
              <span className="font-mono text-xs uppercase tracking-widest text-accent">Vendor Network</span>
              <span className="h-px w-12 bg-accent md:hidden"></span>
            </div>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {community?.headline || "Meet the people behind"} <br />
              <span className="font-serif font-normal italic text-secondary">
                {community?.subheadline || "beautiful celebrations."}
              </span>
            </h2>
          </div>

          <div className="community-reveal flex flex-col items-center gap-6 md:items-end">
            <p className="max-w-md text-center text-base leading-relaxed text-secondary md:text-right md:text-lg">
              {community?.description || "Browse trusted planners, photographers, florists, and venues in a visual-first directory built for modern couples."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
              <Link
                href={community?.primaryButtonLink || "/vendors"}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary/90"
              >
                {community?.primaryButtonText || "Find Vendors"}
              </Link>
              <Link
                href={community?.secondaryButtonLink || "/vendor-signup"}
                className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                {community?.secondaryButtonText || "Join as a Vendor"}
              </Link>
            </div>
          </div>
        </div>

        {vendors.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {vendors.slice(0, 12).map((vendor) => (
              <article
                key={vendor.id}
                className="community-vendor-card group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/70 bg-surface"
              >
                <Image
                  src={resolveAssetSrc(vendor.avatar)}
                  alt={vendor.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                  <p className="line-clamp-1 text-sm font-semibold tracking-tight">{vendor.name}</p>
                  <p className="line-clamp-1 text-xs uppercase tracking-[0.18em] text-white/70">{vendor.role}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="community-reveal mt-10 rounded-3xl border border-dashed border-border/70 bg-background/60 px-6 py-12 text-center text-secondary">
            Featured vendors will appear here once available.
          </div>
        )}
      </div>
    </section>
  );
}
