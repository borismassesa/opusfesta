"use client"

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck, Gem, Diamond, Sparkles, ArrowUpRightIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";
import { MotionPreset } from "@/components/ui/motion-preset";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { MatterButton } from "@/components/ui/matter-button";

gsap.registerPlugin(ScrollTrigger);

export function Community() {
  const { content } = useContent();
  const { community } = content;
  const containerRef = useRef<HTMLElement>(null);
  const vendors = community?.vendors || [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".vendor-avatar",
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5,
          stagger: { amount: 2, grid: "auto", from: "random" },
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: containerRef.current, start: "top 70%" }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [vendors]);

  return (
    <section ref={containerRef} className="py-8 sm:py-16 lg:py-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

        {vendors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-1.5 md:gap-2 max-w-360 mx-auto mb-12 md:mb-16 mask-linear-fade">
            {vendors.map((vendor, index) => {
              const avatarSrc = vendor.avatar ? resolveAssetSrc(vendor.avatar) : "";
              const tags = [
                { label: "Top-rated", icon: Gem, color: "text-emerald-500" },
                { label: "Vetted", icon: Diamond, color: "text-sky-500" },
                { label: "Local favorite", icon: Sparkles, color: "text-amber-500" },
                { label: "Highly trusted", icon: Gem, color: "text-violet-500" },
              ];
              const tag = tags[index % tags.length];
              const TagIcon = tag.icon;

              return (
                <HoverCard key={vendor.id} openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="vendor-avatar cursor-pointer transition-transform hover:scale-110 hover:z-20 relative">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-background/50 shadow-sm">
                        {avatarSrc ? <AvatarImage src={avatarSrc} alt={vendor.name} className="object-cover" /> : null}
                        <AvatarFallback className="text-[8px] sm:text-[10px]">{vendor.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0 shadow-2xl border-border/60 bg-background/95 backdrop-blur-sm z-50" sideOffset={12}>
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border border-border">
                          {avatarSrc ? <AvatarImage src={avatarSrc} className="object-cover" /> : null}
                          <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-foreground block">{vendor.name}</span>
                          <span className="text-[11px] font-medium text-accent uppercase tracking-wide">{vendor.role}</span>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[11px] font-medium">
                              <BadgeCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                              Verified
                            </div>
                            {vendor.rating && (
                              <div className="flex items-center gap-1 text-xs text-foreground/70">
                                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                                <span className="text-amber-500">★</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pt-3 pb-4">
                      <p className="text-sm text-foreground/80 italic leading-relaxed">"{vendor.quote}"</p>
                      <div className="mt-3 flex justify-end">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground/70">
                          <TagIcon className={`h-3.5 w-3.5 ${tag.color}`} />
                          {tag.label}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        )}

        <div className="text-center max-w-3xl px-4">
          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="mb-6 flex justify-center">
            <TextShimmer className="text-sm font-medium uppercase" duration={1.75}>
              Our Community
            </TextShimmer>
          </MotionPreset>
          <MotionPreset component="h2" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
            {community?.headline || "Connecting you with"} <br />
            <span className="font-serif italic font-normal text-primary">
              {community?.subheadline || "top-tier professionals."}
            </span>
          </MotionPreset>
          <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.6} className="text-lg text-secondary max-w-2xl mx-auto mb-8 font-light">
            {community?.description || "From award-winning photographers to master florists, browse our curated network of 15,000+ vetted vendors ready to bring your vision to life."}
          </MotionPreset>
          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.9} className="flex flex-col sm:flex-row gap-4 justify-center">
            <MatterButton asChild size="lg">
              <Link href={community?.primaryButtonLink || "/vendors"}>
                {community?.primaryButtonText || "Find Vendors"}
                <ArrowUpRightIcon />
              </Link>
            </MatterButton>
            <Link href={community?.secondaryButtonLink || "/vendor-signup"} className="px-8 py-3 rounded-full border border-border text-foreground text-sm font-medium hover:bg-surface transition-colors">
              {community?.secondaryButtonText || "Join as a Vendor"}
            </Link>
          </MotionPreset>
        </div>

      </div>
    </section>
  );
}
