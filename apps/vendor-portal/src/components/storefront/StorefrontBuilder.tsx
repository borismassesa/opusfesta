'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { supabase } from '@/lib/supabase/client';
import type { Vendor } from '@/lib/supabase/vendor';
import { OnboardingWizard } from './OnboardingWizard';
import { StorefrontOverview, type EditingSection } from './StorefrontOverview';
import { VendorPagePreview } from './VendorPagePreview';
import { BusinessInfoEditor } from './BusinessInfoEditor';
import { ServicesEditor } from './ServicesEditor';
import { PortfolioEditor } from './PortfolioEditor';
import { PackagesEditor } from './PackagesEditor';
import { LocationContactEditor } from './LocationContactEditor';
import { AvailabilityEditor } from './AvailabilityEditor';
import { AwardsEditor } from './AwardsEditor';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Section metadata (for editor headings)
// ---------------------------------------------------------------------------

const SECTION_META: Record<
  NonNullable<EditingSection>,
  { title: string; description: string }
> = {
  'business-info': {
    title: 'Business Info',
    description: 'Your core profile details visible to potential clients.',
  },
  services: {
    title: 'Services',
    description: 'List the services you offer to clients.',
  },
  portfolio: {
    title: 'Portfolio',
    description: 'Showcase your best work with images and descriptions.',
  },
  packages: {
    title: 'Packages & Pricing',
    description: 'Create pricing packages so clients know what to expect.',
  },
  'location-contact': {
    title: 'Location & Contact',
    description: 'Help clients find and reach you.',
  },
  availability: {
    title: 'Availability',
    description: 'Manage your calendar availability.',
  },
  awards: {
    title: 'Awards & Recognition',
    description: 'Highlight your achievements and certifications.',
  },
  preview: {
    title: 'Live Preview',
    description: 'See how your storefront looks to clients.',
  },
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10">
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="flex items-end justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StorefrontBuilder
// ---------------------------------------------------------------------------

export function StorefrontBuilder() {
  const { vendorId, dbUserId, isAccessLoading, needsOnboarding } =
    useVendorPortalAccess();

  const [editingSection, setEditingSection] = useState<EditingSection>(null);

  const {
    data: vendor = null,
    isLoading: isVendorLoading,
    refetch,
  } = useQuery({
    queryKey: ['vendor-profile', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId!)
        .single();

      if (error || !data) return null;
      return data as Vendor;
    },
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const handleUpdate = () => {
    refetch();
  };

  const handleReturnToOverview = () => {
    setEditingSection(null);
  };

  const handleOnboardingComplete = () => {
    refetch();
  };

  // 1. Auth still loading — show skeleton
  if (isAccessLoading) {
    return <LoadingSkeleton />;
  }

  // 2. Not signed in
  if (!dbUserId) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10">
        <Card>
          <CardHeader>
            <CardTitle>Storefront Builder</CardTitle>
            <CardDescription>
              Please sign in and complete onboarding to access the storefront
              builder.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 3. Needs onboarding → wizard (don't wait for vendor profile query)
  if (needsOnboarding || !vendorId) {
    return (
      <OnboardingWizard
        dbUserId={dbUserId}
        vendor={vendor}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 4. Vendor data loading for overview/editor — show skeleton
  if (isVendorLoading || !vendor) {
    return <LoadingSkeleton />;
  }

  // 5a. Live preview
  if (editingSection === 'preview') {
    return (
      <LivePreview
        vendor={vendor}
        onBack={handleReturnToOverview}
      />
    );
  }

  // 5b. Editing a specific section
  if (editingSection !== null) {
    const meta = SECTION_META[editingSection];

    return (
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 animate-in fade-in duration-300">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleReturnToOverview}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Storefront
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>

        {renderEditor(editingSection, vendor, dbUserId, handleUpdate, handleReturnToOverview)}
      </div>
    );
  }

  // 6. Default → overview
  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10">
      <StorefrontOverview vendor={vendor} onEditSection={setEditingSection} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor renderer
// ---------------------------------------------------------------------------

function renderEditor(
  section: NonNullable<EditingSection>,
  vendor: Vendor,
  dbUserId: string,
  onUpdate: () => void,
  onBack: () => void,
) {
  switch (section) {
    case 'business-info':
      return (
        <BusinessInfoEditor
          vendor={vendor}
          dbUserId={dbUserId}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    case 'services':
      return (
        <ServicesEditor
          vendor={vendor}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    case 'portfolio':
      return (
        <PortfolioEditor
          vendorId={vendor.id}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    case 'packages':
      return (
        <PackagesEditor
          vendorId={vendor.id}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    case 'location-contact':
      return (
        <LocationContactEditor
          vendor={vendor}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    case 'availability':
      return (
        <AvailabilityEditor vendorId={vendor.id} onNextSection={onBack} />
      );
    case 'awards':
      return (
        <AwardsEditor
          vendorId={vendor.id}
          onUpdate={onUpdate}
          onNextSection={onBack}
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Live Preview (renders StorefrontPreview in responsive viewport)
// ---------------------------------------------------------------------------

const PREVIEW_SIZES = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
} as const;

type PreviewSize = keyof typeof PREVIEW_SIZES;

function LivePreview({
  vendor,
  onBack,
}: {
  vendor: Vendor;
  onBack: () => void;
}) {
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://opusfesta.com';
  const liveUrl = vendor.slug ? `${websiteUrl}/vendors/${vendor.slug}` : null;

  return (
    <div className="px-6 pb-20 pt-8 md:px-10 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Storefront
        </Button>

        <div className="flex items-center gap-2">
          {/* Viewport size toggles */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-1">
            <button
              onClick={() => setPreviewSize('desktop')}
              className={`rounded-md p-1.5 transition-colors ${previewSize === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewSize('tablet')}
              className={`rounded-md p-1.5 transition-colors ${previewSize === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewSize('mobile')}
              className={`rounded-md p-1.5 transition-colors ${previewSize === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Open actual live page in new tab */}
          {liveUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Open Live Page
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Live Preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is how your storefront looks to clients on {PREVIEW_SIZES[previewSize].label.toLowerCase()} devices.
        </p>
      </div>

      {/* Preview container with responsive viewport */}
      <div className="flex justify-center">
        <div
          className="w-full overflow-hidden rounded-2xl border bg-white p-6 md:p-8 transition-all duration-300 shadow-sm"
          style={{ maxWidth: PREVIEW_SIZES[previewSize].width }}
        >
          <VendorPagePreview vendor={vendor} />
        </div>
      </div>
    </div>
  );
}
