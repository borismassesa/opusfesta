"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveAssetSrc, type AssetLike } from "@/lib/assets";
import { supabase } from "@/lib/supabaseClient";

// Import images for initial state
import planningImg from "@assets/stock_images/wedding_planning_che_871a1473.jpg";
import marketplaceImg from "@assets/stock_images/wedding_venue_market_6bf548c4.jpg";
import vendorsImg from "@assets/stock_images/wedding_photographer_abdcbceb.jpg";
import rsvpImg from "@assets/stock_images/wedding_rsvp_guest_l_1043fb33.jpg";
import websiteImg from "@assets/stock_images/wedding_website_digi_53a3f730.jpg";
import adviceImg from "@assets/stock_images/wedding_inspiration__19a8f3a8.jpg";
import attireImg from "@assets/stock_images/wedding_dress_suit_r_bb9b914d.jpg";
import couplesImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";

import tableImg from "@assets/stock_images/wedding_table_settin_c7e6dce8.jpg";
import bouquetImg from "@assets/stock_images/wedding_bouquet_mode_ab76e613.jpg";
import cakeImg from "@assets/stock_images/wedding_cake_modern__2868fc7b.jpg";
import receptionImg from "@assets/stock_images/wedding_reception_li_3a8fab49.jpg";
import ctaBg from "@assets/stock_images/luxury_dark_elegant__ca7749ec.jpg";

// Import portrait images for community vendors
import portrait1 from "@assets/stock_images/portrait_of_happy_di_c8a24a47.jpg";
import portrait2 from "@assets/stock_images/portrait_of_happy_di_b4c479f6.jpg";
import portrait3 from "@assets/stock_images/portrait_of_happy_di_923e31ae.jpg";
import portrait4 from "@assets/stock_images/portrait_of_happy_di_e387d645.jpg";
import portrait5 from "@assets/stock_images/portrait_of_happy_di_d654e779.jpg";
import portrait6 from "@assets/stock_images/portrait_of_happy_di_c22f0f87.jpg";
import portrait7 from "@assets/stock_images/portrait_of_happy_di_870f496e.jpg";
import portrait8 from "@assets/stock_images/portrait_of_happy_di_aaf3ea01.jpg";
import portrait9 from "@assets/stock_images/portrait_of_happy_di_a267e549.jpg";
import portrait10 from "@assets/stock_images/portrait_of_happy_di_2732c45f.jpg";
import portrait11 from "@assets/stock_images/portrait_of_a_happy__5adf1c4f.jpg";
import portrait12 from "@assets/stock_images/portrait_of_a_happy__2fe75321.jpg";
import portrait13 from "@assets/stock_images/portrait_of_a_happy__419e5856.jpg";
import portrait14 from "@assets/stock_images/portrait_of_a_happy__8aa4c718.jpg";
import portrait15 from "@assets/stock_images/portrait_of_a_happy__f02f3ebf.jpg";

// Import reviewer images for testimonials
import reviewer1 from "@assets/stock_images/portrait_of_a_happy__5adf1c4f.jpg";
import reviewer2 from "@assets/stock_images/portrait_of_a_happy__2fe75321.jpg";
import reviewer3 from "@assets/stock_images/portrait_of_a_happy__419e5856.jpg";
import reviewer4 from "@assets/stock_images/portrait_of_a_happy__8aa4c718.jpg";
import reviewer5 from "@assets/stock_images/portrait_of_a_happy__f02f3ebf.jpg";
import reviewer6 from "@assets/stock_images/portrait_of_a_happy__7d5d47a1.jpg";

const CMS_SLUG = "home";

type CmsPageRow = {
  draft_content: ContentState | null;
  published_content: ContentState | null;
  published: boolean;
  updated_at: string | null;
  published_at: string | null;
};

// Define Types
export interface HeroSlide {
  id: number;
  video: string;
  poster: string;
  author: string;
  avatar: string;
  color: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: AssetLike;
  link: string;
  ctaText: string;
}

