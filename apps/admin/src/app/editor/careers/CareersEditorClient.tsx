"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, PanelLeftClose, PanelLeftOpen, Briefcase, Users, Heart, Trophy, MessageSquare, BarChart3, Play, ArrowDown, Rocket, Sparkles, Lightbulb, Target, Flag } from "lucide-react";
import { ResponsivePreview } from "@/components/preview/ResponsivePreview";
import { useCareersContent } from "@/context/CareersContentContext";
import { cn } from "@/lib/utils";
import { CareersPageEditor } from "./components/CareersPageEditor";
import { StudentsPageEditor } from "./components/StudentsPageEditor";
import { type CareersPageId, CAREERS_PAGES } from "./components/PageSelector";
import { GraduationCap, FileQuestion, ListChecks } from "lucide-react";
import { WhyOpusFestaPageEditor } from "./components/WhyOpusFestaPageEditor";

type HomepageSectionId = "hero" | "values" | "perks" | "testimonials" | "process" | "preview";
type WhyOpusFestaSectionId = "hero" | "reasons" | "difference" | "vision" | "cta" | "preview";
type StudentsSectionId = "header" | "profiles" | "opportunities" | "benefits" | "faq" | "timeline" | "preview";
type SectionId = HomepageSectionId | WhyOpusFestaSectionId | StudentsSectionId;

