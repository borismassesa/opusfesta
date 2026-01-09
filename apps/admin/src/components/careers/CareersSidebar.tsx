"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, Briefcase, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const CAREERS_NAV_ITEMS = [
  { label: "Job Postings", icon: Briefcase, href: "/careers/jobs" },
  { label: "Applications", icon: FileText, href: "/careers/applications" },
  { label: "Analytics", icon: BarChart3, href: "/careers/analytics" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/careers/jobs") {
    return pathname === "/careers/jobs" || pathname.startsWith("/careers/jobs/");
  }
  return pathname.startsWith(href + "/") || pathname === href;
}

export function CareersSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-careers-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-careers-sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <>
      {/* Secondary Sidebar */}
      <aside
        className={cn(
          "border-r border-border bg-background flex-shrink-0 flex flex-col transition-all duration-200 ease-in-out h-full",
          isCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-48 sm:w-56 lg:w-64"
        )}
      >
        {/* Title Header */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div
            className={cn(
              "flex flex-col transition-opacity duration-200",
              isCollapsed && "opacity-0 w-0 overflow-hidden"
            )}
          >
            <h2 className="text-base font-semibold text-foreground whitespace-nowrap">Careers</h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
              Manage careers
            </p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-8 h-8 rounded-lg bg-card border border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center flex-shrink-0",
              isCollapsed && "ml-0"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "px-3 py-3 transition-opacity duration-200 flex-1",
            isCollapsed && "opacity-0 overflow-hidden",
            !isCollapsed && "overflow-y-auto"
          )}
        >
          <div className="space-y-0.5">
            {CAREERS_NAV_ITEMS.map((item) => {
              const isActive = isActiveRoute(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "!bg-foreground !text-background font-medium shadow-md"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "!text-background" : "text-muted-foreground"
                    )}
                  />
                  <span className={cn("truncate", isActive && "!text-background")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Floating Expand Button - Shows when sidebar is collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute left-0 top-4 z-10 w-8 h-8 rounded-r-lg bg-card border border-l-0 border-border/50 shadow-none hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
