"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Share2, Heart, BadgeCheck, Sparkles, Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveAssetSrc } from "@/lib/assets";
import type { Vendor } from "@/lib/supabase/vendors";
import Image from "next/image";
import { useSaveVendor } from "@/hooks/useSaveVendor";

interface VendorHeroProps {
  vendor: Vendor;
  coverImage: string | null;
}

export function VendorHero({ vendor, coverImage }: VendorHeroProps) {
  const { isSaved, isLoading, toggleSave, checkSavedStatus } = useSaveVendor({
    vendorId: vendor.id,
    redirectToLogin: true,
  });

  const rating = vendor.stats.averageRating || 0;
  const reviewCount = vendor.stats.reviewCount || 0;
  const isGuestFavourite = rating >= 4.8;
  const isFastResponder = true; // TODO: Get from vendor stats

  // Check saved status on mount
  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.business_name,
          text: `Check out ${vendor.business_name} on TheFesta`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSave = () => {
    toggleSave();
  };

  const locationText = vendor.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}`
    : "Tanzania";

  return (
    <section className="py-6 px-6 lg:px-12 border-b border-border">
      <div className="max-w-[1280px] mx-auto">
        {/* Header with Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="mb-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                {vendor.business_name}
              </h1>
            </div>

            <div className="text-sm text-secondary mb-2">
              {vendor.category}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{locationText}</span>
              </div>
              {vendor.price_range && (
                <>
                  <span>•</span>
                  <span>{vendor.price_range}</span>
                </>
              )}
            </div>
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
              disabled={isLoading}
              className={`border border-border ${isSaved ? "text-red-500" : ""} ${isLoading ? "opacity-50" : ""}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Rating and Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{rating.toFixed(2)}</span>
            <span className="text-secondary">({reviewCount} reviews)</span>
          </div>

          {isGuestFavourite && (
            <Badge className="bg-amber-500 text-background text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Guest Favourite
            </Badge>
          )}

          {vendor.verified && (
            <Badge className="bg-blue-500 text-background text-xs">
              <BadgeCheck className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}

          {isFastResponder && (
            <Badge className="bg-emerald-500 text-background text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Fast Responder
            </Badge>
          )}
        </div>
      </div>
    </section>
  );
}

