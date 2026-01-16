"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, Sparkles, Info, Briefcase, Users, Lightbulb, MessageSquare, HelpCircle, Megaphone, Share2 } from "lucide-react";
import { PageEditor } from "./components/PageEditor";
import { ResponsivePreview } from "@/components/preview/ResponsivePreview";
import { useContent } from "@/context/ContentContext";
import { cn } from "@/lib/utils";

type SectionId = "hero" | "about" | "services" | "community" | "advice" | "testimonials" | "faq" | "cta" | "social" | "preview";

const CONTENT_NAV_GROUPS = [
  {
    label: "SECTIONS",
    items: [
      { id: "hero" as SectionId, label: "Hero", icon: Sparkles },
      { id: "about" as SectionId, label: "About", icon: Info },
      { id: "services" as SectionId, label: "Services", icon: Briefcase },
      { id: "community" as SectionId, label: "Community", icon: Users },
      { id: "advice" as SectionId, label: "Advice & Ideas", icon: Lightbulb },
      { id: "testimonials" as SectionId, label: "Testimonials", icon: MessageSquare },
      { id: "faq" as SectionId, label: "FAQ", icon: HelpCircle },
      { id: "cta" as SectionId, label: "CTA", icon: Megaphone },
      { id: "social" as SectionId, label: "Social Media", icon: Share2 },
    ],
  },
  {
    label: "PREVIEW",
    items: [
      { id: "preview" as SectionId, label: "Preview", icon: Eye },
    ],
  },
];

export default function ContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadAdminContent, saveDraft, publishContent } = useContent();
  const sectionParam = searchParams.get("section") as SectionId;
  const previewParam = searchParams.get("preview");
  const [activeSection, setActiveSection] = useState<SectionId>(
    previewParam === "true" || previewParam === "1"
      ? "preview"
      : sectionParam && ["hero", "about", "services", "community", "advice", "testimonials", "faq", "cta", "social", "preview"].includes(sectionParam)
      ? sectionParam
      : "hero"
  );
  const [previewNonce, setPreviewNonce] = useState(0);

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  // Refresh preview when content is saved or published
  useEffect(() => {
    const handleContentSaved = () => {
      setPreviewNonce(prev => prev + 1);
    };

    window.addEventListener('content-saved', handleContentSaved);
    return () => {
      window.removeEventListener('content-saved', handleContentSaved);
    };
  }, []);

  useEffect(() => {
    const section = searchParams.get("section") as SectionId;
    const preview = searchParams.get("preview");
    
    if (preview === "true" || preview === "1") {
      setActiveSection("preview");
      if (section !== "preview") {
        router.replace("/content?preview=true", { scroll: false });
      }
    } else if (section && ["hero", "about", "services", "community", "advice", "testimonials", "faq", "cta", "social", "preview"].includes(section)) {
      setActiveSection(section);
    } else if (!section && !preview) {
      router.replace("/content?section=hero", { scroll: false });
    }
  }, [searchParams, router]);

  const handleSectionClick = (section: SectionId) => {
    setActiveSection(section);
    if (section === "preview") {
      router.push(`/content?preview=true`, { scroll: false });
    } else {
      router.push(`/content?section=${section}`, { scroll: false });
    }
  };

  const getWebsiteUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    if (envUrl) return envUrl;
    if (typeof window === "undefined") return "http://localhost:3001";
    try {
      const url = new URL(window.location.origin);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        const currentPort = url.port || "3000";
        url.port = currentPort === "3000" ? "3001" : currentPort === "3001" ? "3000" : "3001";
        return url.toString().replace(/\/$/, "");
      }
      if (url.hostname.startsWith("admin.")) {
        url.hostname = url.hostname.replace(/^admin\./, "");
        return url.toString().replace(/\/$/, "");
      }
      return url.toString().replace(/\/$/, "");
    } catch {
      return "http://localhost:3001";
    }
  };

  // Ensure we're pointing to the root path of the website app, not /admin
  const previewUrl = `${getWebsiteUrl()}/?preview=draft&v=${previewNonce}`;
  
  // Debug: Log the preview URL to help troubleshoot
  useEffect(() => {
    console.log('[Admin Preview] ===========================================');
    console.log('[Admin Preview] Preview URL:', previewUrl);
    console.log('[Admin Preview] Website URL env var:', process.env.NEXT_PUBLIC_WEBSITE_URL || 'not set (using default: localhost:3002)');
    console.log('[Admin Preview] Expected: Website homepage with draft content');
    console.log('[Admin Preview] ===========================================');
  }, [previewUrl]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background relative w-full">
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-background flex flex-col max-w-full">
        <div className="border-b border-border/60 bg-background/90 backdrop-blur-sm">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CONTENT_NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {group.items.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionClick(item.id as SectionId)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                            isActive
                              ? "bg-foreground text-background border-foreground shadow-sm"
                              : "text-muted-foreground border-border hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isActive ? "text-background" : "text-muted-foreground"
                          )} />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {groupIndex < CONTENT_NAV_GROUPS.length - 1 && (
                    <div className="h-5 w-px bg-border/70 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {activeSection === "preview" ? (
          <div className="h-full w-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden p-6">
              <ResponsivePreview 
                previewUrl={previewUrl} 
                previewNonce={previewNonce}
                onRefresh={() => setPreviewNonce(prev => prev + 1)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden">
            <PageEditor activeSection={activeSection as Exclude<SectionId, "preview">} />
          </div>
        )}
      </main>
    </div>
  );
}
