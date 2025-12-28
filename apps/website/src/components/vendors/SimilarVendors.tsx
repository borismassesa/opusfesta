"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { resolveAssetSrc } from "@/lib/assets";
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => {
          const rating = vendor.stats.averageRating || 0;
          const reviewCount = vendor.stats.reviewCount || 0;
          const locationText = vendor.location?.city || "Tanzania";
          const coverImage = vendor.cover_image || vendor.logo;

          return (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group border border-border rounded-2xl overflow-hidden bg-background hover:shadow-lg transition-shadow"
            >
              {coverImage && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={resolveAssetSrc(coverImage)}
                    alt={vendor.business_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {vendor.business_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{locationText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-secondary">({reviewCount})</span>
                  {vendor.price_range && (
                    <>
                      <span className="text-secondary">•</span>
                      <span className="text-sm text-secondary">{vendor.price_range}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
