"use client"

import { useRef, useEffect } from "react";
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

// Import stock images
import img1 from "@assets/stock_images/portrait_of_happy_di_c8a24a47.jpg";
import img2 from "@assets/stock_images/portrait_of_happy_di_b4c479f6.jpg";
import img3 from "@assets/stock_images/portrait_of_happy_di_923e31ae.jpg";
import img4 from "@assets/stock_images/portrait_of_happy_di_e387d645.jpg";
import img5 from "@assets/stock_images/portrait_of_happy_di_d654e779.jpg";
import img6 from "@assets/stock_images/portrait_of_happy_di_c22f0f87.jpg";
import img7 from "@assets/stock_images/portrait_of_happy_di_870f496e.jpg";
import img8 from "@assets/stock_images/portrait_of_happy_di_aaf3ea01.jpg";
import img9 from "@assets/stock_images/portrait_of_happy_di_a267e549.jpg";
import img10 from "@assets/stock_images/portrait_of_happy_di_2732c45f.jpg";

// Re-use some existing ones to fill the grid
import existing1 from "@assets/stock_images/portrait_of_a_happy__5adf1c4f.jpg";
import existing2 from "@assets/stock_images/portrait_of_a_happy__2fe75321.jpg";
import existing3 from "@assets/stock_images/portrait_of_a_happy__419e5856.jpg";
import existing4 from "@assets/stock_images/portrait_of_a_happy__8aa4c718.jpg";
import existing5 from "@assets/stock_images/portrait_of_a_happy__f02f3ebf.jpg";

gsap.registerPlugin(ScrollTrigger);

// Data generators for simulating ~100 diverse vendors
const firstNames = ["James", "Sarah", "Michael", "Jessica", "David", "Emily", "Robert", "Emma", "William", "Olivia", "Joseph", "Ava", "Charles", "Isabella", "Thomas", "Sophia", "Christopher", "Mia", "Daniel", "Charlotte", "Matthew", "Amelia", "Anthony", "Harper", "Donald", "Evelyn", "Mark", "Abigail", "Paul", "Emily", "Steven", "Elizabeth", "Andrew", "Mila", "Kenneth", "Ella", "Joshua", "Avery", "Kevin", "Sofia", "Brian", "Camila", "George", "Aria", "Edward", "Scarlett", "Ronald", "Victoria", "Timothy", "Madison"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];
const roles = ["Photographer", "Wedding Planner", "Florist", "Venue Manager", "Caterer", "DJ / Entertainment", "Makeup Artist", "Hair Stylist", "Videographer", "Event Designer", "Bakery / Cake Artist", "Stationery Designer", "Officiant", "Transportation", "Lighting Specialist"];
const quotes = [
  "Capturing moments that last a lifetime.",
  "Turning your dream wedding into reality.",
  "Floral designs that take your breath away.",
  "The perfect backdrop for your special day.",
  "Delicious menus tailored to your taste.",
  "Keeping the dance floor packed all night.",
  "Enhancing your natural beauty.",
  "Cinematic storytelling of your love.",
  "Creating unforgettable atmospheres.",
  "Sweet treats for sweet moments.",
  "Beautiful invitations that set the tone.",
  "Seamless coordination for a stress-free day.",
  "Arrive in style and comfort.",
  "Setting the mood with perfect lighting.",
  "Award-winning service since 2018.",
  "Featured in Vogue and Brides.",
  "Passionate about perfection.",
  "Detail-oriented and dedicated.",
  "Your vision, our expertise.",
  "Making memories magical."
];

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, existing1, existing2, existing3, existing4, existing5];

// Generate 100 vendors
const VENDORS = Array.from({ length: 100 }, (_, i) => {
  const img = images[i % images.length];
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[(i * 3) % lastNames.length]; // varying index to mix names
  const role = roles[i % roles.length];
  const quote = quotes[i % quotes.length];
  
  return {
    img,
    name: `${firstName} ${lastName.charAt(0)}.`,
    role,
    quote
  };
});

export function Community() {
  const containerRef = useRef<HTMLElement>(null);
  
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
  }, []);

  return (
    <section ref={containerRef} className="py-12 md:py-24 bg-background overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col items-center">
        
        {/* Vendor Grid - Dense and centered */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-1.5 md:gap-2 max-w-[90rem] mx-auto mb-12 md:mb-16 mask-linear-fade">
          {VENDORS.map((vendor, i) => (
             <HoverCard key={i} openDelay={0} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="vendor-avatar cursor-pointer transition-transform hover:scale-125 hover:z-20 relative">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-background/50 shadow-sm">
                    <AvatarImage
                      src={resolveAssetSrc(vendor.img)}
                      alt={vendor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-[8px] sm:text-[10px]">{vendor.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-4 shadow-xl border-border/60 bg-surface/95 backdrop-blur-sm z-50" sideOffset={5}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={resolveAssetSrc(vendor.img)} className="object-cover" />
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
                  <div className="mt-1 flex items-center gap-1 text-xs text-secondary">
                    <BadgeCheck className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                    Verified Pro
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center community-text max-w-3xl px-4">
           <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary leading-[1.1] mb-6">
            Connecting you with <br/>
            <span className="font-serif italic font-normal text-secondary">top-tier professionals.</span>
           </h2>
           
           <p className="text-lg text-secondary max-w-2xl mx-auto mb-8 font-light">
             From award-winning photographers to master florists, browse our curated network of 15,000+ vetted vendors ready to bring your vision to life.
           </p>
            
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button className="px-8 py-3 rounded-full bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
               Find Vendors
             </button>
             <button className="px-8 py-3 rounded-full border border-border text-primary text-sm font-medium hover:bg-surface transition-colors">
               Join as a Pro
             </button>
           </div>
        </div>

      </div>
    </section>
  );
}
