"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const CMS_SLUG = "careers";

// Careers page content structure
export interface CareersContentState {
  whyOpusFesta: {
    hero: {
      headline: string;
      description: string;
      ctaText: string;
      ctaLink: string;
    };
    reasons: {
      headline: string;
      items: {
        title: string;
        description: string;
        icon: string;
      }[];
    };
    difference: {
      headline: string;
      description: string;
      items: {
        title: string;
        description: string;
      }[];
    };
    vision: {
      headline: string;
      paragraphs: string[];
    };
    cta: {
      headline: string;
      description: string;
      buttonText: string;
      buttonLink: string;
    };
  };
  hero: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string | null;
    carouselImages: string[];
  };
  stats: {
    teamMembers: string;
    openPositions: string;
    locations: string;
    founded: string;
  };
  story: {
    headline: string;
    paragraphs: string[];
    image: string | null;
    linkText: string;
    linkUrl: string;
  };
  diversity: {
    quote: string;
    backgroundImage: string | null;
  };
  testimonials: {
    headline: string;
    items: {
      quote: string;
      name: string;
      role: string;
    }[];
  };
  culture: {
    headline: string;
    paragraphs: string[];
  };
  values: {
    headline: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  perks: {
    headline: string;
    description: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  valuesInAction: {
    headline: string;
    affinityGroups: {
      title: string;
      description: string;
    };
    nonprofits: {
      title: string;
      description: string;
    };
    socialImpact: {
      title: string;
      description: string;
      programs: {
        title: string;
        description: string;
      }[];
    };
  };
  process: {
    headline: string;
    subheadline: string;
    steps: {
      id: number;
      title: string;
      description: string;
    }[];
  };
  video: {
    title: string;
    image: string | null;
    videoUrl: string | null;
  };
}

// Initial content - must match website context exactly
const INITIAL_CONTENT: CareersContentState = {
  whyOpusFesta: {
    hero: {
      headline: "Why you should join us\nBuild something meaningful",
      description: "At OpusFesta, you'll build products that matter to real people, work with cutting-edge technology, and grow your career while making a meaningful impact on Tanzanian celebrations.",
      ctaText: "View Open Positions",
      ctaLink: "/careers/positions",
    },
    reasons: {
      headline: "Why work at OpusFesta",
      items: [
        {
          icon: "rocket",
          title: "Build Something Meaningful",
          description: "Every line of code you write, every feature you ship, directly impacts real couples planning their most important celebrations. You're not building another app—you're helping families create memories that last a lifetime.",
        },
        {
          icon: "trending",
          title: "Rapid Growth & Impact",
          description: "We're one of Tanzania's fastest-growing tech companies. Join us at this pivotal moment and help shape the future of event planning across the country. Your work will reach thousands of users from day one.",
        },
        {
          icon: "code",
          title: "Modern Tech Stack",
          description: "Work with cutting-edge technologies and best practices. We use TypeScript, Next.js, React, and modern cloud infrastructure. You'll build scalable systems while learning from experienced engineers.",
        },
        {
          icon: "users",
          title: "Collaborative Culture",
          description: "We believe great products come from great teams. You'll work alongside passionate, talented people who care about quality, user experience, and making a real difference. No egos, just great work.",
        },
        {
          icon: "lightbulb",
          title: "Ownership & Autonomy",
          description: "Take ownership of features from concept to launch. We trust you to make decisions, experiment, and learn. Your ideas matter, and you'll see them come to life quickly without layers of bureaucracy.",
        },
        {
          icon: "award",
          title: "Career Growth",
          description: "We invest in your growth. Whether you want to become a technical lead, explore new domains, or build expertise in specific areas, we provide the opportunities, mentorship, and resources to help you succeed.",
        },
      ],
    },
    difference: {
      headline: "What makes us different",
      description: "We're not just another tech company. We're building something unique for Tanzania, and that means unique opportunities for you.",
      items: [
        {
          title: "Tanzania-First Approach",
          description: "We're not adapting a foreign product—we're building specifically for the Tanzanian market. You'll work on features like mobile money integration, Swahili language support, and cultural event planning that truly serve our users.",
        },
        {
          title: "Real User Connection",
          description: "We regularly talk to couples, vendors, and families. You'll see firsthand how your work makes a difference. This isn't abstract—you'll hear stories of celebrations made easier because of what you built.",
        },
        {
          title: "Fast-Paced Learning",
          description: "In a startup environment, you wear multiple hats and learn quickly. One day you might be optimizing database queries, the next you're designing a new feature. You'll grow faster here than anywhere else.",
        },
        {
          title: "Work-Life Balance",
          description: "We work hard, but we also respect boundaries. We believe sustainable pace leads to better products and happier teams. Flexible hours and remote-friendly policies help you do your best work.",
        },
      ],
    },
    vision: {
      headline: "Building the future of celebrations",
      paragraphs: [
        "We envision a future where planning any celebration—from intimate weddings to grand sherehe—is seamless, accessible, and joyful. We're building the platform that makes this possible, and we need talented people like you to help us get there.",
        "Whether you're a seasoned engineer, a designer passionate about user experience, or someone early in their career looking to make an impact, there's a place for you here. We're building something special, and we'd love for you to be part of it.",
      ],
    },
    cta: {
      headline: "Ready to join us?",
      description: "Check out our open positions and see where you can make an impact. We're always looking for talented, passionate people who want to build something meaningful.",
      buttonText: "View Open Positions",
      buttonLink: "/careers/positions",
    },
  },
  hero: {
    title: "Build the future\nof Event Planning",
    description: "We believe that when every person and business can tailor event planning to their unique needs, the world becomes better at celebrating life's moments. Our mission is to make that vision a reality.",
    buttonText: "View open positions",
    buttonLink: "/careers/positions",
    image: null,
    carouselImages: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&q=80"
    ],
  },
  stats: {
    teamMembers: "50+",
    openPositions: "10+",
    locations: "3",
    founded: "2023",
  },
  story: {
    headline: "Our story",
    paragraphs: [
      "Early event planning pioneers envisioned a future where technology could amplify our ability to celebrate life's moments, extend our creativity, and help us organize events in ways never before seen. This is the type of platform we want to build together at OpusFesta — one that gives you the tools you can mold and shape to solve your event planning needs your way.",
      "We've heard OpusFesta described many ways. It can be as simple as finding the perfect vendor for your wedding. It can be as complex as managing a multi-day event with hundreds of guests. But at its core, OpusFesta is a toolbox of event planning tools that let you manage your celebrations however you find most useful. To make this possible, we've brought together a diverse team of individuals passionate about events, technology, culture, design, music, and craft. Today, we're growing faster than ever across Tanzania 🇹🇿",
    ],
    image: null,
    linkText: "Browse open positions",
    linkUrl: "/careers/positions",
  },
  diversity: {
    quote: "We believe the best companies bring together diversity in race, age, physical and mental ability, sexuality, gender identity, ethnicity, perspectives and ideas. And people do their best work when they feel like they belong — included, valued, and equal. This is the OpusFesta we want to build, where everyone brings their full selves to work knowing that they'll be heard, championed, and supported to succeed. We hope you'll join us.",
    backgroundImage: null,
  },
  testimonials: {
    headline: "Employee Experience",
    items: [
      {
        quote: "Working at OpusFesta has been an incredible journey. The team's passion for making event planning accessible to everyone in Tanzania is truly inspiring.",
        name: "Sarah Mwangi",
        role: "Senior Product Designer",
      },
    ],
  },
  culture: {
    headline: "☕ Office culture",
    paragraphs: [
      "OpusFesta is an in-person company, and currently requires its employees to come to the office for two Anchor Days (Mondays & Thursdays) and requests that employees spend the majority of the week in the office (including a third day).",
      "Being an in-office-focused company enables us to capitalize on the energy that comes from us being in the same place. This is a great opportunity to build relationships, work with your teammates, and collaborate on projects. Teams have started adding a third in-office day for team-based work for things such as group maker time, brainstorm sessions, team bonding, and more!",
    ],
  },
  values: {
    headline: "Our values",
    items: [
      {
        title: "We are drivers of our mission.",
        description: "We're driven by our commitment to empower every person in Tanzania to plan and celebrate their events exactly the way they want.",
      },
      {
        title: "Be a pace setter.",
        description: "We move with urgency so we can set the cadence for our market, cover more ground, and ship more great products and programs for our users, faster.",
      },
      {
        title: "Be a truth seeker.",
        description: "We pursue the best data, ideas, and solutions with rigor and open-mindedness, always guided by our users' most pressing needs.",
      },
      {
        title: "Be kind and direct.",
        description: "We deliver feedback in the spirit of helping our colleagues improve, balancing sensitivity with caring honesty. We're in this together.",
      },
    ],
  },
  perks: {
    headline: "The upside",
    description: "OpusFesta is committed to providing highly competitive, innovative, and inclusive benefits offering that attracts the best talent from diverse backgrounds. We aim for all our programs to promote overall employee health.*",
    items: [
      {
        title: "Medical, dental & vision",
        description: "We offer competitive medical, dental, vision insurance for employees and dependents. This includes medical, dental, and vision premiums.",
        icon: "🏥",
      },
      {
        title: "Time off",
        description: "We want you to take time off to rest and rejuvenate. OpusFesta offers flexible paid vacation as well as 10+ observed holidays by country.",
        icon: "☂️",
      },
      {
        title: "Mental health & wellbeing",
        description: "You and your dependents will have access to providers that create personalized treatment plans, including therapy, coaching, medication management, and EAP services.",
        icon: "❤️",
      },
      {
        title: "Parental leave",
        description: "We offer biological, adoptive, and foster parents paid time off to spend quality time with family.",
        icon: "👶",
      },
      {
        title: "Fertility coverage",
        description: "Our fertility benefit gives you employer-sponsored funds you can use to pay for fertility treatments and family-forming services.",
        icon: "💝",
      },
      {
        title: "Retirement matching",
        description: "OpusFesta makes it easy to save money for retirement. There's also employer matching!",
        icon: "🐷",
      },
    ],
  },
  valuesInAction: {
    headline: "Our values in action",
    affinityGroups: {
      title: "Affinity groups",
      description: "OpusFesta is home to a number of employee-led groups that foster a diverse and inclusive workplace. So far, these include: Accessibility at OpusFesta, All Asians and Pacific Islanders at OpusFesta, Black Thought at OpusFesta, Gente (LatinX) at OpusFesta, Immigrants at OpusFesta, Queers & Allies at OpusFesta, Parents at OpusFesta, Women at OpusFesta.",
    },
    nonprofits: {
      title: "OpusFesta for Nonprofits",
      description: "It's vital that we also support our beliefs with the OpusFesta product itself. That's why we give 501(c)3 organizations working to solve the world's toughest problems 50% off our team plan.",
    },
    socialImpact: {
      title: "Social impact",
      description: "We run several programs and partnerships dedicated to inclusion, diversity, equity, and antiracism. Here are just a few of the organizations we support:",
      programs: [
        {
          title: "Volunteering at Local Events",
          description: "We help students from under-resourced backgrounds find their voices as event planners and artists.",
        },
        {
          title: "Tech Education Programs",
          description: "We reach more veterans, women, and people of color looking to pivot into careers in the tech industry.",
        },
        {
          title: "Community Tech Connect",
          description: "We support tech events focused on networking and development opportunities for communities of color.",
        },
      ],
    },
  },
  process: {
    headline: "The Journey",
    subheadline: "How we hire",
    steps: [
      { id: 1, title: "Application", description: "Submit your application through our portal. Tell us about your experience building products that matter to real people." },
      { id: 2, title: "Initial Review", description: "Our team reviews your application and portfolio. We're looking for people who understand the Tanzanian market and care about making celebrations accessible." },
      { id: 3, title: "Interview", description: "A conversation about your experience, our mission, and how you'd contribute to building Tanzania's go-to wedding & events marketplace." },
      { id: 4, title: "Team Meeting", description: "Meet the wider team to discuss collaboration, our values, and how we work together to serve couples and vendors across Tanzania." },
      { id: 5, title: "Offer", description: "We extend a competitive offer and welcome you to help us transform how Tanzanians plan and celebrate their most important moments." }
    ],
  },
  video: {
    title: "Life at OpusFesta",
    image: null,
    videoUrl: null,
  },
};

