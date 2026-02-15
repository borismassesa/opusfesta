"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { resolveAssetSrc } from "@/lib/assets";
import type { Vendor } from "@/lib/supabase/vendors";

export interface ReviewImage {
  url: string;
  reviewId: string;
  reviewRating: number;
  reviewUserName: string;
  reviewDate: string;
  reviewContent: string;
}

interface VendorReviewPhotosPageProps {
  vendor: Vendor;
  reviewImages: ReviewImage[];
  reviewCount: number;
}

export function VendorReviewPhotosPage({
  vendor,
  reviewImages,
  reviewCount,
}: VendorReviewPhotosPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const photoCount = reviewImages.length;
  const backHref = vendor.slug ? `/vendors/${vendor.slug}#section-reviews` : "/vendors/all";

  // Create bento grid layout with varied sizes
  const bentoGrid = useMemo(() => {
    if (reviewImages.length === 0) return [];

    const grid: Array<Array<{ item: ReviewImage; span: number }>> = [];
    let currentRow: Array<{ item: ReviewImage; span: number }> = [];
    let currentRowSpan = 0;
    const rowSize = 4; // 4 columns per row

    reviewImages.forEach((item, index) => {
      let span = 1;

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
        currentRow = [{ item, span }];
        currentRowSpan = span;
      } else {
        currentRow.push({ item, span });
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
  }, [reviewImages]);

  useEffect(() => {
    const photoParam = searchParams.get("photo");
    if (!photoParam) {
      return;
    }
    const parsed = Number.parseInt(photoParam, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed >= reviewImages.length) {
      return;
    }
    setLightboxIndex(parsed);
    setLightboxOpen(true);
  }, [reviewImages.length, searchParams]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && lightboxIndex > 0) {
        const nextIndex = lightboxIndex - 1;
        setLightboxIndex(nextIndex);
        router.replace(`${pathname}?photo=${nextIndex}`, { scroll: false });
      } else if (
        event.key === "ArrowRight" &&
        lightboxIndex < reviewImages.length - 1
      ) {
        const nextIndex = lightboxIndex + 1;
        setLightboxIndex(nextIndex);
        router.replace(`${pathname}?photo=${nextIndex}`, { scroll: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, lightboxOpen, pathname, reviewImages.length, router]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    router.replace(`${pathname}?photo=${index}`, { scroll: false });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="pt-24 lg:pt-28 pb-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {vendor.slug ? `Back to ${vendor.business_name}` : "Back to all vendors"}
          </Link>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">
                Reviews gallery
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-foreground">
                Customer photos
              </h1>
              <p className="mt-3 text-secondary max-w-2xl">
                Real moments shared by couples who worked with {vendor.business_name}.
              </p>
            </div>
          </div>

          {photoCount === 0 ? (
            <div className="mt-16 border border-border rounded-2xl bg-surface p-10 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                No review photos yet
              </h2>
              <p className="mt-2 text-secondary">
                Once couples upload photos, you will see them here.
              </p>
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-foreground underline hover:text-primary transition-colors"
              >
                View the latest reviews
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-2">
              {bentoGrid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-4 gap-2 auto-rows-fr"
                >
                  {row.map((gridItem, itemIndex) => {
                    const originalIndex = reviewImages.findIndex(
                      (img) => img.url === gridItem.item.url && img.reviewId === gridItem.item.reviewId
                    );
                    const reviewDate = new Date(gridItem.item.reviewDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "numeric",
                      }
                    );

                    return (
                      <div
                        key={`${gridItem.item.reviewId}-${itemIndex}`}
                        className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                          gridItem.span === 2 ? 'col-span-2' : 'col-span-1'
                        }`}
                        style={{
                          aspectRatio: gridItem.span === 2 ? '2/1' : '1/1',
                          minHeight: '200px',
                        }}
                        onClick={() => openLightbox(originalIndex >= 0 ? originalIndex : 0)}
                      >
                        <Image
                          src={resolveAssetSrc(gridItem.item.url)}
                          alt={`Review photo by ${gridItem.item.reviewUserName}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes={gridItem.span === 2 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {gridItem.item.reviewRating.toFixed(1)}
                          </span>
                          <span className="rounded-full bg-black/60 px-2 py-1 truncate">
                            {gridItem.item.reviewUserName}
                          </span>
                        </div>
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
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black border-none rounded-none sm:rounded-lg">
          <DialogTitle className="sr-only">
            {reviewImages[lightboxIndex] 
              ? `Review photo by ${reviewImages[lightboxIndex].reviewUserName} - ${lightboxIndex + 1} of ${reviewImages.length}`
              : 'Review photo'}
          </DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all"
              onClick={closeLightbox}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation Buttons */}
            {reviewImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lightboxIndex > 0) {
                      const nextIndex = lightboxIndex - 1;
                      setLightboxIndex(nextIndex);
                      router.replace(`${pathname}?photo=${nextIndex}`, { scroll: false });
                    }
                  }}
                  disabled={lightboxIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-background backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (lightboxIndex < reviewImages.length - 1) {
                      const nextIndex = lightboxIndex + 1;
                      setLightboxIndex(nextIndex);
                      router.replace(`${pathname}?photo=${nextIndex}`, { scroll: false });
                    }
                  }}
                  disabled={lightboxIndex === reviewImages.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Image Display */}
            {reviewImages[lightboxIndex] && (
              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={resolveAssetSrc(reviewImages[lightboxIndex].url)}
                    alt={`Review photo by ${reviewImages[lightboxIndex].reviewUserName}`}
                    fill
                    className="object-contain"
                    sizes="95vw"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Image Counter and Info */}
            {reviewImages.length > 1 && reviewImages[lightboxIndex] && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-background text-sm font-medium border border-white/10">
                  {lightboxIndex + 1} of {reviewImages.length}
                </div>
                <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-background text-xs border border-white/10 flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{reviewImages[lightboxIndex].reviewRating.toFixed(1)}</span>
                  <span className="text-background/70">•</span>
                  <span className="max-w-xs truncate">{reviewImages[lightboxIndex].reviewUserName}</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
