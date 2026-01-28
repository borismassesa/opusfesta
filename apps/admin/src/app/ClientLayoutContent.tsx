"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Calendar,
  Settings,
  Briefcase,
  Store,
  PenTool,
  Image as ImageIcon,
  ListTodo,
  LogOut,
  Eye,
  BarChart3,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { CareersContentProvider } from "@/context/CareersContentContext";
import { StudentsContentProvider } from "@/context/StudentsContentContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { UnauthorizedPage } from "@/components/UnauthorizedPage";
import { useIsMobile } from "@/hooks/use-mobile";
import "./globals.css";

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

  useEffect(() => {
    // Only auto-collapse on initial mount when entering content route
    // Don't prevent manual toggling after that
    if (hasSecondarySidebar && !prevHasSecondarySidebar.current && open) {
      setOpen(false);
    }
    // Auto-expand when leaving content route (only if it was collapsed due to secondary sidebar)
    else if (!hasSecondarySidebar && !open && prevHasSecondarySidebar.current) {
      setOpen(true);
    }
    
    prevHasSecondarySidebar.current = hasSecondarySidebar;
  }, [hasSecondarySidebar, setOpen, open]);

  useEffect(() => {
    if (onSidebarStateChange) {
      onSidebarStateChange(state);
    }
  }, [state, onSidebarStateChange]);

  return <>{children}</>;
}

type MenuGroup = {
  label: string;
  items: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
  }>;
};