export interface IssueItem {
  id: number;
  title: string;
  desc: string;
  img: AssetLike;
}

export interface AdviceArticle {
  id: string;
  title: string;
  description: string;
  image: AssetLike;
  link?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: AssetLike;
  content: string;
  rating: number;
}

export interface ReviewItem {
  id: number;
  name: string;
  role: string;
  avatar: AssetLike;
  content: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FeaturedCompany {
  id: string;
  name: string;
  logo?: AssetLike; // Optional logo image
  logoType: "image" | "text"; // Whether to show image or text
  link?: string; // Optional link to company website
}

export interface CommunityVendor {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatar: AssetLike;
  rating: number;
}

export interface ContentState {
  hero: {
    headlinePrefix: string;
    typingPhrases: string[];
    subhead: string;
    slides: HeroSlide[];
  };
  about: {
    headline: string;
    stats: {
      weddings: {
        value: string;
        label: string;
      };
      satisfaction: {
        value: string;
        label: string;
      };
      guests: {
        value: string;
        label: string;
      };
      rating: {
        value: string;
        label: string;
      };
    };
    featuredLabel: string;
    featuredCompanies: FeaturedCompany[];
  };
  services: ServiceItem[];
  issues: IssueItem[];
  reviews: ReviewItem[];
  faqs: FAQItem[];
  advice: {
    label: string;
    headline: string;
    subheadline: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    articles: AdviceArticle[];
  };
  testimonials: {
    label: string;
    headline: string;
    subheadline: string;
    description: string;
    items: TestimonialItem[];
  };
  community: {
    headline: string;
    subheadline: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    vendors: CommunityVendor[];
  };
  cta: {
    headline: string;
    subheadline: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    trustIndicators: {
      couples: string;
      rating: string;
    };
    backgroundImage: AssetLike;
  };
  social: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    pinterest?: string;
  };
}

