'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Vendor } from '@/lib/supabase/vendor';
import { TrendingUp, Star, Home, Search, Zap, ArrowRight } from 'lucide-react';

interface VisibilityBoostProps {
  vendor: Vendor | null;
}

export function VisibilityBoost({ vendor }: VisibilityBoostProps) {
  const currentTier = vendor?.tier || 'free';
  const isPremium = currentTier === 'premium' || currentTier === 'pro';

  const advertisingOptions = [
    {
      id: 'featured-listing',
      name: 'Featured Listing',
      description: 'Get premium positioning in search results and category pages',
      icon: Star,
      price: '50,000 TZS/month',
      benefits: ['Top 3 placement', 'Premium badge', 'Higher click-through rate'],
      available: true,
    },
    {
      id: 'homepage-banner',
      name: 'Homepage Banner',
      description: 'Appear on the homepage banner for maximum visibility',
      icon: Home,
      price: '100,000 TZS/month',
      benefits: ['Homepage placement', 'High visibility', 'Brand recognition'],
      available: isPremium,
    },
    {
      id: 'category-priority',
      name: 'Category Page Priority',
      description: 'Boost to first page in your category for selected markets',
      icon: Search,
      price: '75,000 TZS/month',
      benefits: ['First page placement', 'Market-specific targeting', 'Time-period selection'],
      available: true,
    },
    {
      id: 'search-boost',
      name: 'Search Result Boost',
      description: 'Boost your listing to the first page of search results',
      icon: TrendingUp,
      price: '60,000 TZS/month',
      benefits: ['First page placement', 'Increased impressions', 'More inquiries'],
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Boost Your Visibility</h2>
        <p className="text-muted-foreground">
          Increase your visibility and get more inquiries with our advertising options
        </p>
      </div>

      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current tier determines which advertising options are available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isPremium ? 'default' : 'outline'} className="text-lg px-3 py-1">
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {isPremium
                  ? 'You have access to all advertising options'
                  : 'Upgrade to Premium for access to all features'}
              </p>
            </div>
            {!isPremium && (
              <Button>
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advertising Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advertisingOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className={!option.available ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <CardDescription className="mt-1">{option.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold mb-1">{option.price}</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Benefits:</p>
                    <ul className="space-y-1">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    disabled={!option.available}
                    variant={option.available ? 'default' : 'outline'}
                  >
                    {option.available ? (
                      <>
                        Activate Boost
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      'Upgrade Required'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            See how boosted listings perform compared to standard listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">3x</div>
              <div className="text-sm text-muted-foreground">More Impressions</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2.5x</div>
              <div className="text-sm text-muted-foreground">More Clicks</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2x</div>
              <div className="text-sm text-muted-foreground">More Inquiries</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
