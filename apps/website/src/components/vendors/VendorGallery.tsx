"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PortfolioItem, Vendor } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";

interface VendorGalleryProps {
  portfolio: PortfolioItem[];
  vendor: Vendor;
}

export function VendorGallery({ portfolio, vendor }: VendorGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Get all images from portfolio
  const portfolioImages = portfolio.flatMap((item) =>
    item.images.length > 0
      ? item.images.map((img) => ({ url: img, portfolioItem: item }))
      : []
  );
  
  // Use cover image if available, otherwise use first portfolio image
  const coverImageUrl = vendor.cover_image;
  let allImages = portfolioImages;
  
  // If we have a cover image and it's not in portfolio, add it first
  if (coverImageUrl && !portfolioImages.some(img => img.url === coverImageUrl)) {
    allImages = [{ url: coverImageUrl, portfolioItem: { title: vendor.business_name } }, ...portfolioImages];
  } else if (coverImageUrl && portfolioImages.length === 0) {
    // If only cover image exists
    allImages = [{ url: coverImageUrl, portfolioItem: { title: vendor.business_name } }];
  }

  // If no images at all, use a placeholder
  if (allImages.length === 0) {
    return (
      <div className="w-full pt-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="relative w-full h-[500px] bg-surface rounded-2xl border border-border flex items-center justify-center">
            <p className="text-secondary">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = allImages[selectedImageIndex] || allImages[0];
  // Show thumbnails: always show first 4 images that aren't the currently selected main image
  const thumbnails = allImages
    .filter((_, idx) => idx !== selectedImageIndex)
    .slice(0, 4);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
  };

  return (
    <>
      {/* Hero Image Gallery - Full Width, First Section */}
      <div className="w-full pt-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-2">
            {/* Main Large Image - Left Side (60%) */}
            <div
              className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={openLightbox}
            >
              {mainImage && (
                <Image
                  src={resolveAssetSrc(mainImage.url)}
                  alt={mainImage.portfolioItem?.title || vendor.business_name || "Vendor image"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              )}
            </div>

            {/* Thumbnail Grid - Right Side (40%) */}
            <div className="grid grid-cols-2 gap-2">
              {thumbnails.map((thumb, index) => {
                // Find the actual index of this thumbnail in allImages
                const thumbIndex = allImages.findIndex(img => img.url === thumb.url);
                const isLastThumbnail = index === 3;
                const hasMoreImages = allImages.length > 5;
                
                return (
                  <div
                    key={thumbIndex}
                    className={`
                      relative h-[190px] md:h-[240px] lg:h-[290px] rounded-2xl overflow-hidden cursor-pointer group
                    `}
                    onClick={() => handleThumbnailClick(thumbIndex)}
                  >
                    <Image
                      src={resolveAssetSrc(thumb.url)}
                      alt={thumb.portfolioItem?.title || "Portfolio thumbnail"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isLastThumbnail && hasMoreImages && (
                      <div
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox();
                        }}
                      >
                        <span className="text-background font-semibold text-sm md:text-base">
                          Show all {allImages.length} photos
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
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

            {/* Main Image */}
            {mainImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={resolveAssetSrc(mainImage.url)}
                  alt={mainImage.portfolioItem.title || "Portfolio image"}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-background hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-background hover:bg-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background bg-black/50 px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

