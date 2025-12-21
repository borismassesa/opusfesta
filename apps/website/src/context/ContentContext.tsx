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

export interface ContentState {
  hero: {
    headlinePrefix: string;
    typingPhrases: string[];
    subhead: string;
    slides: HeroSlide[];
  };
  about: {
    stats: {
      weddings: string;
      satisfaction: string;
      guests: string;
      rating: string;
    };
  };
  services: ServiceItem[];
  issues: IssueItem[];
  reviews: ReviewItem[];
  faqs: FAQItem[];
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
    stats: {
      weddings: "Planned Weddings",
      satisfaction: "User Satisfaction",
      guests: "Happy Guests",
      rating: "Average Rating"
    }
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
      question: "What is TheFesta?",
      answer: "TheFesta is a comprehensive wedding and event planning platform that connects couples with curated venues and vendors, while providing powerful tools to manage guest lists, budgets, and timelines."
    },
    {
      question: "Is TheFesta free to use?",
      answer: "Yes, TheFesta is free for couples planning their wedding. We offer a suite of planning tools, including our budget tracker, guest list manager, and checklist, at no cost."
    },
    {
      question: "How do you vet your vendors?",
      answer: "We have a rigorous vetting process. Every vendor on our platform is reviewed for quality, reliability, and professionalism. We also verify reviews to ensure you're getting honest feedback from real couples."
    },
    {
      question: "Can I use TheFesta for events other than weddings?",
      answer: "Absolutely! While our tools are optimized for weddings, many of our users plan engagement parties, bridal showers, anniversary celebrations, and corporate events using our venue marketplace and vendor network."
    },
    {
      question: "Do you offer support if I get stuck?",
      answer: "Our support team is available 7 days a week to assist you. We also have an extensive library of articles and guides in our Advice section to help navigate common planning challenges."
    }
  ]
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
        stats: {
          ...INITIAL_CONTENT.about.stats,
          ...incoming.about?.stats,
        },
      },
      services: incoming.services ?? INITIAL_CONTENT.services,
      issues: incoming.issues ?? INITIAL_CONTENT.issues,
      reviews: incoming.reviews ?? INITIAL_CONTENT.reviews,
      faqs: incoming.faqs ?? INITIAL_CONTENT.faqs,
    };
  }, []);

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
    };
  }, []);

  const applyRemoteContent = useCallback((row?: CmsPageRow | null, mode?: "published" | "admin") => {
    if (!row) {
      return;
    }

    setPublished(row.published ?? false);
    setLastUpdatedAt(row.updated_at ?? null);
    setLastPublishedAt(row.published_at ?? null);

    const nextContent =
      mode === "published"
        ? row.published_content
        : row.draft_content ?? row.published_content;

    if (nextContent) {
      setContent(mergeContent(nextContent));
    }
  }, [mergeContent]);

  const loadPublishedContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("cms_pages")
      .select("published_content, published, updated_at, published_at")
      .eq("slug", CMS_SLUG)
      .eq("published", true)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    applyRemoteContent(data as CmsPageRow | null, "published");
    setIsLoading(false);
  }, [applyRemoteContent]);

  const loadAdminContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("cms_pages")
      .select("draft_content, published_content, published, updated_at, published_at")
      .eq("slug", CMS_SLUG)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

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
    if (isAdminRoute) {
      return;
    }
    if (isPreviewDraft) {
      loadAdminContent();
      return;
    }
    loadPublishedContent();
  }, [isAdminRoute, isPreviewDraft, loadAdminContent, loadPublishedContent]);

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
