"use client";

import { PanelLeftClose, PanelLeftOpen, Briefcase, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface UsersSidebarProps {
  activeTab: "vendors" | "couples" | "applicants";
  onTabChange: (tab: "vendors" | "couples" | "applicants") => void;
  counts: {
    vendors: number;
    couples: number;
    applicants: number;
  };
  loading: boolean;
}

const USER_TYPE_ITEMS = [
  { label: "Vendors", icon: Briefcase, value: "vendors" as const },
  { label: "Couples", icon: User, value: "couples" as const },
  { label: "Applicants", icon: FileText, value: "applicants" as const },
];

export function UsersSidebar({ activeTab, onTabChange, counts, loading }: UsersSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin-users-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-users-sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  return (
    <>
      {/* Secondary Sidebar */}
      <aside
        className={cn(
          "border-r border-border bg-background flex-shrink-0 flex flex-col transition-all duration-200 ease-in-out h-full",
          isCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-48 sm:w-56 lg:w-64 xl:w-72"
        )}
      >
        {/* Title Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div
            className={cn(
              "flex flex-col transition-opacity duration-200",
              isCollapsed && "opacity-0 w-0 overflow-hidden"
            )}
          >
            <h2 className="text-base lg:text-lg font-semibold text-foreground whitespace-nowrap">Users</h2>
            <p className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap mt-0.5">
              User directory
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
            "px-3 lg:px-4 py-3 lg:py-4 transition-opacity duration-200 flex-1",
            isCollapsed && "opacity-0 overflow-hidden",
            !isCollapsed && "overflow-y-auto"
          )}
        >
          <div className="space-y-1 lg:space-y-1.5">
            {USER_TYPE_ITEMS.map((item) => {
              const isActive = activeTab === item.value;
              const count = counts[item.value];

              return (
                <button
                  key={item.value}
                  onClick={() => onTabChange(item.value)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-sm lg:text-base transition-all duration-200",
                    isActive
                      ? "!bg-foreground !text-background font-medium shadow-md"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon
                      className={cn(
                        "w-4 h-4 lg:w-5 lg:h-5 shrink-0",
                        isActive ? "!text-background" : "text-muted-foreground"
                      )}
                    />
                    <span className={cn("truncate", isActive && "!text-background")}>
                      {item.label}
                    </span>
                  </div>
                  {!loading && (
                    <span
                      className={cn(
                        "text-xs lg:text-sm font-semibold shrink-0 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full",
                        isActive
                          ? "bg-background/20 text-background"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
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
