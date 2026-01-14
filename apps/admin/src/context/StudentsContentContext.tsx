"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const CMS_SLUG = "careers-students";

// Students page content structure
export interface StudentsContentState {
  header: {
    title: string;
    description: string;
    label: string;
  };
  profiles: {
    id: number;
    name: string;
    image: string;
    filter?: string;
    role?: string;
    quote?: string;
    achievement?: string;
  }[];
  opportunities: {
    icon: string; // Icon name (e.g., "GraduationCap")
    title: string;
    description: string;
  }[];
  benefits: {
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  timeline: {
    headline: string;
    steps: {
      id: number;
      title: string;
      description: string;
    }[];
  };
}

// Initial content
const INITIAL_CONTENT: StudentsContentState = {
  header: {
    title: "Meet Our Students",
    description: "Join a community of talented students building the future of event planning in Tanzania. Gain real-world experience, work on meaningful projects, and grow your career with us.",
    label: "Meet Our Students",
  },
  profiles: [
    {
      id: 1,
      name: "Amina Hassan",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      filter: "grayscale(100%) contrast(120%)",
      role: "Software Engineering Intern",
      quote: "Working at OpusFesta has been transformative. I've built features used by thousands of couples planning their weddings.",
      achievement: "Led development of vendor search feature",
    },
    {
      id: 2,
      name: "James Mwangi",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
      filter: "sepia(20%) contrast(110%)",
      role: "Computer Science Student",
      quote: "The mentorship I received helped me grow from a junior developer to someone who can lead projects confidently.",
      achievement: "Part-time Frontend Developer",
    },
    {
      id: 3,
      name: "Fatuma Juma",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop",
      filter: "grayscale(100%)",
      role: "Product Design Intern",
      quote: "I love how my designs directly impact real users. Seeing couples use features I designed is incredibly rewarding.",
      achievement: "Designed booking inquiry flow",
    },
    {
      id: 4,
      name: "David Kimathi",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
      filter: "contrast(110%) saturate(110%)",
      role: "Data Science Student",
      quote: "The flexible schedule allowed me to balance my studies while working on meaningful data projects.",
      achievement: "Built analytics dashboard",
    },
    {
      id: 5,
      name: "Sarah Otieno",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
      filter: "grayscale(100%)",
      role: "Marketing Intern",
      quote: "I've learned so much about product marketing and user engagement. The team is supportive and always willing to teach.",
      achievement: "Increased student engagement by 40%",
    },
    {
      id: 6,
      name: "Peter Njoroge",
      image: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=1000&auto=format&fit=crop",
      filter: "",
      role: "Backend Engineering Intern",
      quote: "The codebase is modern and well-structured. I've learned industry best practices I'll use throughout my career.",
      achievement: "Optimized payment processing API",
    },
    {
      id: 7,
      name: "Grace Wanjiru",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      filter: "sepia(50%)",
      role: "Full-Stack Developer",
      quote: "Working here has been the perfect bridge between university and my career. Real projects, real impact, real growth.",
      achievement: "Full-time offer after internship",
    },
  ],
  opportunities: [
    {
      icon: "GraduationCap",
      title: "Internships",
      description: "Gain real-world experience working on projects that matter. Our internships offer hands-on learning opportunities in a supportive environment.",
    },
    {
      icon: "Briefcase",
      title: "Part-Time Positions",
      description: "Balance your studies with meaningful work. We offer flexible part-time positions that fit around your academic schedule.",
    },
    {
      icon: "Lightbulb",
      title: "Project-Based Work",
      description: "Work on exciting projects that challenge you and help you grow. Perfect for building your portfolio while contributing to real products.",
    },
    {
      icon: "Users",
      title: "Mentorship",
      description: "Learn from experienced professionals who are passionate about helping you succeed. Get guidance on your career path and technical skills.",
    },
  ],
  benefits: [
    {
      title: "Flexible Schedule",
      description: "We understand you have classes and exams. We work around your academic commitments.",
    },
    {
      title: "Real Impact",
      description: "Your work directly contributes to products used by thousands of people across Tanzania.",
    },
    {
      title: "Skill Development",
      description: "Learn industry best practices, modern tools, and gain experience that sets you apart.",
    },
    {
      title: "Network Building",
      description: "Connect with professionals in the tech industry and build relationships that last beyond your time with us.",
    },
  ],
  faq: [
    {
      question: "What types of opportunities are available for students?",
      answer: "We offer internships, part-time positions, project-based work, and mentorship programs. Each opportunity is designed to fit around your academic schedule while providing meaningful work experience.",
    },
    {
      question: "Do I need prior work experience?",
      answer: "No prior work experience is required. We're looking for students who are passionate, eager to learn, and excited about building products that matter.",
    },
    {
      question: "What is the time commitment?",
      answer: "Time commitments vary by opportunity. Internships typically require 20-40 hours per week, while part-time positions can be as flexible as 10-20 hours per week. We work around your class schedule.",
    },
    {
      question: "Will I get paid?",
      answer: "Yes, all our student opportunities are paid positions. We believe in compensating students fairly for their contributions.",
    },
    {
      question: "What technologies will I work with?",
      answer: "You'll work with modern technologies including React, TypeScript, Node.js, PostgreSQL, and various cloud services. We provide training and mentorship to help you learn.",
    },
    {
      question: "How do I apply?",
      answer: "You can apply through our careers portal. Click the 'Apply Now' button on any student opportunity page, fill out the application form, and submit your resume and portfolio.",
    },
  ],
  timeline: {
    headline: "How to Apply",
    steps: [
      {
        id: 1,
        title: "Browse Opportunities",
        description: "Explore our available student positions and find one that matches your interests and skills.",
      },
      {
        id: 2,
        title: "Submit Application",
        description: "Fill out our application form with your details, resume, and portfolio. Tell us why you're excited about this opportunity.",
      },
      {
        id: 3,
        title: "Initial Review",
        description: "Our team reviews your application. If you're a good fit, we'll reach out within 1-2 weeks.",
      },
      {
        id: 4,
        title: "Interview",
        description: "We'll schedule a casual conversation to learn more about you, your goals, and how we can help you grow.",
      },
      {
        id: 5,
        title: "Welcome Aboard",
        description: "If selected, you'll receive an offer and join our team. We'll help you get set up and introduce you to your mentor.",
      },
    ],
  },
};

type StudentsContentContextType = {
  content: StudentsContentState;
  updateContent: (updater: (prev: StudentsContentState) => StudentsContentState) => void;
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
};

const StudentsContentContext = createContext<StudentsContentContextType | undefined>(undefined);

function serializeContent(content: StudentsContentState): any {
  return content;
}

function deserializeContent(data: any): StudentsContentState {
  if (!data) return INITIAL_CONTENT;
  
  // Merge with initial content to ensure all fields exist
  return {
    ...INITIAL_CONTENT,
    ...data,
    header: { ...INITIAL_CONTENT.header, ...(data.header || {}) },
    profiles: data.profiles || INITIAL_CONTENT.profiles,
    opportunities: data.opportunities || INITIAL_CONTENT.opportunities,
    benefits: data.benefits || INITIAL_CONTENT.benefits,
    faq: data.faq || INITIAL_CONTENT.faq,
    timeline: { ...INITIAL_CONTENT.timeline, ...(data.timeline || {}) },
  };
}

export function StudentsContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<StudentsContentState>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminRoute = pathname?.startsWith("/editor") || pathname?.startsWith("/admin");
  const isPreviewDraft = searchParams?.get("preview") === "draft";

