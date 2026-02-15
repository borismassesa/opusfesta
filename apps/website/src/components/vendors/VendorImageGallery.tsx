"use client";

import { useState, forwardRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { resolveAssetSrc } from "@/lib/assets";
import type { Vendor, PortfolioItem } from "@/lib/supabase/vendors";

interface VendorImageGalleryProps {
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

// Helper function to check if a portfolio item is a video
const isVideoItem = (item: PortfolioItem): boolean => {
  const title = item.title?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  return title.includes('video') || 
         title.includes('videography') || 
         description.includes('video') ||
         description.includes('videography');
};

export const VendorImageGallery = forwardRef<HTMLDivElement, VendorImageGalleryProps>(({
  vendor,
  portfolio,
}, ref) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
  } else if (coverImageUrl && images.length === 0 && !isVideoUrl(coverImageUrl)) {
    allImages = [
      { url: coverImageUrl, portfolioItem: { title: vendor.business_name } as PortfolioItem },
    ];
  }

  // Remove duplicate images based on URL
  const uniqueImages = allImages.filter((img, index, self) =>
    index === self.findIndex((t) => t.url === img.url)
  );
  allImages = uniqueImages;

  // Get the first video for the large card, or fallback to first image
  const mainVideo = videos.length > 0 ? videos[0] : null;
  const mainImage = mainVideo ? null : (allImages[selectedImageIndex] || allImages[0] || null);

  // Get the next 4 unique images for thumbnails
  const thumbnailImages = allImages.slice(0, 4);
  
  const hasMoreImages = allImages.length > 4 || videos.length > 1;
  const totalMediaCount = allImages.length + videos.length;

  const handleThumbnailClick = (originalIndex: number) => {
    setSelectedImageIndex(originalIndex);
  };

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
    // Open video in new tab or play inline
    if (mainVideo) {
      window.open(mainVideo.url, '_blank');
    }
  };

  // If no media at all, show placeholder
  if (allImages.length === 0 && videos.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-4">
        <div className="relative w-full h-[300px] bg-surface rounded-xl border border-border flex items-center justify-center">
          <p className="text-secondary">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} id="section-portfolio" className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-1 scroll-mt-32 lg:scroll-mt-40">
      <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_0.4fr] gap-2">
        {/* Main Large Card - Video or Image (Left Side 60%) */}
        <div
          className="relative h-[300px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden cursor-pointer group"
          onClick={mainVideo ? handleVideoClick : () => {
            // Open lightbox at the current selected image index
            const imageIndex = videos.length + selectedImageIndex;
            openLightbox(imageIndex);
          }}
        >
          {mainVideo ? (
            <>
              {/* Video Thumbnail/Poster */}
              <div className="relative w-full h-full bg-surface">
                {(() => {
                  // Try to find a non-video image from the portfolio item as thumbnail
                  const thumbnailImage = mainVideo.portfolioItem.images?.find(
                    (img) => !isVideoUrl(img)
                  );
                  
                  if (thumbnailImage) {
                    return (
                      <Image
                        src={resolveAssetSrc(thumbnailImage)}
                        alt={mainVideo.portfolioItem.title || "Video thumbnail"}
                        fill
                        className="object-cover"
                        priority
                      />
                    );
                  }
                  
                  // Fallback: show gradient background with play icon
                  return (
                    <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-2 text-primary" fill="currentColor" />
                        <p className="text-sm font-medium text-foreground">
                          {mainVideo.portfolioItem.title || "Video"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="bg-background/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
            </>
          ) : mainImage ? (
            <>
              <Image
                src={resolveAssetSrc(mainImage.url)}
                alt={mainImage.portfolioItem?.title || vendor.business_name || "Vendor image"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </>
          ) : null}
        </div>

        {/* Thumbnail Grid - Images Only (Right Side 40%) */}
        <div className="grid grid-cols-2 gap-2">
          {thumbnailImages.map((img, index) => {
            // Find the original index of this image
            const originalIndex = allImages.findIndex(
              (allImg) => allImg.url === img.url
            );
            const isLastThumbnail = index === thumbnailImages.length - 1;

            return (
              <div
                key={`${img.url}-${index}`}
                className="relative h-[145px] md:h-[170px] lg:h-[195px] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  // Update main image and open lightbox at this image's index
                  if (!isLastThumbnail || !hasMoreImages) {
                    handleThumbnailClick(originalIndex);
                    const imageIndex = videos.length + originalIndex;
                    openLightbox(imageIndex);
                  }
                }}
              >
                <Image
                  src={resolveAssetSrc(img.url)}
                  alt={img.portfolioItem?.title || `Image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Show all button on last thumbnail card */}
                {isLastThumbnail && hasMoreImages && (
                  <>
                    {/* Semi-transparent overlay to darken image but keep it visible */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-[1]" />
                    
                    {/* Show all button positioned at bottom-right - navigates to gallery page */}
                    <Link
                      href={vendor.slug ? `/vendors/${vendor.slug}/gallery` : "/vendors/all"}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute bottom-3 right-3 z-10 group/button"
                    >
                      <div className="bg-background/95 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-border/50 text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl hover:bg-background transition-all hover:scale-105 group-hover/button:border-primary/30">
                        <Grid3x3 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-foreground whitespace-nowrap">
                          Show all {totalMediaCount}
                        </span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            );
          })}

          {/* Fill remaining slots if we have fewer than 4 thumbnails */}
          {thumbnailImages.length < 4 &&
            Array.from({ length: 4 - thumbnailImages.length }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="relative h-[145px] md:h-[170px] lg:h-[195px] rounded-2xl bg-surface border border-border"
              />
            ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">
            {(() => {
              const allMedia = [...videos, ...allImages];
              const currentMedia = allMedia[lightboxIndex];
              return currentMedia?.portfolioItem?.title || `${vendor.business_name} - Image ${lightboxIndex + 1} of ${allMedia.length}`;
            })()}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-background hover:bg-white/20"
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
                      <Play className="w-16 h-16 mx-auto mb-4 text-background" fill="currentColor" />
                      <p className="text-background text-lg font-medium mb-4">
                        {currentMedia.portfolioItem?.title || "Video"}
                      </p>
                      <Button
                        onClick={() => window.open(currentMedia.url, '_blank')}
                        className="bg-background text-foreground hover:bg-surface"
                      >
                        Open Video
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={resolveAssetSrc(currentMedia.url)}
                    alt={currentMedia.portfolioItem?.title || "Gallery image"}
                    fill
                    className="object-contain"
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
                    className="absolute left-4 z-50 text-background hover:bg-white/20"
                    onClick={handleLightboxPrevious}
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 z-50 text-background hover:bg-white/20"
                    onClick={handleLightboxNext}
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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background bg-black/50 px-4 py-2 rounded-full text-sm">
                  {lightboxIndex + 1} / {allMedia.length}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

VendorImageGallery.displayName = "VendorImageGallery";
