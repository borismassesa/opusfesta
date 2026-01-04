"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, PanelLeftClose, PanelLeftOpen, Sparkles, Info, Briefcase, Users, Lightbulb, MessageSquare, HelpCircle, Megaphone, Share2 } from "lucide-react";
import PageEditor from "./pages/page";
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
  
  // Secondary sidebar collapse state with localStorage persistence
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-secondary-sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  // Persist collapse state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-secondary-sidebar-collapsed', String(isSecondarySidebarCollapsed));
    }
  }, [isSecondarySidebarCollapsed]);

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

  // Get the preview URL - this should point to your website app homepage (not vendor-portal or admin)
  // The website app runs on port 3002 (Next.js will use next available port if 3000 is taken)
  // Set NEXT_PUBLIC_WEBSITE_URL to override (e.g., http://localhost:3002)
  // IMPORTANT: This must point to the website app's homepage (/) with ?preview=draft
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002';
  // Ensure we're pointing to the root path of the website app, not /admin
  const previewUrl = `${websiteUrl.replace(/\/$/, '')}/?preview=draft&v=${previewNonce}`;
  
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
      {/* Secondary Sidebar - Supabase Style */}
      <aside 
        className={cn(
          "border-r border-border bg-background flex-shrink-0 flex flex-col transition-all duration-200 ease-in-out",
          isSecondarySidebarCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-56 lg:w-64 xl:w-72",
          !isSecondarySidebarCollapsed && "h-auto lg:self-start lg:max-h-[calc(100vh-4rem)]"
        )}
      >
        {/* Title Header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className={cn(
            "text-base font-semibold text-foreground transition-opacity duration-200 whitespace-nowrap",
            isSecondarySidebarCollapsed && "opacity-0 w-0 overflow-hidden"
          )}>
            Content
          </h2>
          <button
            onClick={() => setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed)}
            className={cn(
              "w-8 h-8 rounded-lg bg-card border border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center flex-shrink-0",
              isSecondarySidebarCollapsed && "ml-0"
            )}
            title={isSecondarySidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSecondarySidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Navigation Groups */}
        <nav className={cn(
          "px-3 py-3 transition-opacity duration-200",
          isSecondarySidebarCollapsed && "opacity-0 overflow-hidden",
          !isSecondarySidebarCollapsed && "overflow-y-auto",
          "lg:max-h-[calc(100vh-12rem)]"
        )}>
          {CONTENT_NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex < CONTENT_NAV_GROUPS.length - 1 ? "mb-5" : "mb-0")}>
              <div className="px-3 mb-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </h3>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id as SectionId)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "!bg-foreground !text-background font-medium shadow-md"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "!text-background" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "truncate",
                        isActive && "!text-background"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Floating Expand Button - Shows when sidebar is collapsed */}
      {isSecondarySidebarCollapsed && (
        <button
          onClick={() => setIsSecondarySidebarCollapsed(false)}
          className="absolute left-0 top-4 z-10 w-8 h-8 rounded-r-lg bg-card border border-l-0 border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Main Content Area */}
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
