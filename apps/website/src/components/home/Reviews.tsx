"use client"

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";
import reviewer1 from "@assets/stock_images/portrait_of_a_happy__5adf1c4f.jpg";
import reviewer2 from "@assets/stock_images/portrait_of_a_happy__2fe75321.jpg";
import reviewer3 from "@assets/stock_images/portrait_of_a_happy__419e5856.jpg";
import reviewer4 from "@assets/stock_images/portrait_of_a_happy__8aa4c718.jpg";
import reviewer5 from "@assets/stock_images/portrait_of_a_happy__f02f3ebf.jpg";
import reviewer6 from "@assets/stock_images/portrait_of_a_happy__7d5d47a1.jpg";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent, type ReviewItem } from "@/context/ContentContext";
import { MotionPreset } from "@/components/ui/motion-preset";
import { TextShimmer } from "@/components/ui/text-shimmer";
import Card3DEffect from "@/components/ui/card-3d-effect";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  { id: 1, name: "Sarah & James", role: "Married June 2024", avatar: reviewer1, content: "OpusFesta made our wedding planning incredibly smooth. The vendor marketplace is a game-changer!", rating: 5 },
  { id: 2, name: "Elena Rodriguez", role: "Event Planner", avatar: reviewer2, content: "As a professional planner, I use this platform for all my clients. The tools are intuitive and powerful.", rating: 5 },
  { id: 3, name: "Michael Chen", role: "Groom", avatar: reviewer3, content: "I was dreading the planning process, but the budget tracker and guest list tools actually made it fun.", rating: 5 },
  { id: 4, name: "Emily & David", role: "Married Aug 2024", avatar: reviewer4, content: "We found our dream venue and photographer within days. Highly recommended for any couple!", rating: 4 },
  { id: 5, name: "Jessica Taylor", role: "Maid of Honor", avatar: reviewer5, content: "Helped me organize the best bridal shower ever. The inspiration section is gold.", rating: 5 },
  { id: 6, name: "Robert Wilson", role: "Venue Owner", avatar: reviewer6, content: "Listing my venue here has brought in so many wonderful couples. Great community to be part of.", rating: 5 },
  { id: 7, name: "Alex & Sam", role: "Married Sept 2024", avatar: reviewer2, content: "The RSVP management tool saved us so much time. Cannot imagine planning without it.", rating: 5 },
  { id: 8, name: "Linda Martinez", role: "Photographer", avatar: reviewer5, content: "Connecting with couples who match my style has never been easier. Love this platform.", rating: 5 }
];

export function Reviews() {
  const { content } = useContent();
  const reviews = content.reviews.length ? content.reviews : REVIEWS;
  const containerRef = useRef<HTMLElement>(null);
  const column1Ref = useRef<HTMLDivElement>(null);
  const column2Ref = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function() {
          let tween1: gsap.core.Tween;
          let tween2: gsap.core.Tween;

          if (column1Ref.current) {
            tween1 = gsap.to(column1Ref.current, { yPercent: -33.33, ease: "linear", duration: 60, repeat: -1 });
          }
          if (column2Ref.current) {
            tween2 = gsap.fromTo(column2Ref.current, { yPercent: -33.33 }, { yPercent: 0, ease: "linear", duration: 70, repeat: -1 });
          }

          const container = marqueeRef.current;
          if (container) {
            container.addEventListener('mouseenter', () => { tween1?.pause(); tween2?.pause(); });
            container.addEventListener('mouseleave', () => { tween1?.play(); tween2?.play(); });
          }
        }
      });

      ScrollTrigger.matchMedia({
        "(max-width: 767px)": function() {
          const mobileReviews = containerRef.current?.querySelectorAll<HTMLElement>(".mobile-review-card");
          if (!mobileReviews) return;
          mobileReviews.forEach((card) => {
            gsap.set(card, { y: 32, autoAlpha: 0 });
            gsap.to(card, {
              y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" }
            });
          });
        }
      });
    }, containerRef);

    return () => { ctx.revert(); gsap.globalTimeline.timeScale(1); };
  }, []);

  const column1Reviews = reviews.filter((_, i) => i % 2 === 0);
  const column2Reviews = reviews.filter((_, i) => i % 2 !== 0);
  const col1Items = [...column1Reviews, ...column1Reviews, ...column1Reviews];
  const col2Items = [...column2Reviews, ...column2Reviews, ...column2Reviews];

  return (
    <section ref={containerRef} className="relative w-full bg-surface overflow-hidden py-8 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">

        {/* Left: Text Content (Sticky) */}
        <div className="md:sticky md:top-32 flex flex-col items-center md:items-start gap-8 z-10 text-center md:text-left">
          <div>
            <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="mb-6">
              <TextShimmer className="text-sm font-medium uppercase" duration={1.75}>
                Testimonials
              </TextShimmer>
            </MotionPreset>
            <MotionPreset component="h2" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Loved by couples <br />
              <span className="font-serif italic font-normal text-primary">& professionals.</span>
            </MotionPreset>
            <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.6} className="text-secondary text-lg leading-relaxed max-w-md font-light">
              Join thousands of happy users who have transformed their wedding planning experience with OpusFesta.
            </MotionPreset>
          </div>

          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.9} className="flex justify-center md:justify-start gap-16 mt-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-4xl font-bold text-foreground">4.9/5</span>
              <span className="text-xs text-secondary uppercase tracking-wider font-medium">Average Rating</span>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-4xl font-bold text-foreground">2k+</span>
              <span className="text-xs text-secondary uppercase tracking-wider font-medium">Verified Reviews</span>
            </div>
          </MotionPreset>
        </div>

        {/* Mobile: Static Stack */}
        <div className="mobile-reviews-stack md:hidden w-full flex flex-col gap-4">
          {reviews.slice(0, 4).map((review) => (
            <div key={`mobile-${review.id}`} className="mobile-review-card">
              <ReviewCard review={review} />
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <button className="text-sm font-medium text-primary hover:text-accent transition-colors border-b border-primary/20 hover:border-accent pb-0.5">
              View all reviews
            </button>
          </div>
        </div>

        {/* Desktop: Two Moving Columns */}
        <div ref={marqueeRef} className="hidden md:grid relative h-[600px] overflow-hidden grid-cols-2 gap-4">
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-surface to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden h-full relative">
            <div ref={column1Ref} className="flex flex-col gap-4">
              {col1Items.map((review, i) => <ReviewCard key={`col1-${i}`} review={review} />)}
            </div>
          </div>

          <div className="overflow-hidden h-full relative pt-12 md:pt-0">
            <div ref={column2Ref} className="flex flex-col gap-4">
              {col2Items.map((review, i) => <ReviewCard key={`col2-${i}`} review={review} />)}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <Card3DEffect rotateDepth={8} translateDepth={10}>
      <div className="bg-background border border-border/60 p-5 rounded-2xl hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 w-full relative overflow-hidden flex flex-col h-full">
        <div className="absolute top-4 right-6 text-6xl font-serif text-primary/5 select-none pointer-events-none leading-none">"</div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={`${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-border text-border/30"}`} />
            ))}
          </div>
          <p className="text-foreground/90 text-[15px] font-medium leading-relaxed mb-6 relative">"{review.content}"</p>
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0 bg-surface">
              <img src={resolveAssetSrc(review.avatar)} alt={review.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <h4 className="font-bold text-foreground text-xs tracking-tight">{review.name}</h4>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{review.role}</span>
            </div>
          </div>
        </div>
      </div>
    </Card3DEffect>
  );
}
