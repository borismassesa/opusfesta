"use client";

import { useState } from "react";
import { Calendar, Users, Sparkles, Shield, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Vendor } from "@/lib/supabase/vendors";
import { VendorInquiryFlow } from "./VendorInquiryFlow";
import { VendorSaveButton } from "./VendorSaveButton";
import { cn } from "@/lib/utils";

interface VendorBookingCardProps {
  vendor: Vendor;
  isSticky?: boolean;
}

export function VendorBookingCard({ vendor, isSticky = true }: VendorBookingCardProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  const priceRange = vendor.price_range || "$$";
  const rating = vendor.stats?.averageRating || 0;
  const reviewCount = vendor.stats?.reviewCount || 0;
  const saveCount = vendor.stats?.saveCount || 0;

  const getStartingPrice = () => {
    if (priceRange === "$") return "500,000";
    if (priceRange === "$$") return "1,500,000";
    if (priceRange === "$$$") return "3,000,000";
    if (priceRange === "$$$$") return "5,000,000";
    return "1,500,000";
  };

  const startingPrice = getStartingPrice();

  // Determine if this is a rare find
  const isRareFind = saveCount > 50 || (rating >= 4.8 && reviewCount >= 30);

  if (showInquiryForm) {
    return (
      <div className={cn(
        "bg-background border border-border rounded-2xl shadow-lg p-6",
        isSticky && "sticky top-24"
      )}>
        <div className="mb-4">
          <button
            onClick={() => setShowInquiryForm(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to details
          </button>
        </div>
        <VendorInquiryFlow 
          vendor={vendor} 
          onSuccess={(inquiryId) => {
            // Could show success state or redirect
            console.log("Inquiry submitted:", inquiryId);
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-background border border-border rounded-2xl shadow-lg overflow-hidden",
      isSticky && "sticky top-24"
    )}>
      {/* Header with Save Button */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-semibold">{startingPrice} TZS</span>
              <span className="text-muted-foreground">starting price</span>
            </div>
            {isRareFind && (
              <div className="flex items-center gap-1.5 mt-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Rare find - Usually booked
                </span>
              </div>
            )}
          </div>
          <VendorSaveButton
            vendorId={vendor.id}
            className="shrink-0"
          />
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-6">
        <Button
          onClick={() => setShowInquiryForm(true)}
          className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold hover:bg-primary/90"
          size="lg"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Request to Book
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          You won't be charged yet
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="px-6 pb-6 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Free to inquire</p>
            <p className="text-muted-foreground text-xs">
              You won't be charged until you confirm the booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
