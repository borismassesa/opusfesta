"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  MoreVertical,
  Eye,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const MENU_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Vendors", icon: Users, href: "/vendors" },
      { label: "Payments", icon: DollarSign, href: "/payments" },
      { label: "Reviews", icon: FileText, href: "/reviews" },
      { label: "Preview", icon: Eye, href: "/preview" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const displayName = "Admin User";
  const displayEmail = "admin@thefesta.com";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-sidebar-border flex items-center justify-between">
        <Link
          href={"/" as any}
          className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          TheFesta
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 pb-6 gap-4 overflow-y-auto no-scrollbar">
        {MENU_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-4 text-xs text-muted-foreground font-medium mb-2">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href as any}
                    className={`
                      flex items-center gap-3 h-9 px-3 rounded-lg transition-all duration-160
                      ${
                        isActive
                          ? "!bg-foreground !text-background font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-sidebar-foreground"
                      }
                    `}
                  >
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? "!text-background" : "text-muted-foreground"
                      }`}
                    />
                    <span className={`text-sm ${
                      isActive ? "!text-background" : ""
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-2 border-t border-sidebar-border pt-2">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
            {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-left flex-1 min-w-0">
            <span className="text-sm font-semibold truncate text-sidebar-foreground">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
          </div>
          <ThemeSwitcher variant="compact" showLabel={false} />
        </div>
      </div>
    </aside>
  );
}