// Initial Data
const INITIAL_CONTENT: ContentState = {
  hero: {
    headlinePrefix: "Plan the wedding",
    typingPhrases: ["of the century.", "you've dreamed of.", "that's uniquely yours."],
    subhead: "The world's most sophisticated platform for modern couples. Curated venues, verified professionals, and intelligent planning tools—all in one place.",
    slides: [
      {
        id: 1,
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
        author: "Evergreen Films",
        avatar: "https://picsum.photos/seed/vid1/50/50",
        color: "var(--surface)"
      },
      {
        id: 2,
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
        author: "Love & Lens",
        avatar: "https://picsum.photos/seed/vid2/50/50",
        color: "var(--surface)"
      },
      {
        id: 3,
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
        author: "Rustic Barns Co.",
        avatar: "https://picsum.photos/seed/vid3/50/50",
        color: "var(--surface)"
      },
    ]
  },
  about: {
    headline: "We are a planning intelligence engine dedicated to transforming how couples visualize their big day. With a team of planners, engineers, and artists, we build tools that empower ambitious couples to design, organize, and celebrate at the speed of love.",
    stats: {
      weddings: {
        value: "15k+",
        label: "Planned Weddings"
      },
      satisfaction: {
        value: "99%",
        label: "User Satisfaction"
      },
      guests: {
        value: "2M+",
        label: "Happy Guests"
      },
      rating: {
        value: "4.9",
        label: "Average Rating"
      }
    },
    featuredLabel: "Featured in & Trusted By",
    featuredCompanies: [
      {
        id: "vogue",
        name: "Vogue",
        logoType: "text",
        link: "https://www.vogue.com"
      },
      {
        id: "brides",
        name: "BRIDES",
        logoType: "text",
        link: "https://www.brides.com"
      },
      {
        id: "the-knot",
        name: "The Knot",
        logoType: "text",
        link: "https://www.theknot.com"
      },
      {
        id: "martha-stewart",
        name: "Martha Stewart Weddings",
        logoType: "text",
        link: "https://www.marthastewart.com"
      },
      {
        id: "bazaar",
        name: "BAZAAR",
        logoType: "text",
        link: "https://www.harpersbazaar.com"
      }
    ]
  },
  services: [
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
  ],
  issues: [
    {
      id: 1,
      title: "Table Scapes",
      desc: "Creating the perfect dining atmosphere for your guests.",
      img: tableImg
    },
    {
      id: 2,
      title: "Floral Art",
      desc: "Modern bouquet trends for the contemporary bride.",
      img: bouquetImg
    },
    {
      id: 3,
      title: "Sweet Minimal",
      desc: "Why simple cakes are making a big comeback.",
      img: cakeImg
    },
    {
      id: 4,
      title: "Mood Lighting",
      desc: "Transforming your venue with the right illumination.",
      img: receptionImg
    }
  ],
  reviews: [], // Initially empty, will be populated if needed or kept dynamic in component for now
  faqs: [
    {
      question: "What is OpusFesta?",
      answer: "OpusFesta is a comprehensive wedding and event planning platform that connects couples with curated venues and vendors, while providing powerful tools to manage guest lists, budgets, and timelines."
    },
    {
      question: "Is OpusFesta free to use?",
      answer: "Yes, OpusFesta is free for couples planning their wedding. We offer a suite of planning tools, including our budget tracker, guest list manager, and checklist, at no cost."
    },
    {
      question: "How do you vet your vendors?",
      answer: "We have a rigorous vetting process. Every vendor on our platform is reviewed for quality, reliability, and professionalism. We also verify reviews to ensure you're getting honest feedback from real couples."
    },
    {
      question: "Can I use OpusFesta for events other than weddings?",
      answer: "Absolutely! While our tools are optimized for weddings, many of our users plan engagement parties, bridal showers, anniversary celebrations, and corporate events using our venue marketplace and vendor network."
    },
    {
      question: "Do you offer support if I get stuck?",
      answer: "Our support team is available 7 days a week to assist you. We also have an extensive library of articles and guides in our Advice section to help navigate common planning challenges."
    }
  ],
  advice: {
    label: "Advice & Ideas",
    headline: "Inspiration for",
    subheadline: "your big day.",
    description: "Expert guides, trending styles, and real wedding stories to help you plan a celebration that's uniquely yours.",
    buttonText: "Browse All Articles",
    buttonLink: "/services/advice",
    articles: [
      {
        id: "article-1",
        title: "Table Scapes",
        description: "Creating the perfect dining atmosphere for your guests.",
        image: tableImg,
        link: "/advice/table-scapes"
      },
      {
        id: "article-2",
        title: "Floral Art",
        description: "Modern bouquet trends for the contemporary bride.",
        image: bouquetImg,
        link: "/advice/floral-art"
      },
      {
        id: "article-3",
        title: "Sweet Minimal",
        description: "Why simple cakes are making a big comeback.",
        image: cakeImg,
        link: "/advice/sweet-minimal"
      },
      {
        id: "article-4",
        title: "Mood Lighting",
        description: "Transforming your venue with the right illumination.",
        image: receptionImg,
        link: "/advice/mood-lighting"
      },
      {
        id: "article-5",
        title: "Venue Selection Guide",
        description: "How to choose the perfect wedding venue that matches your vision and budget.",
        image: marketplaceImg,
        link: "/advice/venue-selection"
      },
      {
        id: "article-6",
        title: "Photography Tips",
        description: "Essential tips for capturing your special day with stunning wedding photography.",
        image: vendorsImg,
        link: "/advice/photography-tips"
      }
    ]
  },
  testimonials: {
    label: "Testimonials",
    headline: "Loved by couples",
    subheadline: "& professionals.",
    description: "Join thousands of happy users who have transformed their wedding planning experience with OpusFesta.",
    items: [
      {
        id: "testimonial-1",
        name: "Sarah & James",
        role: "Married June 2024",
        avatar: reviewer1,
        content: "OpusFesta made our wedding planning incredibly smooth. The vendor marketplace is a game-changer!",
        rating: 5
      },
      {
        id: "testimonial-2",
        name: "Elena Rodriguez",
        role: "Event Planner",
        avatar: reviewer2,
        content: "As a professional planner, I use this platform for all my clients. The tools are intuitive and powerful.",
        rating: 5
      },
      {
        id: "testimonial-3",
        name: "Michael Chen",
        role: "Groom",
        avatar: reviewer3,
        content: "I was dreading the planning process, but the budget tracker and guest list tools actually made it fun.",
        rating: 5
      },
      {
        id: "testimonial-4",
        name: "Emily & David",
        role: "Married Aug 2024",
        avatar: reviewer4,
        content: "We found our dream venue and photographer within days. Highly recommended for any couple!",
        rating: 4
      },
      {
        id: "testimonial-5",
        name: "Jessica Taylor",
        role: "Maid of Honor",
        avatar: reviewer5,
        content: "Helped me organize the best bridal shower ever. The inspiration section is gold.",
        rating: 5
      },
      {
        id: "testimonial-6",
        name: "Robert Wilson",
        role: "Venue Owner",
        avatar: reviewer6,
        content: "Listing my venue here has brought in so many wonderful couples. Great community to be part of.",
        rating: 5
      },
      {
        id: "testimonial-7",
        name: "Alex & Sam",
        role: "Married Sept 2024",
        avatar: reviewer2,
        content: "The RSVP management tool saved us so much time. Cannot imagine planning without it.",
        rating: 5
      },
      {
        id: "testimonial-8",
        name: "Linda Martinez",
        role: "Photographer",
        avatar: reviewer5,
        content: "Connecting with couples who match my style has never been easier. Love this platform.",
        rating: 5
      }
    ]
  },
  community: {
    headline: "Connecting you with",
    subheadline: "top-tier professionals.",
    description: "From award-winning photographers to master florists, browse our curated network of 15,000+ vetted vendors ready to bring your vision to life.",
    primaryButtonText: "Find Vendors",
    primaryButtonLink: "/vendors",
    secondaryButtonText: "Join as a Pro",
    secondaryButtonLink: "/vendor-signup",
    vendors: [
      {
        id: "vendor-1",
        name: "James S.",
        role: "Photographer",
        quote: "Capturing moments that last a lifetime.",
        avatar: portrait1,
        rating: 5
      },
      {
        id: "vendor-2",
        name: "Sarah J.",
        role: "Wedding Planner",
        quote: "Turning your dream wedding into reality.",
        avatar: portrait2,
        rating: 5
      },
      {
        id: "vendor-3",
        name: "Michael W.",
        role: "Florist",
        quote: "Floral designs that take your breath away.",
        avatar: portrait3,
        rating: 5
      },
      {
        id: "vendor-4",
        name: "Jessica B.",
        role: "Venue Manager",
        quote: "The perfect backdrop for your special day.",
        avatar: portrait4,
        rating: 4.8
      },
      {
        id: "vendor-5",
        name: "David J.",
        role: "Caterer",
        quote: "Delicious menus tailored to your taste.",
        avatar: portrait5,
        rating: 4.9
      },
      {
        id: "vendor-6",
        name: "Emily G.",
        role: "DJ / Entertainment",
        quote: "Keeping the dance floor packed all night.",
        avatar: portrait6,
        rating: 5
      },
      {
        id: "vendor-7",
        name: "Robert M.",
        role: "Makeup Artist",
        quote: "Enhancing your natural beauty.",
        avatar: portrait7,
        rating: 4.9
      },
      {
        id: "vendor-8",
        name: "Emma D.",
        role: "Hair Stylist",
        quote: "Creating unforgettable atmospheres.",
        avatar: portrait8,
        rating: 4.8
      },
      {
        id: "vendor-9",
        name: "William R.",
        role: "Videographer",
        quote: "Cinematic storytelling of your love.",
        avatar: portrait9,
        rating: 5
      },
      {
        id: "vendor-10",
        name: "Olivia M.",
        role: "Event Designer",
        quote: "Your vision, our expertise.",
        avatar: portrait10,
        rating: 4.9
      },
      {
        id: "vendor-11",
        name: "Joseph L.",
        role: "Bakery / Cake Artist",
        quote: "Sweet treats for sweet moments.",
        avatar: portrait11,
        rating: 5
      },
      {
        id: "vendor-12",
        name: "Ava H.",
        role: "Stationery Designer",
        quote: "Beautiful invitations that set the tone.",
        avatar: portrait12,
        rating: 4.7
      },
      {
        id: "vendor-13",
        name: "Charles T.",
        role: "Officiant",
        quote: "Seamless coordination for a stress-free day.",
        avatar: portrait13,
        rating: 4.9
      },
      {
        id: "vendor-14",
        name: "Isabella W.",
        role: "Transportation",
        quote: "Arrive in style and comfort.",
        avatar: portrait14,
        rating: 4.8
      },
      {
        id: "vendor-15",
        name: "Thomas S.",
        role: "Lighting Specialist",
        quote: "Setting the mood with perfect lighting.",
        avatar: portrait15,
        rating: 5
      },
      {
        id: "vendor-16",
        name: "Sophia A.",
        role: "Photographer",
        quote: "Award-winning service since 2018.",
        avatar: portrait1,
        rating: 5
      },
      {
        id: "vendor-17",
        name: "Christopher N.",
        role: "Wedding Planner",
        quote: "Featured in Vogue and Brides.",
        avatar: portrait2,
        rating: 4.9
      },
      {
        id: "vendor-18",
        name: "Mia G.",
        role: "Florist",
        quote: "Passionate about perfection.",
        avatar: portrait3,
        rating: 5
      },
      {
        id: "vendor-19",
        name: "Daniel R.",
        role: "Venue Manager",
        quote: "Detail-oriented and dedicated.",
        avatar: portrait4,
        rating: 4.8
      },
      {
        id: "vendor-20",
        name: "Charlotte K.",
        role: "Caterer",
        quote: "Making memories magical.",
        avatar: portrait5,
        rating: 4.9
      },
      {
        id: "vendor-21",
        name: "Matthew P.",
        role: "DJ / Entertainment",
        quote: "Capturing moments that last a lifetime.",
        avatar: portrait6,
        rating: 5
      },
      {
        id: "vendor-22",
        name: "Amelia F.",
        role: "Makeup Artist",
        quote: "Turning your dream wedding into reality.",
        avatar: portrait7,
        rating: 4.9
      },
      {
        id: "vendor-23",
        name: "Anthony C.",
        role: "Hair Stylist",
        quote: "Floral designs that take your breath away.",
        avatar: portrait8,
        rating: 4.8
      },
      {
        id: "vendor-24",
        name: "Harper B.",
        role: "Videographer",
        quote: "The perfect backdrop for your special day.",
        avatar: portrait9,
        rating: 5
      },
      {
        id: "vendor-25",
        name: "Donald M.",
        role: "Event Designer",
        quote: "Delicious menus tailored to your taste.",
        avatar: portrait10,
        rating: 4.9
      }
    ]
  },
  cta: {
    headline: "Plan the wedding",
    subheadline: "of the century.",
    description: "Join a community of modern couples who have elevated their planning experience. Sophisticated tools, curated vendors, and endless inspiration await.",
    primaryButtonText: "Get Started",
    primaryButtonLink: "/signup",
    secondaryButtonText: "Live Demo",
    secondaryButtonLink: "/demo",
    trustIndicators: {
      couples: "Trusted by 50k+ Couples",
      rating: "4.9/5 Rating"
    },
    backgroundImage: ctaBg
  },
  social: {
    twitter: "https://twitter.com/thefesta",
    instagram: "https://instagram.com/thefesta",
    linkedin: "https://linkedin.com/company/thefesta",
    tiktok: "https://tiktok.com/@opusfesta",
    facebook: "",
    youtube: "",
    pinterest: ""
  }
};

