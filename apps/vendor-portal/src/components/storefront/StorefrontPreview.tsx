'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Vendor } from '@/lib/supabase/vendor';
import { ExternalLink, Eye } from 'lucide-react';
// Note: Using img tag for dynamic images

interface StorefrontPreviewProps {
  vendor: Vendor | null;
}

export function StorefrontPreview({ vendor }: StorefrontPreviewProps) {
  if (!vendor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Complete your storefront to see preview
          </p>
        </CardContent>
      </Card>
    );
  }

  const publicUrl = vendor.slug
    ? `https://thefesta.com/vendors/${vendor.slug}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storefront Preview</CardTitle>
        <CardDescription>
          See how your storefront appears to couples
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hero Section Preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            {vendor.cover_image ? (
              <div className="relative h-32 w-full">
                <img
                  src={vendor.cover_image}
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Cover Image</span>
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{vendor.business_name || 'Business Name'}</h3>
                {vendor.verified && (
                  <Badge variant="default">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{vendor.category}</p>
              <div className="flex items-center gap-4 text-sm">
                {vendor.location?.city && (
                  <span className="text-muted-foreground">{vendor.location.city}</span>
                )}
                {vendor.price_range && (
                  <span className="font-semibold">{vendor.price_range}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 border border-border rounded-lg">
              <div className="text-lg font-bold">
                {vendor.stats?.reviewCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <div className="text-lg font-bold">
                {vendor.stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <div className="text-lg font-bold">
                {vendor.years_in_business || '-'}
              </div>
              <div className="text-xs text-muted-foreground">Years</div>
            </div>
          </div>

          {/* Preview Note */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p>
              This is a simplified preview. Your actual storefront includes portfolio gallery,
              detailed descriptions, packages, availability, and more.
            </p>
          </div>

          {/* View Public Page Button */}
          {publicUrl && (
            <Button className="w-full" variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Public Page
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
