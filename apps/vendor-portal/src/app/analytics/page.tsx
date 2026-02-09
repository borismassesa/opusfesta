'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  MessageSquare,
  TrendingUp,
  Bookmark,
  DollarSign,
  Clock,
  BarChart3,
  Star,
} from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import {
  getVendorViewsOverTime,
  getVendorInquiriesOverTime,
  getVendorRevenueOverTime,
  getVendorResponseTime,
} from '@/lib/supabase/business';
import { getVendorReviews } from '@/lib/supabase/vendor';
import type { VendorReviewRecord } from '@opusfesta/lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';

type Period = '7d' | '30d' | '90d' | '12mo';

function getPeriodDates(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = format(now, 'yyyy-MM-dd');

  switch (period) {
    case '7d':
      return { startDate: format(subDays(now, 7), 'yyyy-MM-dd'), endDate };
    case '30d':
      return { startDate: format(subDays(now, 30), 'yyyy-MM-dd'), endDate };
    case '90d':
      return { startDate: format(subDays(now, 90), 'yyyy-MM-dd'), endDate };
    case '12mo':
      return { startDate: format(subMonths(now, 12), 'yyyy-MM-dd'), endDate };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'MMM d');
}

function KPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[250px] text-center">
      <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = useClerkSupabaseClient();
  const { vendorId, vendorName } = useVendorPortalAccess();
  const [period, setPeriod] = useState<Period>('30d');

  const { startDate, endDate } = getPeriodDates(period);

  // Views over time
  const { data: viewsData = [], isLoading: isViewsLoading } = useQuery({
    queryKey: ['vendor-views-time', vendorId, startDate, endDate],
    queryFn: () => getVendorViewsOverTime(vendorId!, startDate, endDate, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  // Inquiries over time
  const { data: inquiriesData = [], isLoading: isInquiriesLoading } = useQuery({
    queryKey: ['vendor-inquiries-time', vendorId, startDate, endDate],
    queryFn: () => getVendorInquiriesOverTime(vendorId!, startDate, endDate, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  // Revenue over time
  const { data: revenueData = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ['vendor-revenue-time', vendorId, startDate, endDate],
    queryFn: () => getVendorRevenueOverTime(vendorId!, startDate, endDate, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  // Average response time
  const { data: avgResponseTime = 0, isLoading: isResponseTimeLoading } = useQuery({
    queryKey: ['vendor-response-time', vendorId],
    queryFn: () => getVendorResponseTime(vendorId!, supabase),
    enabled: !!vendorId,
    staleTime: 120_000,
  });

  // Reviews for rating distribution
  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['vendor-reviews-analytics', vendorId],
    queryFn: () => getVendorReviews(vendorId!),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  // Vendor stats (for saves count)
  const { data: vendorStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['vendor-stats', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('stats')
        .eq('id', vendorId!)
        .single();
      if (error || !data) return null;
      return data.stats as { viewCount?: number; inquiryCount?: number; saveCount?: number; averageRating?: number; reviewCount?: number } | null;
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  const isLoading =
    isViewsLoading ||
    isInquiriesLoading ||
    isRevenueLoading ||
    isResponseTimeLoading ||
    isReviewsLoading ||
    isStatsLoading;

  // KPI calculations
  const kpis = useMemo(() => {
    const totalViews = viewsData.reduce((sum, p) => sum + p.count, 0);
    const totalInquiries = inquiriesData.reduce((sum, p) => sum + p.count, 0);
    const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100) : 0;
    const totalRevenue = revenueData.reduce((sum, p) => sum + p.count, 0);
    const saveCount = vendorStats?.saveCount ?? 0;

    return {
      totalViews,
      totalInquiries,
      conversionRate,
      saveCount,
      totalRevenue,
      avgResponseTime,
    };
  }, [viewsData, inquiriesData, revenueData, vendorStats, avgResponseTime]);

  // Rating distribution for the bar chart
  const ratingDistribution = useMemo(() => {
    const dist: { rating: string; count: number }[] = [
      { rating: '5 stars', count: 0 },
      { rating: '4 stars', count: 0 },
      { rating: '3 stars', count: 0 },
      { rating: '2 stars', count: 0 },
      { rating: '1 star', count: 0 },
    ];

    for (const review of reviews as VendorReviewRecord[]) {
      const idx = 5 - review.rating;
      if (idx >= 0 && idx < 5) {
        dist[idx].count++;
      }
    }

    return dist;
  }, [reviews]);

  // Chart data with formatted dates
  const viewsChartData = useMemo(
    () => viewsData.map((p) => ({ ...p, label: formatShortDate(p.date) })),
    [viewsData]
  );

  const inquiriesChartData = useMemo(
    () => inquiriesData.map((p) => ({ ...p, label: formatShortDate(p.date) })),
    [inquiriesData]
  );

  const revenueChartData = useMemo(
    () => revenueData.map((p) => ({ ...p, label: formatShortDate(p.date) })),
    [revenueData]
  );

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track performance and engagement for {vendorName || 'your storefront'}.
        </p>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          <TabsTrigger value="7d">7d</TabsTrigger>
          <TabsTrigger value="30d">30d</TabsTrigger>
          <TabsTrigger value="90d">90d</TabsTrigger>
          <TabsTrigger value="12mo">12mo</TabsTrigger>
        </TabsList>

        {/* KPI Cards */}
        <TabsContent value={period}>
          {isLoading ? (
            <KPISkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Profile Views</CardDescription>
                  </div>
                  <CardTitle className="text-2xl">{kpis.totalViews.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Inquiries</CardDescription>
                  </div>
                  <CardTitle className="text-2xl">{kpis.totalInquiries.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Conversion Rate</CardDescription>
                  </div>
                  <CardTitle className="text-2xl">{kpis.conversionRate.toFixed(1)}%</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Saves</CardDescription>
                  </div>
                  <CardTitle className="text-2xl">{kpis.saveCount.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Revenue</CardDescription>
                  </div>
                  <CardTitle className="text-xl">{formatCurrency(kpis.totalRevenue)}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>Avg Response</CardDescription>
                  </div>
                  <CardTitle className="text-2xl">
                    {kpis.avgResponseTime > 0 ? `${kpis.avgResponseTime}h` : 'N/A'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Charts */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Views over time - Line chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Views Over Time</CardTitle>
              <CardDescription>Profile views in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {viewsChartData.length === 0 ? (
                <EmptyChart message="No view data for this period" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={viewsChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Inquiries over time - Bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inquiries Over Time</CardTitle>
              <CardDescription>Client inquiries in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {inquiriesChartData.length === 0 ? (
                <EmptyChart message="No inquiry data for this period" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inquiriesChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Inquiries"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue over time - Area chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
              <CardDescription>Revenue earned in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueChartData.length === 0 ? (
                <EmptyChart message="No revenue data for this period" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Rating distribution - Horizontal bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating Distribution</CardTitle>
              <CardDescription>Breakdown of review ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {(reviews as VendorReviewRecord[]).length === 0 ? (
                <EmptyChart message="No reviews to display" />
              ) : (
                <div className="space-y-3 pt-2">
                  {ratingDistribution.map((item) => {
                    const maxCount = Math.max(...ratingDistribution.map((d) => d.count), 1);
                    const percent = (item.count / maxCount) * 100;
                    return (
                      <div key={item.rating} className="flex items-center gap-3">
                        <span className="w-16 text-sm text-muted-foreground flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </span>
                        <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                          <div
                            className="h-full rounded bg-yellow-400 transition-all flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(percent, item.count > 0 ? 8 : 0)}%` }}
                          >
                            {item.count > 0 && (
                              <span className="text-xs font-medium text-yellow-900">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.count === 0 && (
                          <span className="text-xs text-muted-foreground w-4">0</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
