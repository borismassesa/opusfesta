"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { VendorSidebar } from "./sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign,
  Star,
  BarChart3,
} from "lucide-react";

const MENU_GROUPS = [
  {
    label: "Business",
    items: [
      { label: "Storefront", icon: Store, href: "/storefront" },
      { label: "Leads", icon: Users, href: "/leads" },
      { label: "Messages", icon: MessageSquare, href: "/messages" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Calendar", icon: Calendar, href: "/calendar" },
      { label: "Invoices", icon: FileText, href: "/invoices" },
      { label: "Payments", icon: DollarSign, href: "/payments" },
    ],
  },
  {
    label: "Performance",
    items: [
      { label: "Reviews", icon: Star, href: "/reviews" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

// Hover Overlay Sidebar Component
function HoverOverlaySidebar({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  pathname,
}: {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  pathname: string;
}) {
  return (
    <div 
      className={cn(
        "sidebar-hover-overlay",
        isVisible && "opacity-100"
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'all' : 'none'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex h-full w-full flex-col bg-sidebar border-r border-border">
        <div className="p-4 md:p-6 border-b border-border/40 flex flex-row items-center justify-between mb-2">
          <Link
            href="/"
            className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            OpusFesta
          </Link>
        </div>

        <div className="px-3 pt-2 pb-6 gap-6 overflow-y-auto no-scrollbar flex-1">
          {/* Dashboard Link */}
          <div className="mb-6">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200",
                pathname === "/"
                  ? "!bg-foreground !text-background font-medium shadow-md"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground"
              )}
            >
              <LayoutDashboard className="w-[18px] h-[18px]" />
              <span className="text-sm">Dashboard</span>
            </Link>
          </div>

          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isActiveRoute(pathname, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200",
                        isActive
                          ? "!bg-foreground !text-background font-medium shadow-md"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px]",
                          isActive ? "opacity-100" : "opacity-70"
                        )}
                      />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component to control sidebar state based on secondary sidebar visibility
function SidebarController({
  hasSecondarySidebar,
  children,
  onSidebarStateChange
}: {
  hasSecondarySidebar: boolean; 
  children: ReactNode;
  onSidebarStateChange?: (state: "expanded" | "collapsed") => void;
}) {
  const { setOpen, open, state } = useSidebar();
  const prevHasSecondarySidebar = useRef(hasSecondarySidebar);
  const routeChangedRef = useRef(false);

  useEffect(() => {
    // Only auto-collapse/expand on route changes, not on every render
    if (prevHasSecondarySidebar.current !== hasSecondarySidebar) {
      // Auto-collapse when entering storefront route
      if (hasSecondarySidebar) {
        setOpen(false);
      }
      // Auto-expand when leaving storefront route
      else if (!hasSecondarySidebar) {
        setOpen(true);
      }
    }
    
    prevHasSecondarySidebar.current = hasSecondarySidebar;
  }, [hasSecondarySidebar, setOpen]);

  useEffect(() => {
    if (onSidebarStateChange) {
      onSidebarStateChange(state);
    }
  }, [state, onSidebarStateChange]);

  return <>{children}</>;
}

export function VendorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on a route that should show secondary sidebar
  const hasSecondarySidebar = pathname.startsWith("/storefront");
  
  // Attach hover listeners to sidebar container and gap
  useEffect(() => {
    if (!hasSecondarySidebar || sidebarState !== "collapsed") {
      setSidebarHovered(false);
      return;
    }
    
    let sidebarElement: HTMLElement | null = null;
    let sidebarGap: HTMLElement | null = null;
    let overlayElement: HTMLElement | null = null;
    let cleanup: (() => void) | null = null;
    
    // Use a timeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      sidebarElement = document.querySelector('[data-slot="sidebar-container"]') as HTMLElement;
      sidebarGap = document.querySelector('[data-slot="sidebar-gap"]') as HTMLElement;
      overlayElement = document.querySelector('.sidebar-hover-overlay') as HTMLElement;
      
      const handleMouseEnter = () => {
        setSidebarHovered(true);
      };
      
      const handleMouseLeave = (e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        
        // Check if moving to overlay, sidebar container, or gap
        const movingToOverlay = overlayElement && overlayElement.contains(relatedTarget);
        const movingToSidebar = sidebarElement && sidebarElement.contains(relatedTarget);
        const movingToGap = sidebarGap && sidebarGap.contains(relatedTarget);
        
        // Only hide if not moving to any of these elements
        if (!movingToOverlay && !movingToSidebar && !movingToGap) {
          setSidebarHovered(false);
        }
      };
      
      if (sidebarElement) {
        sidebarElement.addEventListener('mouseenter', handleMouseEnter);
        sidebarElement.addEventListener('mouseleave', handleMouseLeave);
      }
      
      if (sidebarGap) {
        sidebarGap.addEventListener('mouseenter', handleMouseEnter);
        sidebarGap.addEventListener('mouseleave', handleMouseLeave);
      }
      
      if (overlayElement) {
        overlayElement.addEventListener('mouseenter', handleMouseEnter);
        overlayElement.addEventListener('mouseleave', handleMouseLeave);
      }
      
      cleanup = () => {
        sidebarElement?.removeEventListener('mouseenter', handleMouseEnter);
        sidebarElement?.removeEventListener('mouseleave', handleMouseLeave);
        sidebarGap?.removeEventListener('mouseenter', handleMouseEnter);
        sidebarGap?.removeEventListener('mouseleave', handleMouseLeave);
        overlayElement?.removeEventListener('mouseenter', handleMouseEnter);
        overlayElement?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, 150);
    
    return () => {
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [hasSecondarySidebar, sidebarState]);

  return (
    <SidebarProvider defaultOpen={!hasSecondarySidebar}>
      <SidebarController 
        hasSecondarySidebar={hasSecondarySidebar}
        onSidebarStateChange={setSidebarState}
      >
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden relative">
          {/* Primary Sidebar */}
          <div 
            ref={sidebarContainerRef} 
            className={cn(
              "relative",
              hasSecondarySidebar && sidebarHovered && "sidebar-hover-active"
            )}
          >
            <VendorSidebar />
          </div>

          {/* Hover Overlay Sidebar - Shows full sidebar on hover when collapsed */}
          {hasSecondarySidebar && sidebarState === "collapsed" && (
            <HoverOverlaySidebar 
              isVisible={sidebarHovered}
              onMouseEnter={() => setSidebarHovered(true)}
              onMouseLeave={() => setSidebarHovered(false)}
              pathname={pathname}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden bg-background relative">
            {children}
          </main>
        </div>
      </SidebarController>
    </SidebarProvider>
  );
}