  const updateContent = useCallback((updater: (prev: StudentsContentState) => StudentsContentState) => {
    setContent(updater);
  }, []);

  const resetContent = useCallback(() => {
    setContent(INITIAL_CONTENT);
  }, []);

  const mergeContent = useCallback((remote: StudentsContentState | null): StudentsContentState => {
    if (!remote) return INITIAL_CONTENT;
    return {
      ...INITIAL_CONTENT,
      ...remote,
    };
  }, []);

  const applyRemoteContent = useCallback((row: any, mode?: "published" | "admin") => {
    const contentToUse = mode === "published" ? row?.published_content : row?.draft_content || row?.published_content;
    const nextContent = deserializeContent(contentToUse);
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

    applyRemoteContent(data, "published");
    setPublished(data?.published ?? false);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);
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

    applyRemoteContent(data, "admin");
    setPublished(data?.published ?? false);
    setLastUpdatedAt(data?.updated_at ?? null);
    setLastPublishedAt(data?.published_at ?? null);
    setIsLoading(false);
  }, [applyRemoteContent]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
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
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Draft saved successfully');
        window.dispatchEvent(new CustomEvent('content-saved'));
      }
    } catch (err: any) {
      console.error('[StudentsContentContext] Error saving draft:', err);
      setError(err.message || "Failed to save draft");
      setIsSaving(false);
    }
  }, [content, published]);

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
        setError(publishError.message);
        setIsSaving(false);
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
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Content published successfully');
        window.dispatchEvent(new CustomEvent('content-saved'));
      }
    } catch (err: any) {
      console.error('[StudentsContentContext] Error publishing:', err);
      setError(err.message || "Failed to publish");
      setIsSaving(false);
    }
  }, [content]);

  const syncWithInitialContent = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("cms_pages")
        .select("published_content")
        .eq("slug", CMS_SLUG)
        .eq("published", true)
        .maybeSingle();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const publishedContent = deserializeContent(data?.published_content);
      setContent(publishedContent);
      
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.success('Synced with published content');
      }
    } catch (err: any) {
      console.error('[StudentsContentContext] Error syncing:', err);
      if (typeof window !== 'undefined') {
        const { toast } = await import('@/lib/toast');
        toast.error(`Failed to sync: ${err.message}`);
      }
    }
  }, []);

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
    <StudentsContentContext.Provider
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
    </StudentsContentContext.Provider>
  );
}

export function useStudentsContent() {
  const context = useContext(StudentsContentContext);
  if (context === undefined) {
    throw new Error("useStudentsContent must be used within a StudentsContentProvider");
  }
  return context;
}
