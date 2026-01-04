"use client"

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

export function Community() {
  const { content } = useContent();
  const { community } = content;
  const containerRef = useRef<HTMLElement>(null);
  
  // Use CMS vendors if available, otherwise show empty state
  const vendors = community?.vendors || [];
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple fade in for the container
       gsap.fromTo(".vendor-avatar", 
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: {
            amount: 2, // slightly longer stagger for more items
            grid: "auto",
            from: "random" // random appearance for organic feel
          },
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );
      
      gsap.fromTo(".community-text",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.5,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, [vendors]);

  return (
    <section ref={containerRef} className="py-12 md:py-24 bg-background overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col items-center">
        
        {/* Vendor Grid - Dense and centered */}
        {vendors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-1.5 md:gap-2 max-w-360 mx-auto mb-12 md:mb-16 mask-linear-fade">
            {vendors.map((vendor) => {
              const avatarSrc = vendor.avatar ? resolveAssetSrc(vendor.avatar) : "";
              
              return (
                <HoverCard key={vendor.id} openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="vendor-avatar cursor-pointer transition-transform hover:scale-125 hover:z-20 relative">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-background/50 shadow-sm">
                        {avatarSrc ? (
                          <AvatarImage
                            src={avatarSrc}
                            alt={vendor.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="text-[8px] sm:text-[10px]">{vendor.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-4 shadow-xl border-border/60 bg-surface/95 backdrop-blur-sm z-50" sideOffset={5}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border">
                          {avatarSrc ? (
                            <AvatarImage src={avatarSrc} className="object-cover" />
                          ) : null}
                          <AvatarFallback>{vendor.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary">{vendor.name}</span>
                          <span className="text-xs font-medium text-accent uppercase tracking-wide">{vendor.role}</span>
                        </div>
                      </div>
                      <p className="text-sm text-primary/80 italic leading-relaxed">
                        "{vendor.quote}"
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-secondary">
                          <BadgeCheck className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                          Verified Pro
                        </div>
                        {vendor.rating && (
                          <div className="flex items-center gap-1 text-xs text-primary/70">
                            <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                            <span className="text-amber-500">★</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        )}

        {/* Text Content */}
        <div className="text-center community-text max-w-3xl px-4">
           <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary leading-[1.1] mb-6">
            {community?.headline || "Connecting you with"} <br/>
            <span className="font-serif italic font-normal text-secondary">
              {community?.subheadline || "top-tier professionals."}
            </span>
           </h2>
           
           <p className="text-lg text-secondary max-w-2xl mx-auto mb-8 font-light">
             {community?.description || "From award-winning photographers to master florists, browse our curated network of 15,000+ vetted vendors ready to bring your vision to life."}
           </p>
            
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link 
               href={community?.primaryButtonLink || "/vendors"}
               className="px-8 py-3 rounded-full bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
             >
               {community?.primaryButtonText || "Find Vendors"}
             </Link>
             <Link 
               href={community?.secondaryButtonLink || "/vendor-signup"}
               className="px-8 py-3 rounded-full border border-border text-primary text-sm font-medium hover:bg-surface transition-colors"
             >
               {community?.secondaryButtonText || "Join as a Pro"}
             </Link>
           </div>
        </div>

      </div>
    </section>
  );
}
