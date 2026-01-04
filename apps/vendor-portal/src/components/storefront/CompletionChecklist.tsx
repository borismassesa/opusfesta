'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { type Vendor } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio } from '@/lib/supabase/vendor';

// Section ID mapping for scroll-to functionality
const sectionIdMap: Record<string, string> = {
  business_name: 'section-business-info',
  description: 'section-business-info',
  cover_image: 'section-business-info',
  portfolio_photos: 'section-portfolio',
  location: 'section-business-info',
  contact_info: 'section-business-info',
  services: 'section-services',
  price_range: 'section-packages',
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Add a highlight effect
    element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
    setTimeout(() => {
      element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
    }, 2000);
  }
};

interface CompletionChecklistProps {
  vendor: Vendor | null;
}

export function CompletionChecklist({ vendor }: CompletionChecklistProps) {
  const { data: portfolioItems = [] } = useQuery({
    queryKey: ['portfolio', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPortfolio(vendor.id);
    },
    enabled: !!vendor,
  });

  if (!vendor) {
    return null;
  }

  const totalImages = portfolioItems.reduce((sum, item) => sum + (item.images?.length || 0), 0);

  const checklistItems = [
    {
      id: 'business_name',
      label: 'Business Name',
      completed: !!vendor.business_name,
      required: true,
    },
    {
      id: 'description',
      label: 'Business Description',
      completed: !!vendor.description && vendor.description.length > 50,
      required: true,
    },
    {
      id: 'cover_image',
      label: 'Cover Image',
      completed: !!vendor.cover_image,
      required: true,
    },
    {
      id: 'portfolio_photos',
      label: 'Portfolio Photos (20+ recommended)',
      completed: totalImages >= 20,
      required: false,
      value: `${totalImages} / 20`,
    },
    {
      id: 'location',
      label: 'Location Details',
      completed: !!(vendor.location?.city || vendor.location?.address),
      required: true,
    },
    {
      id: 'contact_info',
      label: 'Contact Information',
      completed: !!(vendor.contact_info?.email || vendor.contact_info?.phone),
      required: true,
    },
    {
      id: 'services',
      label: 'Services Offered',
      completed: !!(vendor.services_offered && vendor.services_offered.length > 0),
      required: true,
    },
    {
      id: 'price_range',
      label: 'Price Range',
      completed: !!vendor.price_range,
      required: false,
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const requiredCompleted = checklistItems.filter((item) => item.required && item.completed).length;
  const requiredTotal = checklistItems.filter((item) => item.required).length;
  const completionPercentage = Math.round((completedCount / checklistItems.length) * 100);
  const requiredPercentage = Math.round((requiredCompleted / requiredTotal) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Completion</CardTitle>
          <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Simplified Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                completionPercentage >= 80 ? 'bg-green-600' : completionPercentage >= 50 ? 'bg-amber-600' : 'bg-red-600'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Simplified Checklist Items */}
          <div className="space-y-1.5">
            {checklistItems
              .filter(item => item.required) // Only show required items
              .map((item) => {
                const Icon = item.completed ? CheckCircle2 : Circle;
                const sectionId = sectionIdMap[item.id];
                const isClickable = !!sectionId;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      isClickable ? 'cursor-pointer hover:text-foreground' : ''
                    } ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}
                    onClick={() => isClickable && scrollToSection(sectionId)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        scrollToSection(sectionId);
                      }
                    }}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        item.completed ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
