"use client";

import Link from "next/link";
import { Star, MapPin, ArrowRight, Eye } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
import { VendorSaveButton } from "./VendorSaveButton";
import type { Vendor } from "@/lib/supabase/vendors";

interface SimilarVendorsProps {
  vendors: Vendor[];
  title?: string;
  subtitle?: string;
}

export function SimilarVendors({ vendors, title, subtitle }: SimilarVendorsProps) {
  if (vendors.length === 0) {
    return null;
  }


  return (
    <div className="py-8 border-t border-border">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            {title || "Similar vendors"}
          </h2>
          {subtitle && (
            <p className="text-sm text-secondary mt-2">{subtitle}</p>
          )}
        </div>
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3">
        {vendors.map((vendor, index) => {
          const rating = vendor.stats.averageRating || 0;
          const reviewCount = vendor.stats.reviewCount || 0;
          const locationText = vendor.location?.city || "Tanzania";
          const coverImage = vendor.cover_image || vendor.logo;
          const isRightEdge = index === vendors.length - 1;

          return (
            <div key={vendor.id}>
              <Link 
                href={`/vendors/${vendor.slug}`} 
                className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block"
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                  {coverImage ? (
                    <img 
                      src={resolveAssetSrc(coverImage)} 
                      alt={vendor.business_name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        {vendor.business_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h4 className="text-background font-bold text-base line-clamp-2">
                          {vendor.category}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <VendorSaveButton vendorId={vendor.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="mt-2.5 relative">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="group/avatar">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs cursor-pointer transition-all hover:scale-110 hover:bg-primary/20">
                        {vendor.business_name.charAt(0).toUpperCase()}
                      </div>
                      {/* Rich hover card */}
                      <div
                        className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                          isRightEdge ? "right-0" : "left-[-10px]"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
                              <span className="text-lg font-bold text-primary">
                                {vendor.business_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-primary mb-0.5 truncate">
                                {vendor.category}
                              </h4>
                              <p className="text-[0.65rem] text-secondary mb-1">
                                {locationText}, Tanzania
                              </p>
                              <div className="flex items-center gap-2 text-[0.65rem]">
                                <div className="flex items-center gap-0.5 font-semibold">
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                  {rating}
                                </div>
                                <span className="text-secondary">({reviewCount})</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                onClick={(e) => e.preventDefault()}
                              >
                                Follow
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                onClick={(e) => e.preventDefault()}
                              >
                                Contact
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {coverImage && (
                              <>
                                <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                  <img
                                    src={resolveAssetSrc(coverImage)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                  <img
                                    src={resolveAssetSrc(coverImage)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                  <img
                                    src={resolveAssetSrc(coverImage)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div
                          className={`absolute top-full w-3 h-3 bg-background border-r border-b border-border transform rotate-45 -mt-1.5 ${
                            isRightEdge ? "right-6" : "left-6"
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-secondary">
                      {vendor.business_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {rating}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-secondary" />
                      {reviewCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
