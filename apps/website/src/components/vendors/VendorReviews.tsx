"use client";

import { useState, useEffect } from "react";
import React from "react";
import Image from "next/image";
import {
  Star,
  Clock,
  Shield,
  ThumbsUp,
  MessageCircle,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vendor, Review } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";

// Helper function to check if a URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const videoPlatforms = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
         videoPlatforms.some(platform => lowerUrl.includes(platform));
};

interface VendorReviewsProps {
  vendor: Vendor;
  reviews: Review[];
}

export function VendorReviews({ vendor, reviews }: VendorReviewsProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(4); // Show 4 reviews initially
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const rating = vendor.stats.averageRating || 0;
  const reviewCount = vendor.stats.reviewCount || 0;
  const displayReviewCount = Math.max(reviewCount, reviews.length);
  const isGuestFavourite = rating >= 4.8 && reviewCount >= 50;

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      stars: star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    };
  });

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "highest") {
      return b.rating - a.rating;
    }
    return a.rating - b.rating;
  });

  // Collect all images from all reviews for the carousel
  const allReviewImages = sortedReviews
    .flatMap((review) => 
      (review.images || []).map((img) => ({
        url: img,
        reviewId: review.id,
        reviewRating: review.rating,
        reviewUserName: review.user.name,
        reviewDate: review.created_at,
        reviewContent: review.content,
      }))
    )
    .filter((item) => !isVideoUrl(item.url)); // Only show images in carousel, not videos

  const toggleReviewExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
        setLightboxIndex(0);
      } else if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
        const newIndex = lightboxIndex - 1;
        setLightboxIndex(newIndex);
        setLightboxImage(allReviewImages[newIndex].url);
      } else if (e.key === 'ArrowRight' && lightboxIndex < allReviewImages.length - 1) {
        const newIndex = lightboxIndex + 1;
        setLightboxIndex(newIndex);
        setLightboxImage(allReviewImages[newIndex].url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, lightboxIndex, allReviewImages]);

  return (
    <div
      id="section-reviews"
      className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40"
    >
      {/* Rating Section with Three Columns */}
      <div className="py-10 border-b border-border">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left side - Rating */}
          <div className="flex flex-col items-start max-w-sm">
            <div className="text-xs uppercase tracking-widest text-secondary">
              {isGuestFavourite ? "Guest favourite" : "Highly rated"}
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
                          ? "text-amber-500 fill-amber-500"
                          : "text-secondary/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-secondary mt-1">Overall rating</div>
              </div>
            </div>
            <p className="text-foreground/80 mt-3 text-sm leading-relaxed">
              {isGuestFavourite
                ? "This vendor is a guest favourite based on ratings, reviews, and reliability."
                : "Couples consistently rate this vendor highly for their care and professionalism."}
            </p>
          </div>

          {/* Middle - Features */}
          <div className="grid gap-5 flex-1">
            {[
              {
                icon: Star,
                title: "Highly rated",
                body: "Recent couples loved working with this vendor.",
              },
              {
                icon: Clock,
                title: "Fast response time",
                body: "Quick replies and professional communication.",
              },
              {
                icon: Shield,
                title: "Verified professional",
                body: "This vendor has been verified for quality and reliability.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-full border border-border text-foreground flex items-center justify-center">
                  <item.icon className="w-5 h-5" strokeWidth={1.6} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-secondary text-sm">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Rating Breakdown */}
          {reviews.length > 0 && (
            <div className="lg:w-[360px] w-full flex-shrink-0">
              <div className="mb-5">
                <div className="text-xs uppercase tracking-widest text-secondary">
                  Reviews
                </div>
                <h2 className="text-3xl font-semibold text-foreground mt-2">
                  {displayReviewCount} {displayReviewCount === 1 ? 'Review' : 'Reviews'}
                </h2>
              </div>
              <div className="space-y-3">
                {ratingBreakdown.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-16 flex-shrink-0">
                      <span className="text-sm text-foreground font-semibold min-w-[18px]">{stars}</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    </div>
                    <div className="flex-1 h-3 bg-secondary/15 rounded-full overflow-hidden">
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

      {/* Review Images Carousel - Amazon Style */}
      {allReviewImages.length > 0 && (
        <div className="pt-6 mb-10 pb-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Customer photos ({allReviewImages.length})
          </h3>
          <div className="relative">
            <div className="overflow-x-auto -mx-6 px-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                {allReviewImages.map((item, index) => (
                  <div
                    key={`${item.reviewId}-${index}`}
                    className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group border border-border"
                    onClick={() => {
                      setLightboxImage(item.url);
                      setLightboxIndex(index);
                    }}
                  >
                    <Image
                      src={resolveAssetSrc(item.url)}
                      alt={`Review photo ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {/* Rating badge overlay */}
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-foreground">
                        {item.reviewRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pb-10">
        {sortedReviews.slice(0, displayCount).map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const reviewText = review.content;
          const shouldTruncate = reviewText.length > 220;
          const displayText =
            isExpanded || !shouldTruncate
              ? reviewText
              : `${reviewText.substring(0, 220)}...`;
          const reviewDate = new Date(review.created_at).toLocaleDateString(
            "en-US",
            {
              month: "long",
              year: "numeric",
            }
          );

          return (
            <div key={review.id} className="space-y-4 pb-6 border-b border-border last:border-b-0">
              {/* User Info and Rating */}
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 border border-border">
                  <AvatarImage
                    src={
                      review.user.avatar
                        ? resolveAssetSrc(review.user.avatar)
                        : undefined
                    }
                    alt={review.user.name}
                  />
                  <AvatarFallback className="bg-surface text-foreground">
                    {review.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-foreground">{review.user.name}</div>
                  <div className="text-sm text-secondary">{reviewDate}</div>
                </div>
                  <div className="flex items-center gap-2 mb-2">
                    {review.event_type && (
                      <span className="bg-surface border border-border text-foreground text-xs font-medium px-2 py-1 rounded-full">
                        {review.event_type}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                            className={`w-4 h-4 ${
                        star <= review.rating
                          ? "text-amber-500 fill-amber-500"
                                : "text-secondary/30"
                      }`}
                    />
                  ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-3">
              <p
                  className={`text-foreground leading-relaxed ${
                    isExpanded ? "" : "line-clamp-4"
                }`}
              >
                {displayText}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => toggleReviewExpanded(review.id)}
                    className="text-foreground font-semibold underline text-sm hover:text-primary transition-colors"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}

                {/* Vendor Response */}
              {review.vendor_response && (
                  <div className="mt-4 pl-4 border-l-2 border-primary bg-surface/50 rounded-r-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-foreground font-semibold text-sm">
                        {vendor.business_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {vendor.business_name}
                        </div>
                        <div className="text-xs text-secondary">Vendor</div>
                      </div>
                  </div>
                    <p className="text-sm text-foreground leading-relaxed">
                    {review.vendor_response}
                  </p>
                </div>
              )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View More Button */}
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

      {/* Show Less Button (when all reviews are shown) */}
      {sortedReviews.length > 4 && displayCount >= sortedReviews.length && (
        <div className="flex justify-center pt-2 pb-10">
          <button
            onClick={() => setDisplayCount(4)}
            className="text-foreground font-semibold underline hover:text-primary transition-colors"
          >
            Show less
          </button>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No reviews yet</h3>
          <p className="text-secondary">
            Be the first to review this vendor!
          </p>
        </div>
      )}

      {/* Lightbox Modal - Cinematic Review Spotlight */}
      {lightboxImage && allReviewImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => {
            setLightboxImage(null);
            setLightboxIndex(0);
          }}
          style={{ transition: 'opacity 0.35s ease' }}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setLightboxImage(null);
              setLightboxIndex(0);
            }}
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/90 hover:text-white transition-all z-30 w-10 h-10 flex items-center justify-center"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Main Container - Desktop: Side by side, Mobile: Stacked */}
          <div className="relative w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-0 md:gap-6">
            {/* Image Container - Left Side (Desktop) / Top (Mobile) */}
            <div className="relative w-full md:flex-1 flex items-center justify-center mb-4 md:mb-0">
              {/* Previous Arrow - Left Edge (Outside Image Container) */}
              {allReviewImages.length > 1 && lightboxIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = lightboxIndex - 1;
                    setLightboxIndex(newIndex);
                    setLightboxImage(allReviewImages[newIndex].url);
                  }}
                  className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-all z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                </button>
              )}

              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[60vh] md:max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
                {/* Gradient Vignette */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0))',
                  }}
                />
                
                {isVideoUrl(lightboxImage) ? (
                  <video
                    src={resolveAssetSrc(lightboxImage)}
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Image
                    src={resolveAssetSrc(lightboxImage)}
                    alt="Review media"
                    fill
                    className="object-cover"
                    onClick={(e) => e.stopPropagation()}
                    style={{ transition: 'opacity 0.4s ease' }}
                  />
                )}

                {/* Navigation Dots - Bottom Center */}
                {allReviewImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {allReviewImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(index);
                          setLightboxImage(allReviewImages[index].url);
                        }}
                        className={`transition-all rounded-full ${
                          index === lightboxIndex
                            ? 'w-2.5 h-2.5 bg-white'
                            : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to photo ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Review Details Card - Right Side (Desktop) / Bottom (Mobile) */}
            {allReviewImages[lightboxIndex] && (
              <div 
                className="relative bg-white rounded-2xl p-6 md:p-8 w-full md:w-[460px] md:max-w-md border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.12)] md:max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ transition: 'transform 0.35s ease, opacity 0.35s ease' }}
              >
                {/* Next Arrow - Right Edge of Review Card */}
                {allReviewImages.length > 1 && lightboxIndex < allReviewImages.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = lightboxIndex + 1;
                      setLightboxIndex(newIndex);
                      setLightboxImage(allReviewImages[newIndex].url);
                    }}
                    className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 text-white hover:text-white/80 transition-all z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                )}
                {/* Rating and Name */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= allReviewImages[lightboxIndex].reviewRating
                              ? "fill-[#FFB400] text-[#FFB400]"
                              : "text-gray-300"
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900 ml-1">
                      {allReviewImages[lightboxIndex].reviewRating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {allReviewImages[lightboxIndex].reviewUserName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(allReviewImages[lightboxIndex].reviewDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Review Content */}
                <div className="pt-4 border-t border-gray-200">
                  <p 
                    className="text-gray-700 leading-relaxed"
                    style={{ 
                      fontSize: '15px',
                      maxWidth: '65ch',
                      lineHeight: '1.6'
                    }}
                  >
                    {allReviewImages[lightboxIndex].reviewContent}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
