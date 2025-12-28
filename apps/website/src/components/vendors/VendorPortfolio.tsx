"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PortfolioItem } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";

interface VendorPortfolioProps {
  portfolio: PortfolioItem[];
}

export function VendorPortfolio({ portfolio }: VendorPortfolioProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>("all");

  // Get unique event types
  const eventTypes = [
    "all",
    ...new Set(portfolio.map((item) => item.event_type).filter(Boolean)),
  ] as string[];

  const filteredPortfolio =
    selectedEventType === "all"
      ? portfolio
      : portfolio.filter((item) => item.event_type === selectedEventType);

  return (
    <div
      id="section-portfolio"
      className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Portfolio</h2>
        {eventTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary" />
            <div className="flex gap-2 flex-wrap">
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedEventType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEventType(type)}
                  className="border-border"
                >
                  {type === "all" ? "All" : type}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolio.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-2xl overflow-hidden bg-background group hover:shadow-lg transition-shadow"
          >
            {item.images && item.images.length > 0 && (
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={resolveAssetSrc(item.images[0])}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.featured && (
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-background">
                    Featured
                  </Badge>
                )}
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              {item.event_type && (
                <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{item.event_type}</span>
                </div>
              )}
              {item.description && (
                <p className="text-sm text-secondary line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.event_date && (
                <p className="text-xs text-secondary mt-2">
                  {new Date(item.event_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPortfolio.length === 0 && (
        <div className="text-center py-12 text-secondary">
          No portfolio items found for this filter.
        </div>
      )}
    </div>
  );
}
