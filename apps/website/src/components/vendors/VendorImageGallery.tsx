"use client";

import { useState, forwardRef, useMemo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
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

  const openLightbox = () => {
    setIsLightboxOpen(true);
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
          onClick={mainVideo ? handleVideoClick : openLightbox}
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
              {/* Show all media button */}
              {hasMoreImages && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox();
                  }}
                  className="absolute bottom-4 right-4 bg-background px-4 py-2 rounded-lg border border-border text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-surface transition-colors z-10"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="w-4 h-4 fill-current"
                  >
                    <path d="M5 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6-9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                  </svg>
                  Show all {totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'}
                </button>
              )}
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
              {/* Show all photos button on main image if there are more images */}
              {hasMoreImages && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox();
                  }}
                  className="absolute bottom-4 right-4 bg-background px-4 py-2 rounded-lg border border-border text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-surface transition-colors z-10"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="w-4 h-4 fill-current"
                  >
                    <path d="M5 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6-9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                  </svg>
                  Show all {allImages.length} {allImages.length === 1 ? 'photo' : 'photos'}
                </button>
              )}
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
                  handleThumbnailClick(originalIndex);
                }}
              >
                <Image
                  src={resolveAssetSrc(img.url)}
                  alt={img.portfolioItem?.title || `Image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Show all media button overlay on bottom right image */}
                {isLastThumbnail && hasMoreImages && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox();
                    }}
                    className="absolute bottom-4 right-4 bg-background px-4 py-2 rounded-lg border border-border text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-surface transition-colors z-10"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="w-4 h-4 fill-current"
                    >
                      <path d="M5 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6-9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                    </svg>
                    Show all {totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'}
                  </button>
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
    </div>
  );
});

VendorImageGallery.displayName = "VendorImageGallery";
