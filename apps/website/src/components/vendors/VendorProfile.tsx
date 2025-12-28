"use client";

import { Star, User, MessageCircle, ShieldCheck, GraduationCap, Calendar, MapPin, Check } from "lucide-react";
import type { Vendor, Review } from "@/lib/supabase/vendors";

interface VendorProfileProps {
  vendor: Vendor;
  reviews: Review[];
}

export function VendorProfile({ vendor, reviews }: VendorProfileProps) {
  const rating = vendor.stats.averageRating || 0;
  const reviewCount = Math.max(vendor.stats.reviewCount || 0, reviews.length);
  const yearsInBusiness = vendor.years_in_business || 5;
  const responseRate = 100; // TODO: Get from vendor stats
  const responseTime = "Usually within 24 hours"; // TODO: Get from vendor stats

  return (
    <div id="section-profile" className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8">Meet your vendor</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Vendor Card */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-2xl p-8 bg-background">
            <div className="flex gap-8">
              {/* Left Side - Profile Picture and Name */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-surface border border-border flex items-center justify-center text-foreground font-bold text-4xl">
                    {vendor.business_name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* Business Name */}
                <h3 className="text-xl font-bold text-foreground mb-2 text-center">{vendor.business_name}</h3>
                
                {/* Verified Badge */}
                {vendor.verified && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span className="text-secondary text-sm">Verified vendor</span>
                  </div>
                )}
              </div>

              {/* Right Side - Statistics */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="space-y-0">
                  {/* Reviews */}
                  <div className="pb-4 border-b border-border">
                    <div className="text-2xl font-bold text-foreground mb-1">{reviewCount}</div>
                    <div className="text-sm text-secondary">Reviews</div>
                  </div>
                  
                  {/* Rating */}
                  <div className="py-4 border-b border-border">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-2xl font-bold text-foreground">{rating.toFixed(2)}</span>
                      <Star className="w-5 h-5 text-foreground" strokeWidth={2} />
                    </div>
                    <div className="text-sm text-secondary">Rating</div>
                  </div>
                  
                  {/* Years in business */}
                  <div className="pt-4">
                    <div className="text-2xl font-bold text-foreground mb-1">{yearsInBusiness}</div>
                    <div className="text-sm text-secondary">Years in business</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Verified Section */}
          {vendor.verified && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {vendor.business_name} is a Verified vendor
              </h3>
              <p className="text-secondary">
                Verified vendors are experienced, highly rated professionals who are committed to providing excellent service for your celebration.
              </p>
            </div>
          )}

          {/* Vendor Details */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Vendor details</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-foreground">Response rate: {responseRate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{responseTime}</span>
              </div>
            </div>
            <button className="bg-surface border border-foreground text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-surface/80 transition-colors">
              Message vendor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