// Hover Overlay Sidebar Component
function HoverOverlaySidebar({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  pathname,
  isActiveRoute,
  MENU_GROUPS,
  displayName,
  displayEmail,
  avatarUrl,
  role,
}: {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  pathname: string;
  isActiveRoute: (pathname: string, href: string) => boolean;
  MENU_GROUPS: MenuGroup[];
  displayName: string;
  displayEmail: string;
  avatarUrl: string;
  role: string;
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
                      href={item.href as any}
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

        <div className="mt-auto p-2 border-t border-border/40 m-2 flex flex-col gap-2">
          <ThemeSwitcher />
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-sm font-medium truncate">{displayName}</span>
              <span className="text-[10px] text-muted-foreground">{role || "viewer"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MENU_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }],
  },
  {
    label: "Editor",
    items: [
      { label: "Homepage Editor", icon: FileText, href: "/content" },
      { label: "Careers Editor", icon: Briefcase, href: "/editor/careers" },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Vendors", icon: Briefcase, href: "/marketplace/vendors" },
      { label: "Products", icon: ShoppingBag, href: "/marketplace/products" },
      { label: "Orders", icon: Store, href: "/marketplace/orders" },
    ],
  },
  {
    label: "Events",
    items: [
      { label: "Bookings", icon: Calendar, href: "/events/bookings" },
      { label: "Tools", icon: ListTodo, href: "/events/tools" },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "Users", icon: Users, href: "/users" },
      { label: "Employees", icon: Users, href: "/org/employees" },
    ],
  },
  {
    label: "Careers",
    items: [
      { label: "Careers", icon: Briefcase, href: "/careers/jobs" },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  // For exact matches
  if (pathname === href) {
    return true;
  }
  // Special case for /careers/jobs - should be active for all /careers/jobs/* routes
  if (href === "/careers/jobs") {
    return pathname.startsWith("/careers");
  }
  // For sub-paths: only match if pathname starts with href + "/"
  // This ensures /careers/jobs matches /careers/jobs but not /careers/applications
  // And /careers/applications matches /careers/applications but not /careers/jobs
  return pathname.startsWith(href + "/");
}

export default function ClientLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState("");
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Check if we're on a route that should show secondary sidebar
  const hasSecondarySidebar = pathname.startsWith("/content") || pathname.startsWith("/careers") || pathname.startsWith("/editor/careers") || pathname.startsWith("/users");
  
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

  const allowedRoles = ["owner", "admin", "editor", "viewer"];
  const isAllowed = session && allowedRoles.includes(role);

  useEffect(() => {
    let mountedRef = true;
    
    // Timeout fallback to ensure authChecked is always set (reduced to 1 second for faster redirect)
    const timeoutId = setTimeout(() => {
      if (mountedRef) {
        console.warn("Auth check timeout - setting authChecked to true");
        setSession(null);
        setRole("");
        setAuthChecked(true);
      }
    }, 1000); // 1 second timeout - faster redirect to login
    
    const fetchUserRole = async (currentSession: Session | null) => {
      if (!currentSession?.user?.id) return "";
      
      try {
        // Add timeout to the database query
        const queryPromise = supabase
          .from("users")
          .select("role")
          .eq("id", currentSession.user.id)
          .single();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Query timeout")), 1500)
        );
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error || !data) {
          // Fallback to app_metadata if database query fails
          return currentSession.user.app_metadata?.role ?? "";
        }
        
        return data.role ?? "";
      } catch (error) {
        // Fallback to app_metadata on error
        return currentSession.user.app_metadata?.role ?? "";
      }
    };

    // Add timeout wrapper for getSession (5 seconds for network requests)
    const sessionPromise = supabase.auth.getSession();
    const sessionTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Session timeout")), 5000)
    );

    Promise.race([sessionPromise, sessionTimeout])
      .then(async (result: any) => {
        clearTimeout(timeoutId);
        if (!mountedRef) return;
        
        const { data, error } = result || { data: null, error: new Error("No session data") };
        
        if (error) {
          console.error("Error getting session:", error);
          if (mountedRef) {
            setSession(null);
            setRole("");
            setAuthChecked(true);
          }
          return;
        }
        const currentSession = data?.session ?? null;
        setSession(currentSession);
        if (currentSession) {
          const userRole = await fetchUserRole(currentSession);
          if (mountedRef) {
            setRole(userRole);
            setAuthChecked(true);
          }
        } else {
          if (mountedRef) {
            setRole("");
            setAuthChecked(true);
          }
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("Error in getSession:", error);
        if (mountedRef) {
          setSession(null);
          setRole("");
          setAuthChecked(true);
        }
      });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      clearTimeout(timeoutId);
      if (!mountedRef) return;
      setSession(nextSession);
      if (nextSession) {
        const userRole = await fetchUserRole(nextSession);
        if (mountedRef) {
          setRole(userRole);
          setAuthChecked(true);
        }
      } else {
        if (mountedRef) {
          setRole("");
          setAuthChecked(true);
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      mountedRef = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    // Don't redirect if we're already on the login, forgot-password, or reset-password page
    if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
      setIsRedirecting(false);
      return;
    }
    if (!session) {
      setIsRedirecting(true);
      // Use replace to avoid adding to history; only add ?next= when not going to "/" (clean URL)
      const targetPath = pathname === "/" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(targetPath);
      // Fallback: if router.replace doesn't work quickly, use window.location as backup
      const timeoutId = setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = targetPath;
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    setIsRedirecting(false);
    // If role is set and not in allowed roles, the unauthorized page will be shown
    // (handled by the !isAllowed check below)
    // If role is empty but session exists, allow access (role might be loading)
    // The role check will happen again once it's loaded
  }, [authChecked, pathname, role, router, session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Don't block login, forgot-password, and reset-password pages - allow them to render
  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
    return (
      <Providers>
        {children}
      </Providers>
    );
  }

  if (!authChecked) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen bg-background z-[9999] flex flex-col justify-center items-center">
        <div className="font-serif text-4xl md:text-5xl text-primary mb-4 relative">
          OpusFesta
        </div>
        <div className="uppercase text-[10px] text-muted-foreground tracking-[0.3em] font-medium mb-8 opacity-70">
          Checking Access
        </div>
        <div className="w-[200px] h-px bg-primary/10 relative overflow-hidden">
          <div className="admin-loading-bar absolute left-0 top-0 h-full bg-primary w-0"></div>
        </div>
      </div>
    );
  }

  // If no session and we're not on a public page, redirect to login immediately
  // Don't show unauthorized page for users who aren't logged in yet
  if (!session && authChecked && pathname !== "/login" && pathname !== "/forgot-password" && pathname !== "/reset-password") {
    // Trigger redirect immediately - don't wait for useEffect; only add ?next= when not "/"
    if (!isRedirecting) {
      setIsRedirecting(true);
      const loginPath = pathname === "/" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginPath);
    }
    // Show minimal loading state while redirecting
    return (
      <div className="fixed top-0 left-0 w-full h-screen bg-background z-[9999] flex flex-col justify-center items-center">
        <div className="font-serif text-4xl md:text-5xl text-primary mb-4 relative">
          OpusFesta
        </div>
        <div className="uppercase text-[10px] text-muted-foreground tracking-[0.3em] font-medium mb-8 opacity-70">
          Redirecting to Login
        </div>
        <div className="w-[200px] h-px bg-primary/10 relative overflow-hidden">
          <div className="admin-loading-bar absolute left-0 top-0 h-full bg-primary w-0"></div>
        </div>
      </div>
    );
  }

  // Only show unauthorized page if user is logged in but doesn't have a valid role
  if (!isAllowed) {
    return (
      <Providers>
        <UnauthorizedPage 
          session={session} 
          userEmail={session?.user?.email}
        />
      </Providers>
    );
  }

  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.email ??
    "Admin User";
  const displayEmail = session?.user?.email ?? "admin@opusfesta.com";
  const avatarUrl = session?.user?.user_metadata?.avatar_url ?? "https://github.com/shadcn.png";

  return (
    <Providers>
          <SidebarProvider defaultOpen={!hasSecondarySidebar}>
            <SidebarController 
              hasSecondarySidebar={hasSecondarySidebar}
              onSidebarStateChange={setSidebarState}
            >
              <div className="flex h-screen w-full bg-background text-foreground overflow-hidden relative">
                {/* Sidebar */}
                <div 
                  ref={sidebarContainerRef} 
                  className={cn(
                    "relative",
                    hasSecondarySidebar && sidebarHovered && "sidebar-hover-active"
                  )}
                >
                <Sidebar
                  className={cn(
                    "border-r border-border/40 bg-sidebar/40 backdrop-blur-xl shadow-sm transition-all duration-300 group-data-[collapsible=icon]:bg-background",
                    hasSecondarySidebar && "sidebar-hover-expand"
                  )}
                  collapsible="icon"
                >
                <SidebarHeader className="p-4 md:p-6 border-b border-border/40 flex flex-row items-center justify-between mb-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:gap-3">
                  <Link
                    href="/"
                    className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50 group-data-[collapsible=icon]:hidden"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    OpusFesta
                  </Link>
                  <SidebarTrigger className="w-8 h-8 rounded-lg bg-card border border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:mx-auto" />
                </SidebarHeader>

                <SidebarContent className="px-3 pt-2 pb-6 gap-6 no-scrollbar group-data-[collapsible=icon]:px-4 group-data-[collapsible=icon]:gap-3">
                  {MENU_GROUPS.map((group) => (
                    <SidebarGroup key={group.label} className="p-0">
                      <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2 group-data-[collapsible=icon]:hidden">
                        {group.label}
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2">
                          {group.items.map((item) => {
                            const isActive = isActiveRoute(pathname, item.href);
                            return (
                              <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={isActive}
                                  tooltip={item.label}
                                  className={cn(
                                    "h-10 rounded-lg px-3 transition-all duration-200",
                                    "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:justify-center",
                                    "group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-border/50",
                                    isActive
                                      ? "!bg-foreground !text-background font-medium shadow-md group-data-[collapsible=icon]:!bg-foreground group-data-[collapsible=icon]:!text-background group-data-[collapsible=icon]:border-foreground/20"
                                      : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:hover:bg-background group-data-[collapsible=icon]:hover:border-border"
                                  )}
                                >
                                  <Link href={item.href as any} className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                                    <item.icon
                                      className={cn(
                                        "w-[18px] h-[18px] shrink-0",
                                        "group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5",
                                        isActive 
                                          ? "opacity-100" 
                                          : "opacity-80 group-data-[collapsible=icon]:opacity-100"
                                      )}
                                    />
                                    <span className="text-sm group-data-[collapsible=icon]:hidden">
                                      {item.label}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ))}
                </SidebarContent>

                {/* User Profile Dropdown */}
                <div className="mt-auto p-1.5 border-t border-border/40 m-1.5 flex flex-col gap-1.5 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:gap-2">
                  <ThemeSwitcher 
                    className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border-border/50"
                    iconClassName="group-data-[collapsible=icon]:w-4 group-data-[collapsible=icon]:h-4"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card/50 transition-colors cursor-pointer group data-[state=open]:bg-card/50 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground overflow-hidden group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:border-border/50">
                          <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback>
                              {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col overflow-hidden text-left group-data-[collapsible=icon]:hidden">
                          <span className="text-xs font-medium truncate group-hover:text-foreground transition-colors">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{role || "viewer"}</span>
                        </div>
                        <Settings className="w-3.5 h-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover text-popover-foreground border border-border shadow-xl z-50"
                      side="bottom"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback className="rounded-lg">
                              {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{displayName}</span>
                            <span className="truncate text-xs">{displayEmail}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                </Sidebar>
                </div>

                {/* Hover Overlay Sidebar - Shows full sidebar on hover when collapsed */}
                {hasSecondarySidebar && sidebarState === "collapsed" && !isMobile && (
                  <HoverOverlaySidebar 
                    isVisible={sidebarHovered}
                    onMouseEnter={() => setSidebarHovered(true)}
                    onMouseLeave={() => setSidebarHovered(false)}
                    pathname={pathname}
                    isActiveRoute={isActiveRoute}
                    MENU_GROUPS={MENU_GROUPS}
                    displayName={displayName}
                    displayEmail={displayEmail}
                    avatarUrl={avatarUrl}
                    role={role}
                  />
                )}

              {/* Main Content Area */}
              <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/60 bg-background/95 px-3 backdrop-blur md:hidden">
                  <SidebarTrigger className="h-9 w-9" />
                  <Link
                    href="/"
                    className="font-serif text-lg text-primary hover:text-primary/80 transition-colors select-none"
                  >
                    OpusFesta
                  </Link>
                </header>
                <main className="flex-1 overflow-auto bg-background relative">
                <div className={cn(
                  "relative z-10 animate-in fade-in duration-500",
                  pathname.startsWith("/content") || pathname.startsWith("/editor/careers") || pathname.startsWith("/careers") || pathname.startsWith("/users")
                    ? "h-full p-0" 
                    : "min-h-full p-4 sm:p-6 pt-16 sm:pt-20 md:p-8 lg:p-10 max-w-[1600px] mx-auto"
                )}>
                  <CareersContentProvider>
                    <StudentsContentProvider>
                      {children}
                    </StudentsContentProvider>
                  </CareersContentProvider>
                </div>
                </main>
              </div>
            </div>
            </SidebarController>
          </SidebarProvider>
        </Providers>
  );
}
