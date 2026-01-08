"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, PanelLeftClose, PanelLeftOpen, Briefcase, Users, Heart, Trophy, MessageSquare, BarChart3, Play, ArrowDown } from "lucide-react";
import { ResponsivePreview } from "@/components/preview/ResponsivePreview";
import { useCareersContent } from "@/context/CareersContentContext";
import { cn } from "@/lib/utils";
import { CareersPageEditor } from "./components/CareersPageEditor";

type SectionId = "hero" | "values" | "perks" | "testimonials" | "process" | "preview";

const CAREERS_NAV_GROUPS = [
  {
    label: "SECTIONS",
    items: [
      { id: "hero" as SectionId, label: "Hero", icon: Briefcase },
      { id: "values" as SectionId, label: "Values", icon: Trophy },
      { id: "perks" as SectionId, label: "Benefits", icon: Heart },
      { id: "testimonials" as SectionId, label: "Employee Stories", icon: MessageSquare },
      { id: "process" as SectionId, label: "Hiring Process", icon: ArrowDown },
    ],
  },
  {
    label: "PREVIEW",
    items: [
      { id: "preview" as SectionId, label: "Preview", icon: Eye },
    ],
  },
];

export function CareersEditorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadAdminContent, saveDraft, publishContent } = useCareersContent();
  const sectionParam = searchParams.get("section") as SectionId;
  const previewParam = searchParams.get("preview");
  const [activeSection, setActiveSection] = useState<SectionId>(
    previewParam === "true" || previewParam === "1"
      ? "preview"
      : sectionParam && ["hero", "values", "perks", "testimonials", "process", "preview"].includes(sectionParam)
      ? sectionParam
      : "hero"
  );
  const [previewNonce, setPreviewNonce] = useState(0);
  
  // Secondary sidebar collapse state with localStorage persistence
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-careers-editor-sidebar-collapsed');
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
      localStorage.setItem('admin-careers-editor-sidebar-collapsed', String(isSecondarySidebarCollapsed));
    }
  }, [isSecondarySidebarCollapsed]);

  // Refresh preview when content is saved or published
  useEffect(() => {
    const handleContentSaved = () => {
      console.log('[CareersEditor] Content saved event received, refreshing preview');
      
      // Increment previewNonce to force iframe reload
      setPreviewNonce(prev => {
        const newNonce = prev + 1;
        console.log('[CareersEditor] Preview nonce updated:', newNonce);
        return newNonce;
      });
      
      // Small delay to ensure iframe src has updated, then send postMessage
      setTimeout(() => {
        const iframe = document.querySelector('iframe[src*="/careers"]') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage({ type: 'reload-content', timestamp: Date.now() }, '*');
            console.log('[CareersEditor] Sent reload message to iframe');
          } catch (e) {
            console.warn('[CareersEditor] Could not postMessage to iframe:', e);
          }
        }
      }, 100);
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
        router.replace("/editor/careers?preview=true", { scroll: false });
      }
    } else if (section && ["hero", "values", "perks", "testimonials", "process", "preview"].includes(section)) {
      setActiveSection(section);
    } else if (!section && !preview) {
      router.replace("/editor/careers?section=hero", { scroll: false });
    }
  }, [searchParams, router]);

  const handleSectionClick = (section: SectionId) => {
    setActiveSection(section);
    if (section === "preview") {
      router.push(`/editor/careers?preview=true`, { scroll: false });
    } else {
      router.push(`/editor/careers?section=${section}`, { scroll: false });
    }
  };

  // Get the preview URL - this should point to your website app careers page
  // IMPORTANT: This must be an absolute URL pointing to the website app, NOT the admin app
  // Default to port 3002 (website app)
  // The admin app runs on 3001, so the website app should be on a different port
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3002';
  
  // Ensure we're pointing to the careers page of the website app, not the admin app
  // Remove any trailing slashes and ensure it's a clean absolute URL
  const cleanWebsiteUrl = websiteUrl.replace(/\/$/, '');
  const previewUrl = `${cleanWebsiteUrl}/careers?preview=draft&v=${previewNonce}`;
  
  // Debug: Log the preview URL to help troubleshoot
  useEffect(() => {
    console.log('[Careers Editor Preview] ===========================================');
    console.log('[Careers Editor Preview] Preview URL:', previewUrl);
    console.log('[Careers Editor Preview] Website URL env var:', process.env.NEXT_PUBLIC_WEBSITE_URL || 'not set (using default: localhost:3002)');
    console.log('[Careers Editor Preview] Clean website URL:', cleanWebsiteUrl);
    console.log('[Careers Editor Preview] Expected: Website careers page with draft content');
    console.log('[Careers Editor Preview] Admin app is on port 3001, website is on port 3002');
    console.log('[Careers Editor Preview] ===========================================');
  }, [previewUrl, cleanWebsiteUrl]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background relative w-full">
      {/* Secondary Sidebar - Supabase Style */}
      <aside 
        className={cn(
          "border-r border-border bg-background flex-shrink-0 flex flex-col transition-all duration-200 ease-in-out h-full",
          isSecondarySidebarCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-56 lg:w-64 xl:w-72"
        )}
      >
        {/* Title Header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className={cn(
            "flex flex-col transition-opacity duration-200",
            isSecondarySidebarCollapsed && "opacity-0 w-0 overflow-hidden"
          )}>
            <h2 className="text-base font-semibold text-foreground whitespace-nowrap">
              Careers Editor
            </h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
              Edit careers page
            </p>
          </div>
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
          "px-3 py-3 transition-opacity duration-200 flex-1 overflow-y-auto",
          isSecondarySidebarCollapsed && "opacity-0 overflow-hidden"
        )}>
          {CAREERS_NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className={cn(groupIndex < CAREERS_NAV_GROUPS.length - 1 ? "mb-5" : "mb-0")}>
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
            <ResponsivePreview 
              previewUrl={previewUrl} 
              previewNonce={previewNonce}
              onRefresh={() => setPreviewNonce(prev => prev + 1)}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden">
            <CareersPageEditor activeSection={activeSection as Exclude<SectionId, "preview">} />
          </div>
        )}
      </main>
    </div>
  );
}
