'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { type Vendor } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio, getVendorPackages, getVendorAwards } from '@/lib/supabase/vendor';

interface NavigationItem {
  id: string;
  label: string;
  sectionId: string;
  completed: boolean;
  required?: boolean;
}

interface StorefrontNavigationProps {
  vendor: Vendor | null;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function StorefrontNavigation({ vendor, activeSection, onSectionChange }: StorefrontNavigationProps) {

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

  const totalImages = portfolioItems.reduce((sum, item) => sum + (item.images?.length || 0), 0);

  const navigationItems: NavigationItem[] = vendor
    ? [
        {
          id: 'about',
          label: 'About',
          sectionId: 'section-business-info',
          completed: !!(vendor.business_name && vendor.description && vendor.cover_image),
          required: true,
        },
        {
          id: 'profile',
          label: 'Vendor Profile',
          sectionId: 'section-profile-settings',
          completed: true,
        },
        {
          id: 'services',
          label: 'Services',
          sectionId: 'section-services',
          completed: !!(vendor.services_offered && vendor.services_offered.length > 0),
        },
        {
          id: 'pricing',
          label: 'Pricing',
          sectionId: 'section-packages',
          completed: packages.length > 0,
        },
        {
          id: 'availability',
          label: 'Availability',
          sectionId: 'section-availability',
          completed: true,
        },
        {
          id: 'awards',
          label: 'Awards',
          sectionId: 'section-awards',
          completed: awards.length > 0,
        },
        {
          id: 'reviews',
          label: 'Reviews',
          sectionId: 'section-reviews',
          completed: true,
        },
        {
          id: 'preview',
          label: 'Preview',
          sectionId: 'section-preview',
          completed: true,
        },
      ]
    : [];

  if (!vendor || navigationItems.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {navigationItems.map((item) => {
          const Icon = item.completed ? CheckCircle2 : Circle;
          const isActive = activeSection === item.sectionId;

          return (
            <button
              key={item.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
              onClick={() => onSectionChange(item.sectionId)}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${
                  item.completed ? 'text-green-600' : 'text-muted-foreground'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
