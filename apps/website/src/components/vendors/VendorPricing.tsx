"use client";

import { DollarSign, Check } from "lucide-react";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorPricingProps {
  vendor: Vendor;
}

export function VendorPricing({ vendor }: VendorPricingProps) {
  const priceRange = vendor.price_range || "$$";

  const priceLabels: Record<string, string> = {
    $: "Budget-friendly",
    $$: "Moderate",
    $$$: "Premium",
    $$$$: "Luxury",
  };

  return (
    <div className="py-8 border-t border-border">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Pricing</h2>
      <div className="border border-border rounded-2xl bg-background p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <div>
            <div className="text-2xl font-semibold">{priceRange}</div>
            <div className="text-sm text-secondary">{priceLabels[priceRange] || priceRange}</div>
          </div>
        </div>

        <p className="text-secondary mb-4">
          Pricing varies based on event size, location, and specific requirements.
          Contact the vendor for a custom quote tailored to your needs.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <span>Custom quotes available</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <span>Flexible payment options</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <span>Package deals available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

