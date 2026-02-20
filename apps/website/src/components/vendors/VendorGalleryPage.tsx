"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Play, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { resolveAssetSrc } from "@/lib/assets";
import { useAuth } from "@clerk/nextjs";
import type { Vendor, PortfolioItem } from "@/lib/supabase/vendors";

interface VendorGalleryPageProps {
  vendor: Vendor;
  portfolio: PortfolioItem[];
}

// Helper function to check if a URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const videoPlatforms = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         videoPlatforms.some(platform => lowerUrl.includes(platform));
};

// Helper to check if portfolio item is primarily video
const isVideoItem = (item: PortfolioItem): boolean => {
  return item.images.some(url => isVideoUrl(url));
};

export function VendorGalleryPage({
  vendor,
  portfolio,
}: VendorGalleryPageProps) {
  const { isSignedIn, getToken } = useAuth();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Separate videos and images from portfolio
  const { videos, images } = useMemo(() => {
    const videoItems: Array<{ url: string; portfolioItem: PortfolioItem }> = [];
    const imageItems: Array<{ url: string; portfolioItem: PortfolioItem }> = [];

    portfolio.forEach((item) => {
      if (item.images.length > 0) {
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

  // Get cover image
  const coverImageUrl = vendor.cover_image;
  
  // Add cover image to images if it's not a video and not already in the list
  let allImages = images;
  if (coverImageUrl && !isVideoUrl(coverImageUrl)) {
    const coverImageExists = images.some((img) => img.url === coverImageUrl);
    if (!coverImageExists) {
      allImages = [
        { url: coverImageUrl, portfolioItem: { title: vendor.business_name } as PortfolioItem },
        ...images,
      ];
    }
  }

  // Remove duplicate images based on URL
  const uniqueImages = allImages.filter((img, index, self) =>
    index === self.findIndex((t) => t.url === img.url)
  );

  // Combine all media for lightbox
  const allMedia = [...videos, ...uniqueImages];

  // Create bento grid layout with varied sizes
  const bentoGrid = useMemo(() => {
    const items = uniqueImages;
    if (items.length === 0) return [];

    const grid: Array<Array<{ url: string; portfolioItem: PortfolioItem; span: number; rowSpan?: number }>> = [];
    let currentRow: Array<{ url: string; portfolioItem: PortfolioItem; span: number; rowSpan?: number }> = [];
    let currentRowSpan = 0;
    const rowSize = 4; // 4 columns per row

    items.forEach((item, index) => {
      let span = 1;
      let rowSpan = 1;

      // Create varied layout patterns for visual interest
      // Pattern: large items at strategic positions
      if (index % 8 === 0) {
        // Large horizontal item (2 columns)
        span = 2;
      } else if (index % 11 === 0 && currentRowSpan <= 2) {
        // Large horizontal item if there's space
        span = 2;
      }

      // Check if item fits in current row
      if (currentRowSpan + span > rowSize) {
        // Start new row
        if (currentRow.length > 0) {
          grid.push(currentRow);
        }
        currentRow = [{ ...item, span, rowSpan }];
        currentRowSpan = span;
      } else {
        currentRow.push({ ...item, span, rowSpan });
        currentRowSpan += span;
      }

      // If row is full, start new row
      if (currentRowSpan >= rowSize) {
        grid.push(currentRow);
        currentRow = [];
        currentRowSpan = 0;
      }
    });

    // Add last row if it has items
    if (currentRow.length > 0) {
      grid.push(currentRow);
    }

    return grid;
  }, [uniqueImages]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % allMedia.length);
  };

  const handleLightboxPrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  // Check if vendor is saved on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        if (!isSignedIn) {
          setIsSaved(false);
          return;
        }

        const token = await getToken();
        const response = await fetch(`/api/users/saved-vendors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const saved = data.vendors?.some((v: any) => v.id === vendor.id) || false;
          setIsSaved(saved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSavedStatus();
  }, [vendor.id, isSignedIn, getToken]);

  const handleSave = async () => {
    if (isSaving) return;

    // Check if user is authenticated
    if (!isSignedIn) {
      alert('Please sign in to save vendors');
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/vendors/${vendor.id}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${vendor.business_name} Gallery`,
      text: `Check out ${vendor.business_name}'s portfolio gallery on OpusFesta`,
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

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLightboxIndex((prev) => (prev + 1) % allMedia.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allMedia.length]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        {/* Header */}
        <div className="pt-24 pb-8 px-6 lg:px-12 border-b border-border">
          <div className="max-w-[1280px] mx-auto">
            <Link
              href={vendor.slug ? `/vendors/${vendor.slug}` : "/vendors/all"}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to vendor profile
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {vendor.business_name} Gallery
                </h1>
                <p className="text-secondary">
                  {allMedia.length} {allMedia.length === 1 ? 'item' : 'items'} in portfolio
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="border border-border"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`border border-border ${isSaved ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Gallery */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">
          {bentoGrid.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-secondary">No images available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bentoGrid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-4 gap-2 auto-rows-fr"
                >
                  {row.map((item, itemIndex) => {
                    const mediaIndex = allMedia.findIndex(
                      (media) => media.url === item.url
                    );
                    
                    return (
                      <div
                        key={`${item.url}-${itemIndex}`}
                        className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                          item.span === 2 ? 'col-span-2' : 'col-span-1'
                        }`}
                        style={{
                          aspectRatio: item.span === 2 ? '2/1' : '1/1',
                          minHeight: '200px',
                        }}
                        onClick={() => openLightbox(mediaIndex >= 0 ? mediaIndex : 0)}
                      >
                        <Image
                          src={resolveAssetSrc(item.url)}
                          alt={item.portfolioItem?.title || `Image ${itemIndex + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes={item.span === 2 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black border-none rounded-none sm:rounded-lg">
          <DialogTitle className="sr-only">
            {(() => {
              const currentMedia = allMedia[lightboxIndex];
              return currentMedia?.portfolioItem?.title || `${vendor.business_name} - Image ${lightboxIndex + 1} of ${allMedia.length}`;
            })()}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation Buttons */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                  onClick={handleLightboxPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                  onClick={handleLightboxNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Display */}
            {(() => {
              const currentMedia = allMedia[lightboxIndex];
              
              if (!currentMedia) return null;

              const isVideo = videos.some(v => v.url === currentMedia.url);

              if (isVideo) {
                return (
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <Play className="w-10 h-10 text-background ml-1" fill="currentColor" />
                      </div>
                      <h3 className="text-background text-xl font-semibold mb-2">
                        {currentMedia.portfolioItem?.title || "Video"}
                      </h3>
                      <p className="text-background/80 text-sm mb-6">
                        Click below to watch this video
                      </p>
                      <Button
                        variant="default"
                        onClick={() => window.open(currentMedia.url, '_blank')}
                        className="bg-background text-foreground hover:bg-background/90 px-6 py-3 rounded-lg font-semibold"
                      >
                        Watch Video
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={resolveAssetSrc(currentMedia.url)}
                      alt={currentMedia.portfolioItem?.title || `Image ${lightboxIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="95vw"
                      priority
                    />
                  </div>
                </div>
              );
            })()}

            {/* Image Counter and Info */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-background text-sm font-medium border border-white/10">
                  {lightboxIndex + 1} of {allMedia.length}
                </div>
                {allMedia[lightboxIndex]?.portfolioItem?.title && (
                  <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-background text-xs border border-white/10 max-w-xs truncate">
                    {allMedia[lightboxIndex].portfolioItem.title}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
