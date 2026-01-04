'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, MapPin, DollarSign, Star } from 'lucide-react';
import { type Vendor } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio } from '@/lib/supabase/vendor';

interface SmartRecommendationsProps {
  vendor: Vendor | null;
}

export function SmartRecommendations({ vendor }: SmartRecommendationsProps) {
  const { data: portfolioItems = [] } = useQuery({
    queryKey: ['portfolio', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPortfolio(vendor.id);
    },
    enabled: !!vendor,
  });

  if (!vendor) {
    return null;
  }

  const totalImages = portfolioItems.reduce((sum, item) => sum + (item.images?.length || 0), 0);

  const recommendations = [];

  // Photo recommendations
  if (totalImages < 20) {
    recommendations.push({
      id: 'more-photos',
      priority: 'high',
      icon: Image,
      title: 'Add More Portfolio Photos',
      description: `You have ${totalImages} photos. The Knot recommends at least 20 photos for best results.`,
      action: 'Add more photos to your portfolio',
    });
  }

  // Description recommendations
  if (!vendor.description || vendor.description.length < 200) {
    recommendations.push({
      id: 'better-description',
      priority: 'medium',
      icon: Sparkles,
      title: 'Enhance Your Description',
      description: 'A detailed description helps couples understand your style and approach.',
      action: 'Expand your business description',
    });
  }

  // Location recommendations
  if (!vendor.location?.city && !vendor.location?.address) {
    recommendations.push({
      id: 'add-location',
      priority: 'high',
      icon: MapPin,
      title: 'Add Location Details',
      description: 'Location information helps couples find vendors in their area.',
      action: 'Add your location',
    });
  }

  // Price range recommendations
  if (!vendor.price_range) {
    recommendations.push({
      id: 'add-price-range',
      priority: 'medium',
      icon: DollarSign,
      title: 'Set Your Price Range',
      description: 'Price range helps couples filter and find vendors within their budget.',
      action: 'Set your price range',
    });
  }

  // Social links recommendations
  const hasSocialLinks = vendor.social_links && (
    vendor.social_links.instagram ||
    vendor.social_links.facebook ||
    vendor.social_links.twitter ||
    vendor.social_links.tiktok
  );
  if (!hasSocialLinks) {
    recommendations.push({
      id: 'add-social-links',
      priority: 'low',
      icon: Star,
      title: 'Add Social Media Links',
      description: 'Social media links help couples see more of your work and connect with you.',
      action: 'Add social media links',
    });
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to improve your storefront
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Great job! Your storefront looks complete.</p>
            <p className="text-sm mt-1">We'll notify you if we have new recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Recommendations</CardTitle>
        <CardDescription>
          AI-powered suggestions to improve your storefront and increase visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-500/10' :
                  rec.priority === 'medium' ? 'bg-amber-500/10' :
                  'bg-blue-500/10'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    rec.priority === 'high' ? 'text-red-600' :
                    rec.priority === 'medium' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <Badge
                      variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                  <p className="text-xs text-primary font-medium">{rec.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