type CmsPageRow = {
  draft_content: CareersContentState | null;
  published_content: CareersContentState | null;
  published: boolean;
  updated_at: string | null;
  published_at: string | null;
};

interface CareersContentContextType {
  content: CareersContentState;
  updateContent: (updater: (prev: CareersContentState) => CareersContentState) => void;
  resetContent: () => void;
  syncWithInitialContent: () => Promise<void>;
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

const CareersContentContext = createContext<CareersContentContextType | undefined>(undefined);

function serializeContent(content: CareersContentState): any {
  return JSON.parse(JSON.stringify(content));
}

function deserializeContent(data: any): CareersContentState {
  return data as CareersContentState;
}

export function CareersContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CareersContentState>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminRoute = pathname?.startsWith("/editor/careers");
  const isPreviewDraft = searchParams?.get("preview") === "draft";

  const mergeContent = useCallback((remote: CareersContentState | null): CareersContentState => {
    if (!remote) return INITIAL_CONTENT;
    
    // Deep merge with initial content as fallback
    return {
      whyOpusFesta: {
        ...INITIAL_CONTENT.whyOpusFesta,
        ...remote.whyOpusFesta,
        hero: { ...INITIAL_CONTENT.whyOpusFesta.hero, ...(remote.whyOpusFesta?.hero || {}) },
        reasons: {
          ...INITIAL_CONTENT.whyOpusFesta.reasons,
          ...(remote.whyOpusFesta?.reasons || {}),
          items: remote.whyOpusFesta?.reasons?.items?.length
            ? remote.whyOpusFesta.reasons.items
            : INITIAL_CONTENT.whyOpusFesta.reasons.items,
        },
        difference: {
          ...INITIAL_CONTENT.whyOpusFesta.difference,
          ...(remote.whyOpusFesta?.difference || {}),
          items: remote.whyOpusFesta?.difference?.items?.length
            ? remote.whyOpusFesta.difference.items
            : INITIAL_CONTENT.whyOpusFesta.difference.items,
        },
        vision: {
          ...INITIAL_CONTENT.whyOpusFesta.vision,
          ...(remote.whyOpusFesta?.vision || {}),
          paragraphs: remote.whyOpusFesta?.vision?.paragraphs?.length
            ? remote.whyOpusFesta.vision.paragraphs
            : INITIAL_CONTENT.whyOpusFesta.vision.paragraphs,
        },
        cta: { ...INITIAL_CONTENT.whyOpusFesta.cta, ...(remote.whyOpusFesta?.cta || {}) },
      },
      hero: { 
        ...INITIAL_CONTENT.hero, 
        ...remote.hero,
        carouselImages: remote.hero?.carouselImages && remote.hero.carouselImages.length > 0 
          ? remote.hero.carouselImages 
          : INITIAL_CONTENT.hero.carouselImages
      },
      stats: { ...INITIAL_CONTENT.stats, ...(remote.stats || {}) },
      story: { ...INITIAL_CONTENT.story, ...(remote.story || {}) },
      diversity: { ...INITIAL_CONTENT.diversity, ...(remote.diversity || {}) },
      testimonials: { ...INITIAL_CONTENT.testimonials, ...remote.testimonials },
      culture: { ...INITIAL_CONTENT.culture, ...(remote.culture || {}) },
      values: { ...INITIAL_CONTENT.values, ...remote.values },
      perks: { ...INITIAL_CONTENT.perks, ...remote.perks },
      valuesInAction: { ...INITIAL_CONTENT.valuesInAction, ...(remote.valuesInAction || {}) },
      process: { ...INITIAL_CONTENT.process, ...(remote.process || {}) },
      video: { ...INITIAL_CONTENT.video, ...(remote.video || {}) },
    };
  }, []);

