"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

const CMS_SLUG = "advice-ideas";

export interface AdviceIdeasGoalItem {
  title: string;
  description: string;
  category: string;
}

export interface AdviceIdeasPageContent {
  hero: {
    title: string;
    subtitle: string;
    formPlaceholder: string;
    buttonText: string;
  };
  latest: {
    label: string;
    title: string;
    description: string;
    ctaText: string;
  };
  trending: {
    label: string;
    title: string;
    description: string;
    ctaText: string;
  };
  browseGoals: {
    label: string;
    title: string;
    description: string;
    items: AdviceIdeasGoalItem[];
  };
  topics: {
    label: string;
    title: string;
    description: string;
  };
  newsletter: {
    label: string;
    title: string;
    description: string;
    buttonText: string;
  };
  blog: {
    label: string;
    title: string;
    description: string;
  };
  cta: {
    label: string;
    title: string;
    description: string;
    buttonText: string;
  };
}

type CmsPageRow = {
  draft_content: AdviceIdeasPageContent | null;
  published_content: AdviceIdeasPageContent | null;
  published: boolean;
  updated_at: string | null;
  published_at: string | null;
};

export const INITIAL_ADVICE_IDEAS_CONTENT: AdviceIdeasPageContent = {
  hero: {
    title: "Wedding Advice and Ideas for a Celebration That Feels Like You.",
    subtitle:
      "Planning guidance, creative inspiration, and practical tips for every stage, from your first checklist to the last dance.",
    formPlaceholder: "Your email",
    buttonText: "Subscribe",
  },
  latest: {
    label: "Latest Stories",
    title: "Fresh advice, new perspectives.",
    description: "The newest planning ideas and guidance from our editorial team.",
    ctaText: "View all stories",
  },
  trending: {
    label: "Trending Guides",
    title: "The most-saved planning reads right now.",
    description: "Deep dives that couples keep bookmarking for later.",
    ctaText: "Browse all guides",
  },
  browseGoals: {
    label: "Browse By Goal",
    title: "Start with the advice that matters most.",
    description: "Choose a focus and jump straight into the guidance you need.",
    items: [
      {
        title: "Build your timeline",
        description: "Month-by-month planning guidance.",
        category: "Planning Timeline",
      },
      {
        title: "Set a realistic budget",
        description: "Smart allocations and saving tips.",
        category: "Budgeting",
      },
      {
        title: "Define your style",
        description: "Color palettes and decor direction.",
        category: "Style & Decor",
      },
      {
        title: "Wow your guests",
        description: "Experience-driven touches they remember.",
        category: "Guest Experience",
      },
    ],
  },
  topics: {
    label: "Popular Topics",
    title: "Explore what couples plan first.",
    description: "Tap into the most-requested planning guidance, from timelines to guest experience.",
  },
  newsletter: {
    label: "Newsletter",
    title: "Get a weekly dose of planning calm.",
    description: "Join the list for timelines, budgeting tools, and fresh ideas every Friday.",
    buttonText: "Join the newsletter",
  },
  blog: {
    label: "Advice",
    title: "Wedding advice for every part of the day.",
    description: "Timelines, budgets, style, and guest experience to guide you from planning to celebration.",
  },
  cta: {
    label: "Newsletter",
    title: "Fresh wedding ideas, planning tips, and vendor insights delivered to your inbox.",
    description:
      "Join couples and planners who get practical guidance, budget tips, and creative inspiration for a celebration that feels like you.",
    buttonText: "Subscribe",
  },
};

interface AdviceIdeasContentContextValue {
  content: AdviceIdeasPageContent;
  updateContent: (section: keyof AdviceIdeasPageContent, data: any) => void;
  resetContent: () => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  published: boolean;
  lastUpdatedAt: string | null;
  lastPublishedAt: string | null;
  loadAdminContent: () => Promise<void>;
  saveDraft: () => Promise<void>;
  publishContent: () => Promise<void>;
}

const AdviceIdeasContentContext = createContext<AdviceIdeasContentContextValue | undefined>(undefined);

export function AdviceIdeasContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<AdviceIdeasPageContent>(INITIAL_ADVICE_IDEAS_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);

  const updateContent = (section: keyof AdviceIdeasPageContent, data: any) => {
    setContent((prev) => {
      if (Array.isArray(prev[section])) {
        return { ...prev, [section]: data } as AdviceIdeasPageContent;
      }
      return {
        ...prev,
        [section]: { ...(prev[section] as any), ...data },
      } as AdviceIdeasPageContent;
    });
  };

  const resetContent = () => {
    setContent(INITIAL_ADVICE_IDEAS_CONTENT);
  };

  const mergeContent = useCallback((incoming?: Partial<AdviceIdeasPageContent> | null) => {
    if (!incoming) return INITIAL_ADVICE_IDEAS_CONTENT;

    return {
      ...INITIAL_ADVICE_IDEAS_CONTENT,
      ...incoming,
      hero: { ...INITIAL_ADVICE_IDEAS_CONTENT.hero, ...incoming.hero },
      latest: { ...INITIAL_ADVICE_IDEAS_CONTENT.latest, ...incoming.latest },
      trending: { ...INITIAL_ADVICE_IDEAS_CONTENT.trending, ...incoming.trending },
      browseGoals: {
        ...INITIAL_ADVICE_IDEAS_CONTENT.browseGoals,
        ...incoming.browseGoals,
        items: incoming.browseGoals?.items ?? INITIAL_ADVICE_IDEAS_CONTENT.browseGoals.items,
      },
      topics: { ...INITIAL_ADVICE_IDEAS_CONTENT.topics, ...incoming.topics },
      newsletter: { ...INITIAL_ADVICE_IDEAS_CONTENT.newsletter, ...incoming.newsletter },
      blog: { ...INITIAL_ADVICE_IDEAS_CONTENT.blog, ...incoming.blog },
      cta: { ...INITIAL_ADVICE_IDEAS_CONTENT.cta, ...incoming.cta },
    };
  }, []);

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

    setPublished(data?.published ?? false);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);

    const nextContent = data?.draft_content ?? data?.published_content;
    setContent(mergeContent(nextContent));
    setIsLoading(false);
  }, [mergeContent]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const { data, error: saveError } = await supabase
      .from("cms_pages")
      .upsert(
        {
          slug: CMS_SLUG,
          draft_content: content,
        },
        { onConflict: "slug" }
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

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("content-saved"));
    }
  }, [content, published]);

  const publishContent = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const { data, error: publishError } = await supabase
      .from("cms_pages")
      .upsert(
        {
          slug: CMS_SLUG,
          draft_content: content,
          published_content: content,
          published: true,
        },
        { onConflict: "slug" }
      )
      .select("published, updated_at, published_at")
      .single();

    if (publishError) {
      const msg =
        publishError.message?.includes("policy") || publishError.message?.includes("row-level security")
          ? "Publish failed. Only owner or admin can publish. Editors can save drafts only."
          : publishError.message;
      setError(msg);
      setIsSaving(false);
      return;
    }

    setPublished(data?.published ?? true);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);
    setIsSaving(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("content-saved"));
    }
  }, [content]);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  return (
    <AdviceIdeasContentContext.Provider
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
        loadAdminContent,
        saveDraft,
        publishContent,
      }}
    >
      {children}
    </AdviceIdeasContentContext.Provider>
  );
}

export const useAdviceIdeasContent = () => {
  const context = useContext(AdviceIdeasContentContext);
  if (!context) {
    throw new Error("useAdviceIdeasContent must be used within AdviceIdeasContentProvider");
  }
  return context;
};
