'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Vendor } from '@/lib/supabase/vendor';
import { Eye, Heart, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

interface StorefrontAnalyticsProps {
  vendor: Vendor | null;
}

export function StorefrontAnalytics({ vendor }: StorefrontAnalyticsProps) {
  if (!vendor) {
    return null;
  }

  const stats = vendor.stats || {
    viewCount: 0,
    inquiryCount: 0,
    saveCount: 0,
    averageRating: 0,
    reviewCount: 0,
  };

  const metrics = [
    {
      label: 'Profile Views',
      value: stats.viewCount || 0,
      icon: Eye,
      change: '+12%',
      trend: 'up',
    },
    {
      label: 'Saved/Favorited',
      value: stats.saveCount || 0,
      icon: Heart,
      change: '+8%',
      trend: 'up',
    },
    {
      label: 'Inquiries',
      value: stats.inquiryCount || 0,
      icon: MessageSquare,
      change: '+15%',
      trend: 'up',
    },
    {
      label: 'Conversion Rate',
      value: stats.viewCount > 0
        ? `${((stats.inquiryCount / stats.viewCount) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      change: '+2.3%',
      trend: 'up',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Quick overview of your storefront performance
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/analytics">
              View Full Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span>{metric.label}</span>
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change && (
                  <div className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} from last month
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {stats.viewCount === 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
            <p>No analytics data yet. Complete your storefront to start tracking performance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
