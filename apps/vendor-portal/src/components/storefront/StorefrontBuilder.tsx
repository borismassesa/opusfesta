'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { StorefrontForm } from './StorefrontForm';
import { ServicesManager } from './ServicesManager';
import { PortfolioManager } from './PortfolioManager';
import { PackagesPricingManager } from './PackagesPricingManager';
import { AvailabilityManager } from './AvailabilityManager';
import { AwardsManager } from './AwardsManager';
import { ReviewsManager } from './ReviewsManager';
import { ProfileSettings } from './ProfileSettings';
import { ResponsivePreview } from './ResponsivePreview';
import { StorefrontSecondarySidebar } from './StorefrontSecondarySidebar';
import { getVendorByUserId, type Vendor } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function StorefrontBuilder() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('section-business-info');

  // Debug: Check Supabase client initialization on mount
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('[StorefrontBuilder] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[StorefrontBuilder] Missing Supabase environment variables!');
      console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
  }, []);

  // Get current user ID from Supabase auth
  // Note: AuthGuard at root level ensures user is authenticated, so we just need to get userId
  useEffect(() => {
    let mountedRef = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mountedRef) return;

        if (error) {
          console.error('[StorefrontBuilder] Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user?.id) {
          setUserId(session.user.id);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('[StorefrontBuilder] Exception getting session:', error);
        if (mountedRef) {
          setIsLoading(false);
        }
      }
    };

    getUser();

    // Listen to auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef) return;
      
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    subscription = authSubscription;

    return () => {
      mountedRef = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch vendor data
  const { data: vendorData, isLoading: isLoadingVendor, refetch } = useQuery({
    queryKey: ['vendor', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getVendorByUserId(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (vendorData) {
      setVendor(vendorData);
    }
  }, [vendorData]);

  // Combined loading state
  const isDataLoading = isLoading || (!!userId && isLoadingVendor);

  // Debug: Log activeSection changes (must be before any conditional returns)
  useEffect(() => {
    console.log('[StorefrontBuilder] activeSection changed to:', activeSection);
  }, [activeSection]);

  // Define section order for navigation (must be before any conditional returns)
  const sectionOrder = [
    'section-business-info',
    'section-services',
    'section-packages',
    'section-availability',
    'section-awards',
    'section-reviews',
    'section-profile-settings',
    'section-preview',
  ];

  const goToNextSection = () => {
    const currentIndex = sectionOrder.indexOf(activeSection);
    if (currentIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentIndex + 1]);
    }
  };

  const handleSectionChange = useCallback((sectionId: string) => {
    console.log('[StorefrontBuilder] handleSectionChange called with:', sectionId);
    setActiveSection((prevSection) => {
      console.log('[StorefrontBuilder] setActiveSection called, prev:', prevSection, 'new:', sectionId);
      if (prevSection === sectionId) {
        console.warn('[StorefrontBuilder] Section is already active, skipping update');
        return prevSection;
      }
      return sectionId;
    });
  }, []);

  // Render content based on active section
  const renderSectionContent = () => {
    // Show loading state while fetching vendor data
    if (isDataLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading your storefront...</p>
          </div>
        </div>
      );
    }

    // Render section content - allow all sections to render even if vendor doesn't exist yet
    // Components will handle the null vendor case appropriately
    console.log('[StorefrontBuilder] Rendering section:', activeSection, 'vendor exists:', !!vendor);
    
    // Helper function to wrap sections with consistent heading/subheading
    const SectionWrapper = ({ 
      title, 
      description, 
      children 
    }: { 
      title: string; 
      description: string; 
      children: React.ReactNode;
    }) => (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        {children}
      </div>
    );

    switch (activeSection) {
      case 'section-business-info':
        console.log('[StorefrontBuilder] Rendering StorefrontForm');
        return (
          <SectionWrapper
            title={!vendor ? 'Create Your Storefront' : 'Business Information'}
            description={!vendor 
              ? 'Get started by creating your vendor profile. This will be your public storefront on The Festa.'
              : 'Manage your business details that appear on your public storefront.'}
          >
            <StorefrontForm vendor={vendor} userId={userId} onUpdate={refetch} onNextSection={goToNextSection} />
          </SectionWrapper>
        );
      case 'section-services':
        console.log('[StorefrontBuilder] Rendering ServicesManager');
        return (
          <SectionWrapper
            title="Services"
            description="List the services you offer. These will appear in the 'What this vendor offers' section on your storefront."
          >
            <ServicesManager vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-portfolio':
        console.log('[StorefrontBuilder] Rendering PortfolioManager');
        return (
          <SectionWrapper
            title="Portfolio"
            description="Showcase your work with images and galleries that appear on your public storefront."
          >
            <PortfolioManager vendor={vendor} onUpdate={refetch} onNextSection={goToNextSection} />
          </SectionWrapper>
        );
      case 'section-packages':
        console.log('[StorefrontBuilder] Rendering PackagesPricingManager');
        return (
          <SectionWrapper
            title="Packages & Pricing"
            description="Create pricing packages that appear on your public storefront to help customers understand your offerings."
          >
            <PackagesPricingManager vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-availability':
        console.log('[StorefrontBuilder] Rendering AvailabilityManager');
        return (
          <SectionWrapper
            title="Availability"
            description="Manage your calendar and availability so customers can see when you're available for bookings."
          >
            <AvailabilityManager vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-awards':
        console.log('[StorefrontBuilder] Rendering AwardsManager');
        return (
          <SectionWrapper
            title="Awards & Recognition"
            description="Showcase your achievements and industry recognition to build trust with potential customers."
          >
            <AwardsManager vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-profile-settings':
        console.log('[StorefrontBuilder] Rendering ProfileSettings');
        return (
          <SectionWrapper
            title="Profile Settings"
            description="Update profile information and settings that are displayed on your public storefront."
          >
            <ProfileSettings vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-reviews':
        console.log('[StorefrontBuilder] Rendering ReviewsManager');
        return (
          <SectionWrapper
            title="Reviews & Ratings"
            description="View and respond to customer reviews. You cannot edit reviews, only respond to them."
          >
            <ReviewsManager vendor={vendor} onUpdate={refetch} />
          </SectionWrapper>
        );
      case 'section-preview':
        console.log('[StorefrontBuilder] Rendering ResponsivePreview');
        return (
          <SectionWrapper
            title="Preview"
            description="See how your storefront appears on different devices and screen sizes."
          >
            <ResponsivePreview vendor={vendor} />
          </SectionWrapper>
        );
      default:
        console.log('[StorefrontBuilder] Rendering default StorefrontForm');
        return (
          <SectionWrapper
            title="Business Information"
            description="Manage your business details that appear on your public storefront."
          >
            <StorefrontForm vendor={vendor} userId={userId} onUpdate={refetch} />
          </SectionWrapper>
        );
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Secondary Sidebar */}
      <StorefrontSecondarySidebar 
        vendor={vendor} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-hidden bg-background flex flex-col">
        {activeSection === 'section-preview' ? (
          <div className="flex-1 min-h-0 overflow-hidden px-6 py-8">
            {renderSectionContent()}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
            {renderSectionContent()}
          </div>
        )}
      </div>
    </div>
  );
}
