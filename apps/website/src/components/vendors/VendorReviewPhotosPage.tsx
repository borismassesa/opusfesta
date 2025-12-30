"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";

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

const ASPECT_RATIOS = ["4/5", "3/4", "1/1", "4/3", "2/3", "16/9", "5/7", "3/5"];

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
  const backHref = `/vendors/${vendor.slug}#section-reviews`;

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
            Back to {vendor.business_name}
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
            <div className="mt-10 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {reviewImages.map((item, index) => {
                const ratio = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
                const reviewDate = new Date(item.reviewDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <article
                    key={`${item.reviewId}-${index}`}
                    className="mb-4 break-inside-avoid rounded-2xl overflow-hidden border border-border bg-surface/40 shadow-sm group"
                  >
                    <button
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="block w-full text-left"
                      aria-label="Open review photo"
                    >
                      <div className="relative w-full" style={{ aspectRatio: ratio }}>
                      <Image
                        src={resolveAssetSrc(item.url)}
                        alt={`Review photo by ${item.reviewUserName}`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {item.reviewRating.toFixed(1)}
                        </span>
                        <span className="rounded-full bg-black/60 px-2 py-1">
                          {item.reviewUserName}
                        </span>
                      </div>
                      </div>
                    </button>
                    <div className="p-3">
                      <div className="text-xs text-secondary">{reviewDate}</div>
                      <p className="mt-1 text-sm text-foreground line-clamp-2">
                        {item.reviewContent}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {lightboxOpen && reviewImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/90 hover:text-white transition-all z-30 w-10 h-10 flex items-center justify-center"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <div className="relative w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-0 md:gap-6">
            <div className="relative w-full md:flex-1 flex items-center justify-center mb-4 md:mb-0">
              {lightboxIndex > 0 && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    const nextIndex = lightboxIndex - 1;
                    setLightboxIndex(nextIndex);
                    router.replace(`${pathname}?photo=${nextIndex}`, {
                      scroll: false,
                    });
                  }}
                  className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-all z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                </button>
              )}

              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[65vh] md:max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={resolveAssetSrc(reviewImages[lightboxIndex].url)}
                  alt={`Review photo by ${reviewImages[lightboxIndex].reviewUserName}`}
                  fill
                  className="object-cover"
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            </div>

            <div className="relative w-full md:w-[420px] md:max-h-[85vh]">
              {lightboxIndex < reviewImages.length - 1 && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    const nextIndex = lightboxIndex + 1;
                    setLightboxIndex(nextIndex);
                    router.replace(`${pathname}?photo=${nextIndex}`, {
                      scroll: false,
                    });
                  }}
                  className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-all z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                </button>
              )}

              <div
                className="relative bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.12)] md:max-h-[85vh] overflow-y-auto overflow-x-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= reviewImages[lightboxIndex].reviewRating
                              ? "fill-[#FFB400] text-[#FFB400]"
                              : "text-gray-300"
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900 ml-1">
                      {reviewImages[lightboxIndex].reviewRating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {reviewImages[lightboxIndex].reviewUserName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      reviewImages[lightboxIndex].reviewDate
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p
                    className="text-gray-700 leading-relaxed"
                    style={{
                      fontSize: "15px",
                      maxWidth: "65ch",
                      lineHeight: "1.6",
                    }}
                  >
                    {reviewImages[lightboxIndex].reviewContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