  const applyRemoteContent = useCallback((row?: CmsPageRow | null, mode?: "published" | "admin") => {
    const source = mode === "published" ? row?.published_content : row?.draft_content;
    const nextContent = source ? deserializeContent(source) : null;

    if (nextContent) {
      setContent(mergeContent(nextContent));
    } else {
      // If no database content, use INITIAL_CONTENT
      setContent(INITIAL_CONTENT);
    }

    if (row) {
      setPublished(row.published ?? false);
      setLastUpdatedAt(row.updated_at ?? null);
      setLastPublishedAt(row.published_at ?? null);
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

    // Check if database content exists and if it's outdated
    const hasDatabaseContent = data?.draft_content !== null;
    const remoteContent = data?.draft_content ? deserializeContent(data.draft_content) : null;
    
    // Check if content is outdated (multiple checks)
    const isHeroOutdated = remoteContent && remoteContent.hero?.title === "Careers at OpusFesta";
    const isPerksOutdated = remoteContent && (
      !remoteContent.perks?.items || 
      remoteContent.perks.items.length === 0 ||
      remoteContent.perks.items[0]?.title !== "Medical, dental & vision" ||
      remoteContent.perks.headline !== "The upside" ||
      remoteContent.perks.items.length !== 6 ||
      remoteContent.perks.items.some((item: any) => item.title === "Commuter benefits" || item.title === "Monthly stipend")
    );
    const isTestimonialsOutdated = remoteContent && (
      !remoteContent.testimonials?.items ||
      remoteContent.testimonials.items.length === 0 ||
      remoteContent.testimonials.headline !== "Employee Experience"
    );
    const isOutdated = isHeroOutdated || isPerksOutdated || isTestimonialsOutdated;
    
    // If content is outdated or missing, auto-sync with INITIAL_CONTENT
    if (isOutdated || !hasDatabaseContent) {
      // Sync with INITIAL_CONTENT
      const payload = serializeContent(INITIAL_CONTENT);
      const { data: syncData, error: syncError } = await supabase
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
      
      if (!syncError) {
        // Load the synced content
        setContent(INITIAL_CONTENT);
        setPublished(syncData?.published ?? false);
        setLastUpdatedAt(syncData?.updated_at ?? null);
        setLastPublishedAt(syncData?.published_at ?? null);
        setIsLoading(false);
        
        // Dispatch event to refresh preview
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('content-saved'));
        }
        return;
      }
    }

    applyRemoteContent(data as CmsPageRow | null, "admin");
    setIsLoading(false);
  }, [applyRemoteContent, serializeContent]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      console.log('[CareersContentContext] Saving draft...', { contentKeys: Object.keys(content) });
      const payload = serializeContent(content);
      console.log('[CareersContentContext] Serialized payload size:', JSON.stringify(payload).length, 'bytes');
      
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
        console.error('[CareersContentContext] Error saving draft:', saveError);
        setError(saveError.message);
        setIsSaving(false);
        