const HOMEPAGE_NAV_GROUPS = [
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

const WHY_OPUSFESTA_NAV_GROUPS = [
  {
    label: "SECTIONS",
    items: [
      { id: "hero" as SectionId, label: "Hero", icon: Rocket },
      { id: "reasons" as SectionId, label: "Reasons", icon: Sparkles },
      { id: "difference" as SectionId, label: "Difference", icon: Lightbulb },
      { id: "vision" as SectionId, label: "Vision", icon: Target },
      { id: "cta" as SectionId, label: "CTA", icon: Flag },
    ],
  },
  {
    label: "PREVIEW",
    items: [
      { id: "preview" as SectionId, label: "Preview", icon: Eye },
    ],
  },
];

const STUDENTS_NAV_GROUPS = [
  {
    label: "SECTIONS",
    items: [
      { id: "header" as SectionId, label: "Header", icon: Briefcase },
      { id: "profiles" as SectionId, label: "Student Profiles", icon: Users },
      { id: "opportunities" as SectionId, label: "Opportunities", icon: GraduationCap },
      { id: "benefits" as SectionId, label: "Benefits", icon: Heart },
      { id: "faq" as SectionId, label: "FAQ", icon: FileQuestion },
      { id: "timeline" as SectionId, label: "How to Apply", icon: ListChecks },
    ],
  },
  {
    label: "PREVIEW",
    items: [
      { id: "preview" as SectionId, label: "Preview", icon: Eye },
    ],
  },
];

function getNavGroups(pageId: CareersPageId) {
  switch (pageId) {
    case "students":
      return STUDENTS_NAV_GROUPS;
    case "homepage":
      return HOMEPAGE_NAV_GROUPS;
    case "why-opusfesta":
    default:
      return WHY_OPUSFESTA_NAV_GROUPS;
  }
}

function getDefaultSection(pageId: CareersPageId): SectionId {
  switch (pageId) {
    case "students":
      return "header";
    case "homepage":
      return "hero";
    case "why-opusfesta":
    default:
      return "hero";
  }
}

export function CareersEditorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadAdminContent, saveDraft, publishContent } = useCareersContent();
  const pageParam = searchParams.get("page") as CareersPageId;
  const sectionParam = searchParams.get("section") as SectionId;
  const previewParam = searchParams.get("preview");
  
  const [activePage, setActivePage] = useState<CareersPageId>(
    pageParam && CAREERS_PAGES.find(p => p.id === pageParam)
      ? pageParam
      : "homepage"
  );
  
  const getValidSections = (pageId: CareersPageId): string[] => {
    switch (pageId) {
      case "students":
        return ["header", "profiles", "opportunities", "benefits", "faq", "timeline", "preview"];
      case "homepage":
        return ["hero", "values", "perks", "testimonials", "process", "preview"];
      case "why-opusfesta":
        return ["hero", "reasons", "difference", "vision", "cta", "preview"];
      default:
        return ["hero", "values", "perks", "testimonials", "process", "preview"];
    }
  };

  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (previewParam === "true" || previewParam === "1") return "preview";
    if (sectionParam && getValidSections(activePage).includes(sectionParam)) {
      return sectionParam as SectionId;
    }
    return getDefaultSection(activePage);
  });
  const [previewNonce, setPreviewNonce] = useState(0);
  
  // Primary sidebar (page selector) collapse state
  const [isPrimarySidebarCollapsed, setIsPrimarySidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-careers-editor-primary-sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  
  useEffect(() => {
    loadAdminContent();
  }, [loadAdminContent]);

  const handlePageChange = (pageId: CareersPageId) => {
    setActivePage(pageId);
    // Reset to first section when changing pages
    const defaultSection = getDefaultSection(pageId);
    setActiveSection(defaultSection);
    router.push(`/editor/careers?page=${pageId}&section=${defaultSection}`, { scroll: false });
  };

  // Persist collapse states to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-careers-editor-primary-sidebar-collapsed', String(isPrimarySidebarCollapsed));
    }
  }, [isPrimarySidebarCollapsed]);

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
    const page = searchParams.get("page") as CareersPageId;
    const section = searchParams.get("section") as SectionId;
    const preview = searchParams.get("preview");
    
    if (page && CAREERS_PAGES.find(p => p.id === page)) {
      setActivePage(page);
    }
    
    if (preview === "true" || preview === "1") {
      setActiveSection("preview");
      if (section !== "preview") {
        router.replace(`/editor/careers?page=${activePage}&preview=true`, { scroll: false });
      }
    } else if (section && getValidSections(activePage).includes(section)) {
      setActiveSection(section as SectionId);
    } else if (!section && !preview) {
      const defaultSection = getDefaultSection(activePage);
      router.replace(`/editor/careers?page=${activePage}&section=${defaultSection}`, { scroll: false });
    }
  }, [searchParams, router, activePage]);

  const handleSectionClick = (section: SectionId) => {
    setActiveSection(section);
    if (section === "preview") {
      router.push(`/editor/careers?page=${activePage}&preview=true`, { scroll: false });
    } else {
      router.push(`/editor/careers?page=${activePage}&section=${section}`, { scroll: false });
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

  // Ensure we're pointing to the careers page of the website app, not the admin app
  // Remove any trailing slashes and ensure it's a clean absolute URL
  const cleanWebsiteUrl = getWebsiteUrl();
  
  // Get the preview path based on active page
  const activePageConfig = CAREERS_PAGES.find(p => p.id === activePage);
  const previewPath = activePage === "students"
    ? "/careers/students"
    : activePage === "homepage"
      ? "/careers"
      : "/careers/why-opusfesta";
  
  const previewUrl = `${cleanWebsiteUrl}${previewPath}?preview=draft&v=${previewNonce}`;
  
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

  const sectionOptions = getNavGroups(activePage).flatMap((group) => group.items);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background relative w-full flex-col md:flex-row">
      {/* Mobile controls */}
      <div className="md:hidden border-b border-border/60 bg-background px-3 py-2">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="careers-page-select">
            Page
          </label>
          <select
            id="careers-page-select"
            value={activePage}
            onChange={(event) => handlePageChange(event.target.value as CareersPageId)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            {CAREERS_PAGES.map((page) => (
              <option key={page.id} value={page.id}>
                {page.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="careers-section-select">
            Section
          </label>
          <select
            id="careers-section-select"
            value={activeSection}
            onChange={(event) => handleSectionClick(event.target.value as SectionId)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            {sectionOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Primary Sidebar - Page Selector */}
      <aside 
        className={cn(
          "border-r border-border bg-background flex-shrink-0 transition-all duration-200 ease-in-out h-full hidden md:flex md:flex-col",
          isPrimarySidebarCollapsed ? "md:w-0 md:border-r-0 md:overflow-hidden" : "md:w-48 lg:w-56"
        )}
      >
        {/* Title Header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className={cn(
            "flex flex-col transition-opacity duration-200",
            isPrimarySidebarCollapsed && "opacity-0 w-0 overflow-hidden"
          )}>
            <h2 className="text-base font-semibold text-foreground whitespace-nowrap">
              Pages
            </h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
              Select page to edit
            </p>
          </div>
          <button
            onClick={() => setIsPrimarySidebarCollapsed(!isPrimarySidebarCollapsed)}
            className={cn(
              "w-8 h-8 rounded-lg bg-card border border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center flex-shrink-0",
              isPrimarySidebarCollapsed && "ml-0"
            )}
            title={isPrimarySidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isPrimarySidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Page Navigation */}
        <nav className={cn(
          "px-3 py-3 transition-opacity duration-200 flex-1 overflow-y-auto",
          isPrimarySidebarCollapsed && "opacity-0 overflow-hidden"
        )}>
          <div className="space-y-1">
            {CAREERS_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              
              return (
                <button
                  key={page.id}
                  onClick={() => handlePageChange(page.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "!bg-foreground !text-background font-medium shadow-md"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  title={page.description}
                >
                  <Icon className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "!text-background" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "truncate text-left",
                    isActive && "!text-background"
                  )}>
                    {page.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-background flex flex-col max-w-full">
          <div className="border-b border-border/60 bg-background/90 backdrop-blur-sm hidden md:block">
            <div className="px-4 sm:px-6 md:px-8 py-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {getNavGroups(activePage).map((group, groupIndex) => (
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
                    {groupIndex < getNavGroups(activePage).length - 1 && (
                      <div className="h-5 w-px bg-border/70 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              {activePage === "homepage" ? (
                <CareersPageEditor activeSection={activeSection as Exclude<HomepageSectionId, "preview">} />
              ) : activePage === "why-opusfesta" ? (
                <WhyOpusFestaPageEditor activeSection={activeSection as Exclude<WhyOpusFestaSectionId, "preview">} />
              ) : activePage === "students" ? (
                <StudentsPageEditor activeSection={activeSection as Exclude<StudentsSectionId, "preview">} />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-muted-foreground text-lg mb-2">
                      Editor for "{activePageConfig?.label}" page
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Coming soon - Section editors are being built
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
  );
}
