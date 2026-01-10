"use client";

import { forwardRef, useState, useEffect } from "react";
import { Star, ShieldCheck, Clock, Sparkles, Award, User, Check, Heart, Share2, ChevronRight, ChevronLeft } from "lucide-react";
import { VendorAboutSection } from "./VendorAboutSection";
import type { Vendor, PortfolioItem, Review, VendorAward } from "@/lib/supabase/vendors";
import { formatCurrency } from "@/lib/utils";
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, getYear, getMonth, setMonth, setYear, isPast, startOfDay, isSameDay } from "date-fns";
import { useSaveVendor } from "@/hooks/useSaveVendor";

interface VendorContentProps {
  vendor: Vendor;
  portfolio: PortfolioItem[];
  reviews: Review[];
  ratingSectionRef?: React.RefObject<HTMLDivElement>;
}

export const VendorContent = forwardRef<HTMLDivElement, VendorContentProps>(({
  vendor,
  portfolio,
  reviews,
  ratingSectionRef,
  awards = [],
}, connectSectionRef) => {
  const [expandedPackages, setExpandedPackages] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const { isSaved, isLoading, toggleSave, checkSavedStatus } = useSaveVendor({
    vendorId: vendor.id,
    redirectToLogin: true,
  });

  // Check saved status on mount
  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);

  const handleSave = () => {
    toggleSave();
  };

  const handleShare = async () => {
    const shareData = {
      title: vendor.business_name,
      text: `Check out ${vendor.business_name} on OpusFesta`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        if (typeof window !== 'undefined') {
          await navigator.clipboard.writeText(window.location.href);
          // You could show a toast notification here
          alert('Link copied to clipboard!');
        }
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const receptionFeatures = [
    "Free consultation",
    "Free setup & breakdown",
    "Dance floor lighting",
    "Reception sound system with cordless microphone",
    "Professional DJ services",
    "Wireless microphone for speeches",
    "Basic lighting package",
  ];

  const ceremonyReceptionFeatures = [
    "DJ for ceremony, cocktail, dinner & dance party",
    "Free consultation",
    "Dance floor lighting",
    "Master of Ceremony: Introductions & announcements",
    "Ceremony sound system",
    "Cocktail hour music",
    "Dinner background music",
    "Full dance party setup",
  ];

  // Map award icons from string to component
  const getAwardIcon = (iconName: string) => {
    const iconMap: { [key: string]: typeof Star } = {
      Star,
      Sparkles,
      ShieldCheck,
      Award,
    };
    return iconMap[iconName] || Star;
  };

  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  return (
    <div className="space-y-10">
      {/* Vendor Profile Section */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-foreground font-semibold text-lg">
              {vendor.business_name.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{vendor.business_name}</h3>
            <div className="text-sm text-secondary mb-1">{vendor.category}</div>
          </div>
          </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors underline"
            aria-label="Share vendor"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className={`flex items-center gap-2 text-foreground hover:text-primary transition-colors underline ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={isSaved ? "Remove from saved" : "Save vendor"}
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isSaved 
                  ? "text-primary fill-primary" 
                  : "text-foreground"
              }`} 
            />
            <span className="text-sm font-medium">{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* About this vendor */}
      <VendorAboutSection vendor={vendor} />

      {/* Services Section */}
      {(() => {
        // Handle both old string array format and new object format for backward compatibility
        const getServiceTitle = (service: string | { title: string; description: string }): string => {
          return typeof service === 'string' ? service : service.title;
        };

        const getServiceDescription = (service: string | { title: string; description: string }): string | undefined => {
          return typeof service === 'object' ? service.description : undefined;
        };

        const services = vendor.services_offered?.length > 0
          ? vendor.services_offered
          : vendor.subcategories?.length > 0
            ? vendor.subcategories.map((sub) => ({ title: sub, description: '' }))
            : [
                { title: `${vendor.category} consultations`, description: '' },
                { title: "Custom proposals and packages", description: '' },
                { title: "On-site coordination", description: '' },
                { title: "Flexible scheduling", description: '' },
                { title: "Trusted local partners", description: '' },
                { title: "Event-day support", description: '' },
              ];
        
        return (
          <div id="section-services" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
            <h2 className="text-2xl font-bold text-foreground mb-6">What this vendor offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => {
                const title = getServiceTitle(service);
                const description = getServiceDescription(service);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div className="flex-1">
                        <span className="text-foreground font-medium">{title}</span>
                        {description && (
                          <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Prices & Packages Section */}
      <div id="section-pricing" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
        <h2 className="text-2xl font-bold text-foreground mb-6">Prices & packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Reception Package */}
          <div className="border border-border rounded-lg p-6 bg-background">
            <h3 className="text-lg font-bold text-foreground mb-4">Reception Package</h3>
            <div className="mb-4">
              <div className="text-3xl font-bold text-foreground">{formatCurrency(2500000)}</div>
              <div className="text-sm text-secondary">starting price</div>
        </div>
            <div className="flex items-center gap-2 mb-4 text-secondary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">4 hours</span>
          </div>
            <div className="space-y-2 mb-4">
              {(expandedPackages.reception ? receptionFeatures : receptionFeatures.slice(0, 4)).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-foreground">{feature}</span>
        </div>
              ))}
      </div>
            {receptionFeatures.length > 4 && (
              <button 
                onClick={() => togglePackage('reception')}
                className="text-sm text-primary underline hover:no-underline"
              >
                {expandedPackages.reception ? 'See less' : 'See all'}
              </button>
            )}
          </div>

          {/* Ceremony & Reception Package */}
          <div className="border border-border rounded-lg p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-background text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Most popular
            </div>
            <h3 className="text-lg font-bold text-foreground mb-4">Ceremony & Reception Package</h3>
            <div className="mb-4">
              <div className="text-3xl font-bold text-foreground">{formatCurrency(3500000)}</div>
              <div className="text-sm text-secondary">starting price</div>
            </div>
            <div className="flex items-center gap-2 mb-4 text-secondary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">5 hours</span>
            </div>
            <div className="space-y-2 mb-4">
              {(expandedPackages.ceremony ? ceremonyReceptionFeatures : ceremonyReceptionFeatures.slice(0, 4)).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            {ceremonyReceptionFeatures.length > 4 && (
              <button 
                onClick={() => togglePackage('ceremony')}
                className="text-sm text-primary underline hover:no-underline"
              >
                {expandedPackages.ceremony ? 'See less' : 'See all'}
              </button>
            )}
          </div>
        </div>

        {/* Pricing Notes */}
        <div className="space-y-2 mb-6 text-sm text-secondary">
          <div>Starting prices may not include all fees a vendor may charge.</div>
          <div>Couples usually spend {formatCurrency(3500000)} on average</div>
        </div>
      </div>

      {/* Availability Section */}
      <div id="section-availability" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Text Content */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Availability</h2>
            <p className="text-foreground mb-6">
              Reach out to this vendor to confirm their availability, as recent changes may not be reflected in this calendar.
            </p>
            <button className="border-2 border-primary text-primary font-semibold px-6 py-2 rounded-lg hover:bg-primary hover:text-background transition-colors mb-6">
              Ask about a specific date
            </button>
            
            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-foreground">Partially available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary/20 rounded border border-secondary/30"></div>
                <span className="text-sm text-secondary/60">Not available</span>
              </div>
            </div>
          </div>

          {/* Right Side - Calendar */}
          <div className="border border-border rounded-lg p-6 bg-background">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select 
                  value={getMonth(currentMonth)}
                  onChange={(e) => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                  className="text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-1"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {format(new Date(2024, i, 1), "MMMM")}
                    </option>
                  ))}
                </select>
                <select 
                  value={getYear(currentMonth)}
                  onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                  className="text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer appearance-none pr-1"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i - 1;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
                  <div key={day} className="text-center text-xs text-secondary font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar dates */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const monthStart = startOfMonth(currentMonth);
                  const monthEnd = endOfMonth(currentMonth);
                  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                  const firstDayOfWeek = monthStart.getDay();
                  const emptyDays = Array(firstDayOfWeek).fill(null);
                  
                  // Vendor availability dates (demo data)
                  // Available dates - fully available
                  const availableDates = [28, 29, 30, 31];
                  // Partially available dates - limited availability
                  const partiallyAvailableDates = [25, 26, 27];
                  
                  return (
                    <>
                      {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square"></div>
                      ))}
                      {days.map((day) => {
                        const dayNumber = parseInt(format(day, 'd'));
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isPastDate = isPast(startOfDay(day)) && !isSameDay(startOfDay(day), startOfDay(new Date()));
                        const isAvailable = isCurrentMonth && !isPastDate && availableDates.includes(dayNumber);
                        const isPartiallyAvailable = isCurrentMonth && !isPastDate && partiallyAvailableDates.includes(dayNumber);
                        const isUnavailable = isCurrentMonth && (isPastDate || (!availableDates.includes(dayNumber) && !partiallyAvailableDates.includes(dayNumber)));
                        
                        return (
                          <div
                            key={day.toISOString()}
                            className={`aspect-square flex items-center justify-center text-sm rounded ${
                              isAvailable
                                ? 'bg-green-500/30 text-foreground font-medium'
                                : isPartiallyAvailable
                                ? 'bg-yellow-500/30 text-foreground font-medium'
                                : isUnavailable
                                ? 'bg-secondary/20 text-secondary/40 line-through'
                                : isCurrentMonth
                                ? 'text-secondary/60'
                                : 'text-secondary/30'
                            }`}
                          >
                            {dayNumber}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards Section */}
      <div id="section-awards" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Awards & recognition</h2>
            <p className="text-sm text-secondary mt-2">
              Highlights from recent seasons and industry acknowledgements.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-secondary bg-surface border border-border px-3 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            Vetted by OpusFesta
          </div>
        </div>

        {awards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {awards.map((award, index) => {
              const Icon = getAwardIcon(award.icon);
              return (
                <div
                  key={`${award.title}-${award.year}-${index}`}
                  className="border border-border rounded-lg p-5 bg-background flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    {award.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                        <img
                          src={award.image}
                          alt={award.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-secondary">{award.year}</div>
                      <div className="text-base font-semibold text-foreground">{award.title}</div>
                    </div>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{award.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No awards available at this time.</p>
          </div>
        )}
      </div>



    </div>
  );
});

VendorContent.displayName = "VendorContent";