        // Show error toast
        if (typeof window !== 'undefined') {
          const { toast } = await import('@/lib/toast');
          toast.error(`Failed to save: ${saveError.message}`);
        }
        return;
      }

      setPublished(data?.published ?? published);
      setLastUpdatedAt(data?.updated_at ?? null);
      setLastPublishedAt(data?.published_at ?? null);
      setIsSaving(false);
      
      // Show success toast
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Draft saved successfully');
      }
      
      // Dispatch event to refresh preview
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('content-saved'));
      }
    } catch (err) {
      console.error('[CareersContentContext] Unexpected error saving draft:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsSaving(false);
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.error(`Failed to save: ${errorMessage}`);
      }
    }
  }, [content, published, serializeContent]);

  const publishContent = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
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
        console.error('[CareersContentContext] Error publishing content:', publishError);
        setError(publishError.message);
        setIsSaving(false);
        
        // Show error toast
        if (typeof window !== 'undefined') {
          const { toast } = await import('@/lib/toast');
          toast.error(`Failed to publish: ${publishError.message}`);
        }
        return;
      }

      setPublished(data?.published ?? true);
      setLastUpdatedAt(data?.updated_at ?? null);
      setLastPublishedAt(data?.published_at ?? null);
      setIsSaving(false);
      
      // Show success toast
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Content published successfully');
      }
      
      // Dispatch event to refresh preview
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('content-saved'));
      }
    } catch (err) {
      console.error('[CareersContentContext] Unexpected error publishing content:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsSaving(false);
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.error(`Failed to publish: ${errorMessage}`);
      }
    }
  }, [content, serializeContent]);

  const updateContent = useCallback((updater: (prev: CareersContentState) => CareersContentState) => {
    setContent(updater);
  }, []);

  const resetContent = useCallback(() => {
    setContent(INITIAL_CONTENT);
  }, []);

  const syncWithInitialContent = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Set content to INITIAL_CONTENT first
      setContent(INITIAL_CONTENT);

      // Save INITIAL_CONTENT to database
      const payload = serializeContent(INITIAL_CONTENT);
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
        console.error('[CareersContentContext] Error syncing with initial content:', saveError);
        setError(saveError.message);
        setIsSaving(false);
        
        // Show error toast
        if (typeof window !== 'undefined') {
          const { toast } = await import('@/lib/toast');
          toast.error(`Failed to sync: ${saveError.message}`);
        }
        return;
      }

      setPublished(data?.published ?? false);
      setLastUpdatedAt(data?.updated_at ?? null);
      setLastPublishedAt(data?.published_at ?? null);
      setIsSaving(false);
      
      // Show success toast
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Content synced with current page data');
      }
      
      // Dispatch event to refresh preview
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('content-saved'));
      }
    } catch (err) {
      console.error('[CareersContentContext] Unexpected error syncing content:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsSaving(false);
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.error(`Failed to sync: ${errorMessage}`);
      }
    }
  }, [serializeContent]);

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
    <CareersContentContext.Provider
      value={{
        content,
        updateContent,
        resetContent,
        syncWithInitialContent,
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
    </CareersContentContext.Provider>
  );
}

export function useCareersContent() {
  const context = useContext(CareersContentContext);
  if (context === undefined) {
    throw new Error("useCareersContent must be used within a CareersContentProvider");
  }
  return context;
}
