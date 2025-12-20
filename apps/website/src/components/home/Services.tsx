"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planningImg from "@assets/stock_images/wedding_planning_che_871a1473.jpg";
import marketplaceImg from "@assets/stock_images/wedding_venue_market_6bf548c4.jpg";
import vendorsImg from "@assets/stock_images/wedding_photographer_abdcbceb.jpg";
import rsvpImg from "@assets/stock_images/wedding_rsvp_guest_l_1043fb33.jpg";
import websiteImg from "@assets/stock_images/wedding_website_digi_53a3f730.jpg";
import adviceImg from "@assets/stock_images/wedding_inspiration__19a8f3a8.jpg";
import attireImg from "@assets/stock_images/wedding_dress_suit_r_bb9b914d.jpg";
import couplesImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";
import { resolveAssetSrc } from "@/lib/assets";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    id: "planning",
    title: "Planning Tools",
    description: "Your master plan, simplified. From an interactive checklist that adapts to your timeline to a budget tracker that keeps finances transparent, our suite of tools ensures nothing falls through the cracks. Collaborate with your partner and planner in real-time.",
    image: planningImg,
    link: "/services/planning",
    ctaText: "Start Planning"
  },
  {
    id: "marketplace",
    title: "Venue Marketplace",
    description: "Discover the backdrop of your dreams. Our curated marketplace features exclusive venues tailored to your aesthetic—from sun-drenched vineyards and rustic barns to industrial lofts and grand ballrooms. Filter by capacity, style, and availability instantly.",
    image: marketplaceImg,
    link: "/services/marketplace",
    ctaText: "Browse Venues"
  },
  {
    id: "vendors",
    title: "Curated Vendors",
    description: "Assemble your dream team with confidence. We vet every photographer, florist, caterer, and entertainer to ensure they meet The Festa Standard. Browse portfolios, read verified reviews, and connect directly with professionals who understand your vision.",
    image: vendorsImg,
    link: "/services/vendors",
    ctaText: "Find Pros"
  },
  {
    id: "rsvp",
    title: "RSVP & Guest List",
    description: "Guest management, mastered. Collect RSVPs, track dietary restrictions, and manage plus-ones effortlessly. Group guests into households, assign tables with a drag-and-drop floor planner, and send digital updates in seconds.",
    image: rsvpImg,
    link: "/services/rsvp",
    ctaText: "Manage Guests"
  },
  {
    id: "website",
    title: "Wedding Website",
    description: "Tell your love story with a stunning, custom website. Choose from modern, mobile-responsive templates that match your invitation suite. Share your schedule, travel details, and registry links with guests in a beautiful, centralized hub.",
    image: websiteImg,
    link: "/services/website",
    ctaText: "Create Website"
  },
  {
    id: "advice",
    title: "Ideas & Advice",
    description: "Inspiration without the overwhelm. Explore expert-written articles, trend reports, and real wedding features to spark your creativity. Whether you're navigating etiquette dilemmas or seeking style advice, our library is your go-to resource.",
    image: adviceImg,
    link: "/services/advice",
    ctaText: "Get Inspired"
  },
  {
    id: "attire",
    title: "Attire & Rings",
    description: "Find the look that feels like you. Browse extensive collections of bridal gowns, suits, and accessories from top designers and boutique ateliers. Filter by silhouette, fabric, and price to discover the perfect fit for your big day.",
    image: attireImg,
    link: "/services/attire",
    ctaText: "Shop Collections"
  },
  {
    id: "couples",
    title: "Find Couples",
    description: "You're not in this alone. Join a vibrant community of couples planning their weddings simultaneously. Share tips, vent about stressors, exchange vendor recommendations, and find support from people who truly get it.",
    image: couplesImg,
    link: "/services/couples",
    ctaText: "Join Community"
  }
];

export function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the left side content
      ScrollTrigger.matchMedia({
        // Desktop & Tablet
        "(min-width: 768px)": function() {
          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: ".service-visual",
            scrub: true,
          });
          
          // Detect active section for image swapping
          const sections = gsap.utils.toArray<HTMLElement>(".service-item");
          sections.forEach((section, i) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top center",
              end: "bottom center",
              onToggle: (self) => {
                if (self.isActive) {
                  setActiveIndex(i);
                }
              }
            });
          });
        }
      });

      // Text reveal animation (works on all screens)
      const sections = gsap.utils.toArray<HTMLElement>(".service-item");
      sections.forEach((section) => {
        const content = section.querySelectorAll("h3, p, a, .service-mobile-img");
        
        gsap.fromTo(content, 
          { 
            y: 50, 
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 50%",
              scrub: 1,
              toggleActions: "play none none reverse"
            }
          }
        );
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" className="relative w-full bg-background border-b border-border">
      
      {/* Intro Header */}
      <div className="max-w-[1400px] mx-auto pt-24 pb-12 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/50 pb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="font-mono text-accent text-xs tracking-widest uppercase">
                Our Services
              </span>
              <span className="md:hidden w-12 h-[1px] bg-accent"></span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary leading-[1.1]">
              Everything you need, <br />
              <span className="font-serif italic font-normal text-secondary">all in one place.</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <p className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light">
              From venue hunting to day-of coordination, access the essential tools and curated connections to bring your unique vision to life effortlessly.
            </p>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 relative">
        
        {/* Left Column - Sticky Visual (Desktop Only) */}
        <div className="service-visual hidden md:flex h-screen sticky top-0 flex-col justify-center items-center p-6 lg:p-12 overflow-hidden bg-background">
          <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-border">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={resolveAssetSrc(service.image)}
                  alt={service.title}
                  className="w-full h-full object-cover transform scale-105"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
            
            {/* Progress Indicator */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 z-20">
               {SERVICES.map((_, idx) => (
                 <div 
                   key={idx}
                   className={`h-1 rounded-full transition-all duration-300 ${
                     idx === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                   }`}
                 />
               ))}
            </div>
          </div>
        </div>

        {/* Right Column - Scrolling Content */}
        <div ref={rightColumnRef} className="flex flex-col pt-12 pb-4 lg:pt-0 lg:pb-24 px-6 lg:px-16 gap-16 lg:gap-24">
          {/* Service Items */}
          {SERVICES.map((service, index) => (
            <div 
              key={service.id} 
              className="service-item min-h-[40vh] md:min-h-screen flex flex-col justify-center"
            >
              {/* Mobile Image */}
              <div className="service-mobile-img md:hidden w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-lg">
                <img 
                  src={resolveAssetSrc(service.image)} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                {service.title}
              </h3>
              <p className="text-lg text-secondary leading-relaxed max-w-md mb-8">
                {service.description}
              </p>
              
              <Link
                href={service.link}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors group"
              >
                <span className="border-b border-primary/30 pb-0.5 group-hover:border-accent">
                  {service.ctaText}
                </span>
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
          
          {/* Bottom Spacer to allow last item to scroll fully */}
          <div className="h-0 md:h-[20vh]"></div>
        </div>

      </div>
    </section>
  );
}