interface ContentContextType {
  content: ContentState;
  updateContent: (section: keyof ContentState, data: any) => void;
  resetContent: () => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  published: boolean;
  lastUpdatedAt: string | null;
  lastPublishedAt: string | null;
  loadPublishedContent: () => Promise<void>;
  loadAdminContent: () => Promise<void>;
  saveDraft: () => Promise<void>;
  publishContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentState>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewParam = searchParams?.get("preview");
  const isPreviewDraft =
    previewParam === "draft" || previewParam === "1" || previewParam === "true";
  const isAdminRoute = pathname?.startsWith("/admin");

  const updateContent = (section: keyof ContentState, data: any) => {
    setContent((prev) => {
      // Handle array updates (replace entire array)
      if (Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: data
        };
      }
      // Handle object updates (merge properties)
      return {
        ...prev,
        [section]: { ...prev[section], ...data }
      };
    });
  };

  const resetContent = () => {
    setContent(INITIAL_CONTENT);
  };

  const ensureUniqueStringIds = useCallback(
    <T extends { id: string }>(items: T[] | undefined, prefix: string): T[] => {
      const source = items ?? [];
      const seen = new Set<string>();

      return source.map((item, index) => {
        const rawId = typeof item.id === "string" ? item.id.trim() : "";
        const baseId = rawId || `${prefix}-${index + 1}`;
        let uniqueId = baseId;
        let suffix = 2;

        while (seen.has(uniqueId)) {
          uniqueId = `${baseId}-${suffix}`;
          suffix += 1;
        }

        seen.add(uniqueId);
        return uniqueId === item.id ? item : { ...item, id: uniqueId };
      });
    },
    [],
  );

  const mergeContent = useCallback((incoming?: Partial<ContentState> | null) => {
    if (!incoming) {
      return INITIAL_CONTENT;
    }

    return {
      ...INITIAL_CONTENT,
      ...incoming,
      hero: {
        ...INITIAL_CONTENT.hero,
        ...incoming.hero,
        slides: incoming.hero?.slides ?? INITIAL_CONTENT.hero.slides,
      },
      about: {
        ...INITIAL_CONTENT.about,
        ...incoming.about,
        headline: incoming.about?.headline ?? INITIAL_CONTENT.about.headline,
        featuredLabel: incoming.about?.featuredLabel ?? INITIAL_CONTENT.about.featuredLabel,
        featuredCompanies: ensureUniqueStringIds(
          incoming.about?.featuredCompanies ?? INITIAL_CONTENT.about.featuredCompanies,
          "featured-company",
        ),
        stats: {
          weddings: {
            ...INITIAL_CONTENT.about.stats.weddings,
            ...incoming.about?.stats?.weddings,
          },
          satisfaction: {
            ...INITIAL_CONTENT.about.stats.satisfaction,
            ...incoming.about?.stats?.satisfaction,
          },
          guests: {
            ...INITIAL_CONTENT.about.stats.guests,
            ...incoming.about?.stats?.guests,
          },
          rating: {
            ...INITIAL_CONTENT.about.stats.rating,
            ...incoming.about?.stats?.rating,
          },
        },
      },
      services: ensureUniqueStringIds(
        incoming.services ?? INITIAL_CONTENT.services,
        "service",
      ),
      issues: incoming.issues ?? INITIAL_CONTENT.issues,
      reviews: incoming.reviews ?? INITIAL_CONTENT.reviews,
      faqs: incoming.faqs ?? INITIAL_CONTENT.faqs,
      advice: {
        ...INITIAL_CONTENT.advice,
        ...incoming.advice,
        articles: ensureUniqueStringIds(
          incoming.advice?.articles ?? INITIAL_CONTENT.advice.articles,
          "article",
        ),
      },
      testimonials: {
        ...INITIAL_CONTENT.testimonials,
        ...incoming.testimonials,
        items: ensureUniqueStringIds(
          incoming.testimonials?.items ?? INITIAL_CONTENT.testimonials.items,
          "testimonial",
        ),
      },
      community: {
        ...INITIAL_CONTENT.community,
        ...incoming.community,
        vendors: ensureUniqueStringIds(
          incoming.community?.vendors ?? INITIAL_CONTENT.community.vendors,
          "community-vendor",
        ),
      },
      cta: {
        ...INITIAL_CONTENT.cta,
        ...incoming.cta,
        backgroundImage: (incoming.cta?.backgroundImage && incoming.cta.backgroundImage.trim() !== "") 
          ? incoming.cta.backgroundImage 
          : INITIAL_CONTENT.cta.backgroundImage,
        trustIndicators: {
          ...INITIAL_CONTENT.cta.trustIndicators,
          ...incoming.cta?.trustIndicators,
        },
      },
      social: {
        ...INITIAL_CONTENT.social,
        ...incoming.social,
      },
    };
  }, [ensureUniqueStringIds]);

  const serializeContent = useCallback((current: ContentState) => {
    return {
      ...current,
      services: current.services.map((service) => ({
        ...service,
        image: resolveAssetSrc(service.image),
      })),
      issues: current.issues.map((issue) => ({
        ...issue,
        img: resolveAssetSrc(issue.img),
      })),
      reviews: current.reviews.map((review) => ({
        ...review,
        avatar: resolveAssetSrc(review.avatar),
      })),
      testimonials: {
        ...current.testimonials,
        items: current.testimonials.items.map((testimonial) => ({
          ...testimonial,
          avatar: resolveAssetSrc(testimonial.avatar),
        })),
      },
      advice: {
        ...current.advice,
        articles: current.advice.articles.map((article) => ({
          ...article,
          image: resolveAssetSrc(article.image),
        })),
      },
      community: {
        ...current.community,
        vendors: current.community.vendors.map((vendor) => ({
          ...vendor,
          avatar: resolveAssetSrc(vendor.avatar),
        })),
      },
      cta: {
        ...current.cta,
        backgroundImage: resolveAssetSrc(current.cta.backgroundImage),
      },
      about: {
        ...current.about,
        featuredCompanies: current.about.featuredCompanies.map((company) => ({
          ...company,
          logo: company.logo ? resolveAssetSrc(company.logo) : undefined,
        })),
      },
    };
  }, []);

  const applyRemoteContent = useCallback((row?: CmsPageRow | null, mode?: "published" | "admin") => {
    if (!row) {
      console.log('[ContentContext] No row found, using INITIAL_CONTENT');
      // Still set content to INITIAL_CONTENT so page renders
      setContent(INITIAL_CONTENT);
      return;
    }

    setPublished(row.published ?? false);
    setLastUpdatedAt(row.updated_at ?? null);
    setLastPublishedAt(row.published_at ?? null);

    // For published mode, prefer published_content, but fallback to draft_content if published_content is empty
    // For admin mode, prefer draft_content, but fallback to published_content
    const nextContent =
      mode === "published"
        ? (row.published_content && Object.keys(row.published_content).length > 0)
          ? row.published_content
          : row.draft_content ?? row.published_content
        : row.draft_content ?? row.published_content;

    if (nextContent) {
      console.log('[ContentContext] Applying content from database', { mode, hasDraft: !!row.draft_content, hasPublished: !!row.published_content });
      console.log('[ContentContext] CTA backgroundImage in incoming:', nextContent?.cta?.backgroundImage);
      console.log('[ContentContext] Full CTA object:', JSON.stringify(nextContent?.cta, null, 2));
      const merged = mergeContent(nextContent);
      console.log('[ContentContext] CTA backgroundImage after merge:', merged?.cta?.backgroundImage);
      console.log('[ContentContext] Merged CTA type:', typeof merged?.cta?.backgroundImage);
      setContent(merged);
    } else {
      console.log('[ContentContext] No content found in row, using INITIAL_CONTENT', { mode, hasDraft: !!row.draft_content, hasPublished: !!row.published_content });
      // Fallback to INITIAL_CONTENT if no database content exists
      setContent(INITIAL_CONTENT);
    }
  }, [mergeContent]);

  const loadPublishedContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("cms_pages")
      .select("published_content, published, updated_at, published_at")
      .eq("slug", CMS_SLUG)
      .maybeSingle(); // Remove .eq("published", true) to load even if not published

    if (fetchError) {
      console.error('[ContentContext] Error loading published content:', fetchError);
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    console.log('[ContentContext] Loaded published content:', {
      hasData: !!data,
      published: data?.published,
      hasPublishedContent: !!data?.published_content,
      ctaBackgroundImage: data?.published_content?.cta?.backgroundImage,
    });

    applyRemoteContent(data as CmsPageRow | null, "published");
    setIsLoading(false);
  }, [applyRemoteContent]);

  const loadAdminContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('[ContentContext] Loading admin content (draft mode)');
    const { data, error: fetchError } = await supabase
      .from("cms_pages")
      .select("draft_content, published_content, published, updated_at, published_at")
      .eq("slug", CMS_SLUG)
      .maybeSingle();

    if (fetchError) {
      console.error('[ContentContext] Error loading admin content:', fetchError);
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    console.log('[ContentContext] Admin content loaded:', { 
      hasData: !!data, 
      hasDraft: !!data?.draft_content, 
      hasPublished: !!data?.published_content 
    });
    applyRemoteContent(data as CmsPageRow | null, "admin");
    setIsLoading(false);
  }, [applyRemoteContent]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const payload = serializeContent(content);
    const { data, error: saveError } = await supabase
      .from("cms_pages")
      .upsert(
        {
          slug: CMS_SLUG,
          draft_content: payload,
        },
        { onConflict: "slug" },
      )
      .select("published, updated_at, published_at")
      .single();

    if (saveError) {
      setError(saveError.message);
      setIsSaving(false);
      return;
    }

    setPublished(data?.published ?? published);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);
    setIsSaving(false);
  }, [content, published, serializeContent]);

  const publishContent = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const payload = serializeContent(content);
    const { data, error: publishError } = await supabase
      .from("cms_pages")
      .upsert(
        {
          slug: CMS_SLUG,
          draft_content: payload,
          published_content: payload,
          published: true,
        },
        { onConflict: "slug" },
      )
      .select("published, updated_at, published_at")
      .single();

    if (publishError) {
      setError(publishError.message);
      setIsSaving(false);
      return;
    }

    setPublished(data?.published ?? true);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);
    setIsSaving(false);
  }, [content, serializeContent]);

  useEffect(() => {
    console.log('[ContentContext] useEffect triggered', { isAdminRoute, isPreviewDraft, pathname });
    if (isAdminRoute) {
      console.log('[ContentContext] Admin route detected, skipping content load');
      return;
    }
    if (isPreviewDraft) {
      console.log('[ContentContext] Preview draft mode detected, loading admin content');
      loadAdminContent();
      return;
    }
    console.log('[ContentContext] Loading published content');
    loadPublishedContent();
  }, [isAdminRoute, isPreviewDraft, loadAdminContent, loadPublishedContent, pathname]);

  // Listen for content updates from admin
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleContentSaved = () => {
      console.log('[ContentContext] Content saved event received, reloading content');
      if (!isPreviewDraft && !isAdminRoute) {
        loadPublishedContent();
      }
    };
    
    window.addEventListener('content-saved', handleContentSaved);
    return () => window.removeEventListener('content-saved', handleContentSaved);
  }, [isPreviewDraft, isAdminRoute, loadPublishedContent]);

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        resetContent,
        isLoading,
        isSaving,
        error,
        published,
        lastUpdatedAt,
        lastPublishedAt,
        loadPublishedContent,
        loadAdminContent,
        saveDraft,
        publishContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
