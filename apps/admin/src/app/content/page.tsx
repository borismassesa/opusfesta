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

  const sectionOptions = CONTENT_NAV_GROUPS.flatMap((group) => group.items);

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background relative w-full flex-col md:flex-row">
      {/* Mobile: section dropdown */}
      <div className="md:hidden border-b border-border/60 bg-background px-3 py-2 flex-shrink-0">
        <label className="sr-only" htmlFor="content-section-select">
          Section
        </label>
        <select
          id="content-section-select"
          value={activeSection}
          onChange={(e) => handleSectionClick(e.target.value as SectionId)}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
        >
          {sectionOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Secondary left sidebar - section nav */}
      <aside className="hidden md:flex md:w-48 lg:w-56 flex-shrink-0 flex-col border-r border-border bg-background/95 overflow-hidden">
        <div className="px-3 py-4 border-b border-border/60 flex-shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sections
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {CONTENT_NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-2 mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id as SectionId)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left",
                        isActive
                          ? "bg-foreground text-background font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-background" : "text-muted-foreground"
                      )} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-background flex flex-col max-w-full">
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
