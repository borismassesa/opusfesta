"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase/client";
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
  SidebarMenuBadge,
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

export function VendorSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get vendor for this user
        const { data: vendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (vendor) {
          const { getVendorUnreadCount } = await import('@/lib/supabase/messages');
          const count = await getVendorUnreadCount(vendor.id);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mock user data - in production, get from auth
  const displayName = "Vendor User";
  const displayEmail = "vendor@thefesta.com";
  const avatarUrl = "";

  const handleSignOut = async () => {
    // Implement sign out logic
    console.log("Sign out");
  };

  return (
    <Sidebar
      className="bg-sidebar backdrop-blur-xl transition-all duration-160 border-r border-border-subtle"
      collapsible="icon"
    >
        <SidebarHeader className="p-4 md:p-6 border-b border-border/40 flex flex-row items-center justify-between mb-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:gap-3">
          <Link
            href="/"
            className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50 group-data-[collapsible=icon]:hidden"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            TheFesta
          </Link>
          <SidebarTrigger className="w-8 h-8 rounded-lg bg-card border border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:mx-auto" />
        </SidebarHeader>

        <SidebarContent className="px-3 pt-2 pb-6 gap-6 no-scrollbar group-data-[collapsible=icon]:px-4 group-data-[collapsible=icon]:gap-3">
          {/* Primary Action Button */}
          <div className="flex flex-col gap-0 px-2 mb-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mb-6">
            <Link
              href="/"
              className={`flex items-center justify-start gap-3 h-10 px-3 rounded-lg transition-all duration-200 font-medium text-sm group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:rounded-lg ${
                pathname === "/" 
                  ? "bg-foreground text-background shadow-md" 
                  : "bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-border/50"
              }`}
            >
              <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 ${
                pathname === "/" ? "text-background" : "opacity-80 group-data-[collapsible=icon]:opacity-100"
              }`} />
              <span className={`group-data-[collapsible=icon]:hidden ${
                pathname === "/" ? "text-background" : "text-muted-foreground"
              }`}>Dashboard</span>
            </Link>
          </div>
          {MENU_GROUPS.map((group, groupIndex) => (
            <SidebarGroup key={group.label} className="p-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:mb-6 last:group-data-[collapsible=icon]:mb-0">
              <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium mb-2 group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2">
                  {group.items.map((item) => {
                    const isActive = isActiveRoute(pathname, item.href);
                    const showBadge = item.label === "Messages" && unreadCount > 0;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={`
                              h-10 rounded-lg px-3 transition-all duration-200
                              group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:justify-center
                              group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-border/50
                              ${
                                isActive
                                  ? "!bg-foreground !text-background shadow-md font-medium group-data-[collapsible=icon]:!bg-foreground group-data-[collapsible=icon]:!text-background group-data-[collapsible=icon]:border-foreground/20"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground group-data-[collapsible=icon]:hover:bg-background group-data-[collapsible=icon]:hover:border-border"
                              }
                            `}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full relative group-data-[collapsible=icon]:justify-center">
                            <item.icon
                              className={`w-[18px] h-[18px] shrink-0 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 ${
                                isActive ? "!text-background opacity-100" : "opacity-80 group-data-[collapsible=icon]:opacity-100"
                              }`}
                            />
                            <span className={`text-sm group-data-[collapsible=icon]:hidden ${
                              isActive ? "!text-background" : ""
                            }`}>
                              {item.label}
                            </span>
                            {showBadge && (
                              <SidebarMenuBadge className="ml-auto group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:!absolute group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:translate-x-1/2 group-data-[collapsible=icon]:-translate-y-1/2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:!h-5 group-data-[collapsible=icon]:!min-w-5 group-data-[collapsible=icon]:!px-1.5 group-data-[collapsible=icon]:!text-[11px]">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </SidebarMenuBadge>
                            )}
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
        <div className="mt-auto p-2 border-t border-border/40 m-2 flex flex-col gap-2 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:p-4 group-data-[collapsible=icon]:gap-3">
          <button
            onClick={() => {
              if (mounted) {
                setTheme(theme === "dark" ? "light" : "dark");
              }
            }}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:bg-background/50 group-data-[collapsible=icon]:border-border/50"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun size={20} className="group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" /> : <Moon size={20} className="group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />}
            <span className="group-data-[collapsible=icon]:hidden">Theme</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/50 transition-colors cursor-pointer group data-[state=open]:bg-card/50 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-auto">
                <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground overflow-hidden group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:border-border/50">
                  <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback>
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col overflow-hidden text-left group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{displayEmail}</span>
                </div>
                <Settings className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-popover text-popover-foreground shadow-lg border border-border z-50 p-1"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left">
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-full bg-muted text-popover-foreground font-semibold text-sm">
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left leading-tight min-w-0">
                    <span className="truncate font-semibold text-sm text-popover-foreground">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 border-border" />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground px-2 py-2 text-popover-foreground"
                  onClick={() => {
                    // Navigate to settings or handle settings action
                    window.location.href = '/profile';
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground px-2 py-2 text-popover-foreground"
                  onClick={() => {
                    if (mounted) {
                      setTheme(theme === "dark" ? "light" : "dark");
                    }
                  }}
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span className="text-sm">Theme</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1 border-border" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-accent focus:text-accent-foreground px-2 py-2 text-popover-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
  );
}
