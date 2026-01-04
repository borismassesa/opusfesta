'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ShieldCheck, Star, MapPin, Calendar, Award, Clock, Check, Heart, Share2, ChevronRight, ChevronLeft, Sparkles, User, MessageSquare, Facebook, Twitter, Instagram, Globe, Phone, Play, X, Grid3x3 } from 'lucide-react';
import { type Vendor, type PortfolioItem, type VendorAward } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio, getVendorPackages, getVendorAwards, getVendorReviews } from '@/lib/supabase/vendor';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getYear, getMonth, setMonth, setYear, isPast, startOfDay, isSameDay, addMonths } from 'date-fns';
import { useRouter } from 'next/navigation';

interface VendorDetailsPreviewProps {
  vendor: Vendor | null;
}

type VendorReview = {
  id: string;
  rating: number | null;
  created_at: string;
  content: string | null;
  vendor_response?: string | null;
  user?: {
    name?: string | null;
    avatar?: string | null;
  } | null;
};

const vendorNavigationTabs = [
  { id: "about", label: "About" },
  { id: "profile", label: "Vendor Profile" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Pricing" },
  { id: "availability", label: "Availability" },
  { id: "awards", label: "Awards" },
  { id: "reviews", label: "Reviews" },
];

export function VendorDetailsPreview({ vendor }: VendorDetailsPreviewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');
  const [showNavBar, setShowNavBar] = useState(false);
  const [isSidebarSticky, setIsSidebarSticky] = useState(true);
  const [expandedPackages, setExpandedPackages] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(4);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const ratingSectionRef = useRef<HTMLDivElement>(null);

  const { data: portfolio = [] } = useQuery({
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

  const { data: reviews = [] } = useQuery<VendorReview[]>({
    queryKey: ['reviews', vendor?.id],
    queryFn: async (): Promise<VendorReview[]> => {
      if (!vendor) return [];
      return await getVendorReviews(vendor.id) as VendorReview[];
    },
    enabled: !!vendor,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    const trimmed = duration.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed} hours`;
    }
    return trimmed;
  };

  const getStartingPrice = () => {
    if (packages.length > 0) {
      const minPrice = Math.min(...packages.map((pkg) => pkg.starting_price));
      return formatCurrency(minPrice);
    }
    if (vendor?.price_range === '$') return 'TSh 200,000';
    if (vendor?.price_range === '$$') return 'TSh 500,000';
    if (vendor?.price_range === '$$$') return 'TSh 1,000,000';
    if (vendor?.price_range === '$$$$') return 'TSh 2,500,000';
    return 'TSh 500,000';
  };

  // Helper function to check if a URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
    const videoPlatforms = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
           videoPlatforms.some(platform => lowerUrl.includes(platform));
  };

  // Helper function to check if a portfolio item is a video
  const isVideoItem = (item: PortfolioItem): boolean => {
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    return title.includes('video') || 
           title.includes('videography') || 
           description.includes('video') ||
           description.includes('videography');
  };

  // Separate videos and images from portfolio
  const { videos, images } = useMemo(() => {
    const videoItems: Array<{ url: string; portfolioItem: PortfolioItem }> = [];
    const imageItems: Array<{ url: string; portfolioItem: PortfolioItem }> = [];

    portfolio.forEach((item) => {
      if (item.images && item.images.length > 0) {
        item.images.forEach((url) => {
          const isVideo = isVideoUrl(url) || isVideoItem(item);
          if (isVideo) {
            videoItems.push({ url, portfolioItem: item });
          } else {
            imageItems.push({ url, portfolioItem: item });
          }
        });
      }
    });

    return { videos: videoItems, images: imageItems };
  }, [portfolio]);

  useEffect(() => {
    if (!vendor) return;
    const handleScroll = () => {
      if (galleryRef.current) {
        const galleryBottom = galleryRef.current.getBoundingClientRect().bottom;
        setShowNavBar(galleryBottom < 0);
      }

      // Check if rating section has been scrolled past
      let ratingSection: HTMLElement | null = null;
      if (ratingSectionRef.current) {
        ratingSection = ratingSectionRef.current;
      } else {
        ratingSection = document.querySelector('[data-rating-section="true"]') as HTMLElement;
      }

      if (ratingSection) {
        const ratingSectionRect = ratingSection.getBoundingClientRect();
        const ratingSectionBottom = ratingSectionRect.bottom;
        const shouldBeSticky = ratingSectionBottom > 144;
        setIsSidebarSticky(shouldBeSticky);
      }

      // Update active tab
      const navOffset = 180;
      const viewportTop = window.scrollY + navOffset;
      const viewportBottom = window.scrollY + window.innerHeight;
      let activeSection = vendorNavigationTabs[0].id;
      let maxVisibleHeight = -1;

      for (const tab of vendorNavigationTabs) {
        const element = document.getElementById(`section-${tab.id}`);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = rect.bottom + window.scrollY;
        const visibleTop = Math.max(elementTop, viewportTop);
        const visibleBottom = Math.min(elementBottom, viewportBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeSection = tab.id;
        }
      }

      setActiveTab(activeSection);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [vendor]);

  if (!vendor) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Complete your storefront to see preview</p>
      </div>
    );
  }

  const rating = vendor.stats?.averageRating || 0;
  const reviewCount = vendor.stats?.reviewCount || reviews.length;
  const locationText = vendor.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || 'Tanzania'}`
    : 'Tanzania';

  // Use only portfolio images (exclude cover image and logo)
  // Remove duplicate images based on URL
  const uniqueImages = images.filter((img, index, self) =>
    index === self.findIndex((t) => t.url === img.url)
  );
  const allImages = uniqueImages;

  // Get the first video for the large card, or fallback to first image
  const mainVideo = videos.length > 0 ? videos[0] : null;
  const mainImage = mainVideo ? null : (allImages[selectedImageIndex] || allImages[0] || null);

  // Get the next 4 unique images for thumbnails
  const thumbnailImages = allImages.slice(0, 4);

  const hasMoreImages = allImages.length > 4 || videos.length > 1;
  const totalMediaCount = allImages.length + videos.length;

  const openLightbox = (index: number = 0) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    const allMedia = [...videos, ...allImages];
    setLightboxIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handleLightboxPrevious = () => {
    const allMedia = [...videos, ...allImages];
    setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mainVideo) {
      window.open(mainVideo.url, '_blank');
    }
  };

  // Full description
  const fullDescription = vendor.description || vendor.bio || '';
  const sentences = fullDescription.match(/[^.!?]+[.!?]+/g) || [fullDescription];
  const visibleSentences = 4;
  const shouldTruncate = sentences.length > visibleSentences;
  const truncatedText = sentences.slice(0, visibleSentences).join(' ').trim();
  const displayDescription = isExpanded || !shouldTruncate
    ? fullDescription
    : truncatedText + (truncatedText.length < fullDescription.length ? '...' : '');

  // Services - Handle both old string array format and new object format for backward compatibility
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
          { title: 'Custom proposals and packages', description: '' },
          { title: 'On-site coordination', description: '' },
          { title: 'Flexible scheduling', description: '' },
          { title: 'Trusted local partners', description: '' },
          { title: 'Event-day support', description: '' },
        ];

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;
    return {
      stars: star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calendar dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);
  const availableDates = [28, 29, 30, 31];
  const partiallyAvailableDates = [25, 26, 27];

  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const toggleReviewExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const getTeamSizeLabel = () => {
    if (!vendor.team_size) return null;
    if (vendor.team_size <= 2) return 'Small team (1-2 members)';
    if (vendor.team_size <= 10) return 'Small team (2-10 members)';
    if (vendor.team_size <= 50) return 'Medium team (11-50 members)';
    return 'Large team (50+ members)';
  };

  const getYearsLabel = () => {
    if (!vendor.years_in_business) return null;
    return `${vendor.years_in_business}+ years in business`;
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="pt-12 pb-8">
        {/* Sticky Navigation Bar */}
        {showNavBar && (
          <nav className="fixed top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-all">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
              <div className="hidden lg:flex items-center gap-6 font-medium text-sm text-secondary">
                {vendorNavigationTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        const element = document.getElementById(`section-${tab.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`transition-colors whitespace-nowrap pb-4 -mb-4 ${
                        isActive
                          ? 'text-primary border-b-2 border-primary'
                          : 'hover:text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              {!isSidebarSticky && (
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{getStartingPrice()}</div>
                    <div className="text-xs text-muted-foreground">per event</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-base font-semibold">{rating.toFixed(2)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
                  </div>
                  <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Request Quote
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Image Gallery */}
        {allImages.length === 0 && videos.length === 0 ? (
          <div ref={galleryRef} className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-4">
            <div className="relative w-full h-[300px] bg-surface rounded-xl border border-border flex items-center justify-center">
              <p className="text-muted-foreground">No media available</p>
            </div>
          </div>
        ) : (
          <div ref={galleryRef} id="section-portfolio" className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-1 scroll-mt-32 lg:scroll-mt-40">
            <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_0.4fr] gap-2">
              {/* Main Large Card - Video or Image (Left Side 60%) */}
              <div
                className="relative h-[320px] md:h-[380px] lg:h-[440px] rounded-2xl overflow-hidden cursor-pointer group bg-surface"
                onClick={mainVideo ? handleVideoClick : () => {
                  const imageIndex = videos.length + selectedImageIndex;
                  openLightbox(imageIndex);
                }}
              >
                {mainVideo ? (
                  <div className="relative w-full h-full bg-surface">
                    {(() => {
                      const thumbnailImage = mainVideo.portfolioItem.images?.find(
                        (img) => !isVideoUrl(img)
                      );
                      if (thumbnailImage) {
                        return (
                          <img
                            src={thumbnailImage}
                            alt={mainVideo.portfolioItem.title || "Video thumbnail"}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-16 h-16 mx-auto mb-2 text-primary" fill="currentColor" />
                            <p className="text-sm font-medium text-foreground">
                              {mainVideo.portfolioItem.title || "Video"}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                ) : mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.portfolioItem?.title || vendor.business_name || "Vendor image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid - Images Only (Right Side 40%) */}
              <div className="grid grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-2 h-[320px] md:h-[380px] lg:h-[440px]">
                {thumbnailImages.map((img, index) => {
                  const originalIndex = allImages.findIndex(
                    (allImg) => allImg.url === img.url
                  );
                  const isLastThumbnail = index === thumbnailImages.length - 1;

                  return (
                    <div
                      key={`${img.url}-${index}`}
                      className="relative h-[145px] md:h-[170px] lg:h-full rounded-2xl overflow-hidden cursor-pointer group bg-surface"
                      onClick={() => {
                        if (!isLastThumbnail || !hasMoreImages) {
                          const imageIndex = videos.length + originalIndex;
                          openLightbox(imageIndex);
                        }
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.portfolioItem?.title || `Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isLastThumbnail && hasMoreImages && (
                        <>
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-[1]" />
                          <button
                            type="button"
                            className="absolute bottom-3 right-3 z-10 group/button"
                            onClick={(event) => {
                              event.stopPropagation();
                              const imageIndex = videos.length + originalIndex;
                              openLightbox(imageIndex);
                            }}
                          >
                            <div className="bg-background/95 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-border/50 text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-background transition-all hover:scale-105 group-hover/button:border-primary/30">
                              <Grid3x3 className="w-3.5 h-3.5 text-primary" />
                              <span className="text-foreground whitespace-nowrap">
                                Show all {totalMediaCount}
                              </span>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                {thumbnailImages.length < 4 &&
                  Array.from({ length: 4 - thumbnailImages.length }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="relative h-[145px] md:h-[170px] lg:h-full rounded-2xl bg-surface border border-border"
                    />
                  ))}
              </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" 
                onClick={() => setIsLightboxOpen(false)}
              >
                <div 
                  className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                    onClick={() => setIsLightboxOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>

                  {/* Media Display */}
                  {(() => {
                    const allMedia = [...videos, ...allImages];
                    const currentMedia = allMedia[lightboxIndex];
                    
                    if (!currentMedia) return null;

                    const isVideo = videos.some(v => v.url === currentMedia.url);

                    if (isVideo) {
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-16 h-16 mx-auto mb-4 text-white" fill="currentColor" />
                            <p className="text-white text-lg font-medium mb-4">
                              {currentMedia.portfolioItem?.title || "Video"}
                            </p>
                            <Button
                              onClick={() => window.open(currentMedia.url, '_blank')}
                              className="bg-white text-foreground hover:bg-gray-100"
                            >
                              Open Video
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={currentMedia.url}
                          alt={currentMedia.portfolioItem?.title || "Gallery image"}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    );
                  })()}

                  {/* Navigation Buttons */}
                  {(() => {
                    const allMedia = [...videos, ...allImages];
                    if (allMedia.length <= 1) return null;

                    return (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 z-50 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLightboxPrevious();
                          }}
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 z-50 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLightboxNext();
                          }}
                        >
                          <ChevronRight className="w-8 h-8" />
                        </Button>
                      </>
                    );
                  })()}

                  {/* Media Counter */}
                  {(() => {
                    const allMedia = [...videos, ...allImages];
                    if (allMedia.length <= 1) return null;

                    return (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
                        {lightboxIndex + 1} / {allMedia.length}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
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
                    <div className="text-sm text-muted-foreground mb-1">{vendor.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors underline">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors underline">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div id="section-about" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <h2 className="text-3xl font-bold text-foreground">About this venue</h2>
                  <div className="flex items-center gap-2">
                    {vendor.social_links?.facebook && (
                      <a
                        href={vendor.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Facebook size={18} className="text-foreground" />
                      </a>
                    )}
                    {vendor.social_links?.twitter && (
                      <a
                        href={vendor.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Twitter size={18} className="text-foreground" />
                      </a>
                    )}
                    {vendor.social_links?.instagram && (
                      <a
                        href={vendor.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Instagram size={18} className="text-foreground" />
                      </a>
                    )}
                    {vendor.contact_info?.website && (
                      <a
                        href={vendor.contact_info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Globe size={18} className="text-foreground" />
                      </a>
                    )}
                    {vendor.contact_info?.phone && (
                      <a
                        href={`tel:${vendor.contact_info.phone}`}
                        className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Phone size={18} className="text-foreground" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Contact Person Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-background border border-border rounded-2xl p-6 text-center">
                      {vendor.logo ? (
                        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-border">
                          <img
                            src={vendor.logo}
                            alt={vendor.business_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                          <span className="text-3xl font-semibold text-foreground">
                            {vendor.business_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-primary mb-1">
                        {vendor.business_name}
                      </h3>
                      <p className="text-sm text-muted-foreground uppercase mb-6">
                        {vendor.category}
                      </p>
                      <button 
                        onClick={() => router.push('/messages')}
                        className="w-full border-2 border-primary text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Message Vendor
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Description */}
                  <div className="lg:col-span-2">
                    {fullDescription && (
                      <div className="space-y-4 mb-6">
                        <p className="text-foreground leading-relaxed text-base">
                          {displayDescription}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary underline font-medium hover:text-primary/80 transition-colors text-sm"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Business Attributes */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      {getYearsLabel() && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-foreground">{getYearsLabel()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">Speaks English</span>
                      </div>
                      {getTeamSizeLabel() && (
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-primary">{getTeamSizeLabel()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
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

              {/* Prices & Packages Section */}
              <div id="section-pricing" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
                <h2 className="text-2xl font-bold text-foreground mb-6">Prices & packages</h2>
                {packages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {packages.map((pkg, index) => {
                      const isPopular = pkg.is_popular;
                      const packageId = pkg.id || `pkg-${index}`;
                      const features = pkg.features || [];
                      const isExpanded = expandedPackages[packageId] || false;
                      const displayFeatures = isExpanded ? features : features.slice(0, 4);

                      return (
                        <div
                          key={packageId}
                          className={`border border-border rounded-lg p-6 bg-background relative overflow-hidden ${
                            isPopular ? 'border-primary border-2' : ''
                          }`}
                        >
                          {isPopular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                              Most popular
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-foreground mb-4">{pkg.name}</h3>
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-foreground">
                              {formatCurrency(pkg.starting_price)}
                            </div>
                            <div className="text-sm text-muted-foreground">starting price</div>
                          </div>
                          {pkg.duration && (
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{formatDuration(pkg.duration)}</span>
                            </div>
                          )}
                          <div className="space-y-2 mb-4">
                            {displayFeatures.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                                <span className="text-sm text-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          {features.length > 4 && (
                            <button
                              onClick={() => togglePackage(packageId)}
                              className="text-sm text-primary underline hover:no-underline"
                            >
                              {isExpanded ? 'See less' : 'See all'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-6">No packages available yet.</p>
                )}
                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <div>Starting prices may not include all fees a vendor may charge.</div>
                  <div>Couples usually spend {formatCurrency(3500000)} on average</div>
                </div>
              </div>

              {/* Availability Section */}
              <div id="section-availability" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Availability</h2>
                    <p className="text-foreground mb-6">
                      Reach out to this vendor to confirm their availability, as recent changes may not be reflected in this calendar.
                    </p>
                    <button className="border-2 border-primary text-primary font-semibold px-6 py-2 rounded-lg hover:bg-primary hover:text-background transition-colors mb-6">
                      Ask about a specific date
                    </button>
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
                        <div className="w-4 h-4 bg-muted rounded border border-border"></div>
                        <span className="text-sm text-muted-foreground">Not available</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-6 bg-background">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={getMonth(currentMonth)}
                          onChange={(e) => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                          className="text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {format(new Date(2024, i, 1), 'MMMM')}
                            </option>
                          ))}
                        </select>
                        <select
                          value={getYear(currentMonth)}
                          onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                          className="text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
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
                      >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
                          <div key={day} className="text-center text-xs text-muted-foreground font-medium">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
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
                                  ? 'bg-muted text-muted-foreground line-through'
                                  : isCurrentMonth
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground/30'
                              }`}
                            >
                              {dayNumber}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Awards Section */}
              {awards.length > 0 && (
                <div id="section-awards" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Awards & recognition</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        Highlights from recent seasons and industry acknowledgements.
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-surface border border-border px-3 py-2 rounded-full">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Vetted by TheFesta
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {awards.map((award: VendorAward, idx: number) => (
                      <div
                        key={idx}
                        className="border border-border rounded-lg p-5 bg-background flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                            <Award className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground">{award.year || '2024'}</div>
                            <div className="text-base font-semibold text-foreground">{award.title}</div>
                          </div>
                        </div>
                        {award.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{award.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="hidden lg:block">
              <div className={`sticky ${isSidebarSticky ? 'top-36' : 'top-4'}`}>
                <div className="bg-background border border-border rounded-lg p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getStartingPrice()}</div>
                    <div className="text-sm text-muted-foreground">per event</div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-lg font-semibold">{rating.toFixed(2)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
                  </div>
                  <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Request Quote
                  </button>
                  <div className="pt-4 border-t border-border space-y-3 text-sm">
                    {vendor.contact_info?.phone && (
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{vendor.contact_info.phone}</p>
                      </div>
                    )}
                    {vendor.contact_info?.email && (
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{vendor.contact_info.email}</p>
                      </div>
                    )}
                    {vendor.years_in_business && (
                      <div>
                        <p className="text-muted-foreground">Years in Business</p>
                        <p className="font-medium">{vendor.years_in_business}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-6">
          {/* Reviews Section */}
          <div
            id="section-reviews"
            ref={ratingSectionRef}
            data-rating-section="true"
            className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40"
          >
            {/* Rating Section */}
            <div className="py-10 border-b border-border">
              <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                <div className="flex flex-col items-start max-w-sm">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {rating >= 4.8 && reviewCount >= 50 ? 'Guest favourite' : 'Highly rated'}
                  </div>
                  <div className="mt-4 flex items-end gap-4">
                    <span className="text-[72px] md:text-[96px] font-semibold text-foreground leading-none tracking-tight">
                      {rating.toFixed(2)}
                    </span>
                    <div className="pb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Overall rating</div>
                    </div>
                  </div>
                  <p className="text-foreground/80 mt-3 text-sm leading-relaxed">
                    {rating >= 4.8 && reviewCount >= 50
                      ? 'This vendor is a guest favourite based on ratings, reviews, and reliability.'
                      : 'Couples consistently rate this vendor highly for their care and professionalism.'}
                  </p>
                </div>

                <div className="grid gap-5 flex-1">
                  {[
                    { icon: Star, title: 'Highly rated', body: 'Recent couples loved working with this vendor.' },
                    { icon: Clock, title: 'Fast response time', body: 'Quick replies and professional communication.' },
                    { icon: ShieldCheck, title: 'Verified professional', body: 'This vendor has been verified for quality and reliability.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-full border border-border text-foreground flex items-center justify-center">
                        <item.icon className="w-5 h-5" strokeWidth={1.6} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.length > 0 && (
                  <div className="lg:w-[360px] w-full flex-shrink-0">
                    <div className="mb-5">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Reviews</div>
                      <h2 className="text-3xl font-semibold text-foreground mt-2">
                        {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {ratingBreakdown.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 w-16 flex-shrink-0">
                            <span className="text-sm text-foreground font-semibold min-w-[18px]">{stars}</span>
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          </div>
                          <div className="flex-1 h-3 bg-muted/15 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(percentage, 2)}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground w-10 text-right font-semibold flex-shrink-0">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Grid */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pb-10">
                {sortedReviews.slice(0, displayCount).map((review) => {
                  const isExpanded = expandedReviews.has(review.id);
                  const reviewText = review.content || '';
                  const shouldTruncate = reviewText.length > 220;
                  const displayText = isExpanded || !shouldTruncate
                    ? reviewText
                    : `${reviewText.substring(0, 220)}...`;
                  const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <div key={review.id} className="space-y-4 pb-6 border-b border-border last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 border border-border">
                          <AvatarImage
                            src={review.user?.avatar}
                            alt={review.user?.name}
                          />
                          <AvatarFallback className="bg-surface text-foreground">
                            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-foreground">{review.user?.name || 'Anonymous'}</div>
                            <div className="text-sm text-muted-foreground">{reviewDate}</div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (review.rating || 0)
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {(review.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className={`text-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-4'}`}>
                          {displayText}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleReviewExpanded(review.id)}
                            className="text-foreground font-semibold underline text-sm hover:text-primary transition-colors"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                        {review.vendor_response && (
                          <div className="mt-4 pl-4 border-l-2 border-primary bg-surface/50 rounded-r-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-foreground font-semibold text-sm">
                                {vendor.business_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-foreground">{vendor.business_name}</div>
                                <div className="text-xs text-muted-foreground">Vendor</div>
                              </div>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{review.vendor_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to review this vendor!</p>
              </div>
            )}

            {sortedReviews.length > displayCount && (
              <div className="flex justify-center pt-6 pb-10">
                <button
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-background transition-colors"
                >
                  View more reviews
                </button>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div id="section-location" className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">Where the vendor is based</h2>
            <p className="text-muted-foreground mb-6">{locationText}</p>
            <div className="border border-border rounded-2xl overflow-hidden bg-surface mb-6 relative h-[380px] md:h-[480px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Map preview</p>
                <p className="text-muted-foreground/60 text-xs mt-2">Location: {locationText}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-background">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  This vendor&apos;s location is verified, and the exact location will be provided after booking.
                </p>
                <a href="#" className="text-sm text-primary hover:underline mt-1 inline-block">
                  Learn about verification
                </a>
              </div>
            </div>
          </div>

          {/* Vendor Profile Section */}
          <div id="section-profile" className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8">Team</h2>
            {vendor.team_size && vendor.team_size > 1 && (
              <div className="mb-6">
                <p className="text-base text-muted-foreground">
                  {getTeamSizeLabel()} {vendor.team_size} {vendor.team_size === 1 ? 'member' : 'members'}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-background border border-border rounded-2xl p-6 text-center">
                {vendor.logo ? (
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-border">
                    <img
                      src={vendor.logo}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                    <span className="text-3xl font-semibold text-foreground">
                      {vendor.business_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-primary mb-1">{vendor.business_name}</h3>
                <p className="text-sm text-muted-foreground uppercase mb-4">{vendor.category}</p>
                <button 
                  onClick={() => router.push('/messages')}
                  className="w-full border-2 border-primary text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Message Vendor
                </button>
              </div>
            </div>
          </div>

          {/* Payment Protection */}
          <div className="pt-12 border-t border-border">
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-surface pb-6">
              <ShieldCheck className="w-5 h-5 text-foreground shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-sm text-foreground">
                  To help protect your payment, always use TheFesta to send money and communicate with vendors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
