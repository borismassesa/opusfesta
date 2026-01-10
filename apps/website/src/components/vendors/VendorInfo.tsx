"use client";

import { forwardRef } from "react";
import { MapPin, ShieldCheck, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Vendor } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";

interface VendorInfoProps {
  vendor: Vendor;
}

export const VendorInfo = forwardRef<HTMLDivElement, VendorInfoProps>(({ vendor }, ref) => {
  const locationText = vendor.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}`
    : "Tanzania";
  const reviewCount = vendor.stats.reviewCount || 0;
  const rating = vendor.stats.averageRating || 0;
  const memberSince = vendor.created_at
    ? new Date(vendor.created_at).getFullYear()
    : new Date().getFullYear();

  // Handle both old string array format and new object format for backward compatibility
  const getServiceTitle = (service: string | { title: string; description: string }): string => {
    return typeof service === 'string' ? service : service.title;
  };

  const getServiceDescription = (service: string | { title: string; description: string }): string | undefined => {
    return typeof service === 'object' ? service.description : undefined;
  };

  const serviceHighlights =
    vendor.services_offered?.length > 0
      ? vendor.services_offered
      : vendor.subcategories?.length > 0
        ? vendor.subcategories.map((sub) => ({ title: sub, description: '' }))
        : [
            { title: `${vendor.category} consultations`, description: '' },
            { title: "Custom proposals and packages", description: '' },
            { title: "On-site coordination", description: '' },
            { title: "Flexible scheduling", description: '' },
            { title: "Trusted local partners", description: '' },
            { title: "Event-day support", description: '' },
          ];

  return (
    <div
      ref={ref}
      id="section-services"
      className="pt-12 border-t border-border space-y-10 scroll-mt-32 lg:scroll-mt-40"
    >
      <h3 className="text-2xl font-semibold">Meet your vendor</h3>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-background border border-border rounded-3xl p-8 shadow-xl text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto border-4 border-background">
                <AvatarImage
                  src={vendor.logo ? resolveAssetSrc(vendor.logo) : undefined}
                  alt={vendor.business_name}
                />
                <AvatarFallback className="text-2xl">
                  {vendor.business_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <h4 className="text-2xl font-semibold">{vendor.business_name}</h4>
              <p className="flex justify-center items-center gap-2 text-sm font-semibold text-secondary">
                <ShieldCheck className="w-4 h-4" />
                {vendor.verified ? "OpusFesta Verified" : "On OpusFesta"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <div className="text-xl font-bold">{reviewCount}</div>
                <div className="text-[10px] font-bold uppercase text-secondary">
                  Reviews
                </div>
              </div>
              <div>
                <div className="text-xl font-bold">{rating.toFixed(2)}</div>
                <div className="text-[10px] font-bold uppercase text-secondary">
                  Rating
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xl font-bold">
                  {vendor.years_in_business || 5}
                </div>
                <div className="text-[10px] font-bold uppercase text-secondary">
                  Years in business
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-secondary">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Based in {locationText}</span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xl font-semibold">
              {vendor.business_name} brings calm, curated planning to your day
            </h4>
            <p className="text-secondary">
              {vendor.bio ||
                "Couples love this team for their steady communication, thoughtful planning, and refined creative direction."}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="text-lg font-semibold">Vendor details</h5>
            <p className="text-secondary">Response time: Usually within 24 hours</p>
            <p className="text-secondary">Member since {memberSince}</p>
            {vendor.team_size && (
              <p className="text-secondary">
                Team size: {vendor.team_size} specialists
              </p>
            )}
          </div>

          <Button className="bg-primary text-background hover:bg-primary/90 w-fit">
            Message vendor
          </Button>

          <div className="border-t border-border pt-6 flex gap-4">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-secondary leading-relaxed">
              To protect your payment, keep messages and payments on OpusFesta.
            </p>
          </div>
        </div>
      </div>

      {serviceHighlights.length > 0 && (
        <div className="border border-border rounded-2xl bg-background p-6">
          <h3 className="text-2xl font-semibold mb-6">What this vendor offers</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {serviceHighlights.map((service, index) => {
              const title = getServiceTitle(service);
              const description = getServiceDescription(service);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium">{title}</span>
                      {description && (
                        <p className="text-sm text-secondary mt-1">{description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {vendor.social_links && (
        <div data-connect-section className="border border-border rounded-2xl bg-background p-6">
          <h3 className="text-2xl font-semibold mb-4">Connect</h3>
          <div className="flex flex-wrap gap-4">
            {vendor.social_links.instagram && (
              <a
                href={vendor.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                Instagram
              </a>
            )}
            {vendor.social_links.facebook && (
              <a
                href={vendor.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                Facebook
              </a>
            )}
            {vendor.social_links.twitter && (
              <a
                href={vendor.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                Twitter
              </a>
            )}
            {vendor.social_links.tiktok && (
              <a
                href={vendor.social_links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors"
              >
                TikTok
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

VendorInfo.displayName = "VendorInfo";
