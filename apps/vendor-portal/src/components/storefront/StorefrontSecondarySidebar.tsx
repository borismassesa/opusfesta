'use client';

import { 
  Building2, 
  User, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Award, 
  Star, 
  Eye 
} from 'lucide-react';
import { type Vendor } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio, getVendorPackages, getVendorAwards } from '@/lib/supabase/vendor';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  sectionId: string;
  icon: LucideIcon;
}

interface StorefrontSecondarySidebarProps {
  vendor: Vendor | null;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function StorefrontSecondarySidebar({ vendor, activeSection, onSectionChange }: StorefrontSecondarySidebarProps) {
  const { data: portfolioItems = [] } = useQuery({
    queryKey: ['portfolio', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPortfolio(vendor.id);
    },
    enabled: !!vendor,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPackages(vendor.id);
    },
    enabled: !!vendor,
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['awards', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorAwards(vendor.id);
    },
    enabled: !!vendor,
  });

  // Navigation items with meaningful icons - clean navigation without completion status
  const navigationItems: NavigationItem[] = [
    {
      id: 'about',
      label: 'About',
      sectionId: 'section-business-info',
      icon: Building2,
    },
    {
      id: 'profile',
      label: 'Vendor Profile',
      sectionId: 'section-profile-settings',
      icon: User,
    },
    {
      id: 'services',
      label: 'Services',
      sectionId: 'section-services',
      icon: Briefcase,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      sectionId: 'section-packages',
      icon: DollarSign,
    },
    {
      id: 'availability',
      label: 'Availability',
      sectionId: 'section-availability',
      icon: Calendar,
    },
    {
      id: 'awards',
      label: 'Awards',
      sectionId: 'section-awards',
      icon: Award,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      sectionId: 'section-reviews',
      icon: Star,
    },
    {
      id: 'preview',
      label: 'Preview',
      sectionId: 'section-preview',
      icon: Eye,
    },
  ];

  return (
    <aside 
      className="w-64 border-r border-border bg-background flex-shrink-0 flex flex-col h-full relative"
      style={{ zIndex: 1 }}
    >
      {/* Title Header */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h2 className="text-base font-semibold text-foreground">Storefront</h2>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.sectionId;
            const Icon = item.icon;

            const handleClick = () => {
              console.log('[StorefrontSecondarySidebar] Button clicked:', item.label, item.sectionId);
              console.log('[StorefrontSecondarySidebar] Current activeSection:', activeSection);
              console.log('[StorefrontSecondarySidebar] onSectionChange type:', typeof onSectionChange);
              if (typeof onSectionChange === 'function') {
                onSectionChange(item.sectionId);
                console.log('[StorefrontSecondarySidebar] Called onSectionChange with:', item.sectionId);
              } else {
                console.error('[StorefrontSecondarySidebar] onSectionChange is not a function!', onSectionChange);
              }
            };

            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors relative",
                  "hover:bg-muted/50 cursor-pointer",
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ zIndex: 10, position: 'relative' }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
