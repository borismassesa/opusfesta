"use client";

import { Briefcase, GraduationCap, Heart, Users, FileText, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CareersPageId = "homepage" | "students" | "why-opusfesta" | "life-at-opusfesta" | "benefits" | "how-we-hire";

export interface CareersPage {
  id: CareersPageId;
  label: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const CAREERS_PAGES: CareersPage[] = [
  {
    id: "homepage",
    label: "Homepage",
    slug: "careers",
    icon: Briefcase,
    description: "Main careers landing page",
  },
  {
    id: "students",
    label: "Students",
    slug: "careers-students",
    icon: GraduationCap,
    description: "Student opportunities page",
  },
  {
    id: "why-opusfesta",
    label: "Why OpusFesta",
    slug: "careers-why-opusfesta",
    icon: Heart,
    description: "Why join OpusFesta page",
  },
  {
    id: "life-at-opusfesta",
    label: "Life at OpusFesta",
    slug: "careers-life-at-opusfesta",
    icon: Users,
    description: "Company culture page",
  },
  {
    id: "benefits",
    label: "Benefits",
    slug: "careers-benefits",
    icon: Building2,
    description: "Benefits and perks page",
  },
  {
    id: "how-we-hire",
    label: "How We Hire",
    slug: "careers-how-we-hire",
    icon: FileText,
    description: "Hiring process page",
  },
];

interface PageSelectorProps {
  activePage: CareersPageId;
  onPageChange: (pageId: CareersPageId) => void;
}

export function PageSelector({ activePage, onPageChange }: PageSelectorProps) {
  return (
    <div className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CAREERS_PAGES.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            
            return (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-foreground text-background shadow-md"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                )}
                title={page.description}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-background" : "text-muted-foreground"
                )} />
                <span>{page.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
