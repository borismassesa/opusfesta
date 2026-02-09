'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Pencil, X } from 'lucide-react';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { getVendorReviews, updateReviewResponse } from '@/lib/supabase/vendor';
import type { VendorReviewRecord } from '@opusfesta/lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';

type ReviewWithUser = VendorReviewRecord & {
  user?: { name: string | null; avatar: string | null } | null;
};

type StarFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-none text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
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

function ReviewCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const { vendorId, vendorName } = useVendorPortalAccess();

  const [starFilter, setStarFilter] = useState<StarFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const {
    data: reviews = [],
    isLoading,
  } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => getVendorReviews(vendorId!),
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const responseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const success = await updateReviewResponse(reviewId, response);
      if (!success) {
        throw new Error('Failed to save response');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      toast.success('Response saved successfully.');
      setRespondingTo(null);
      setEditingResponse(null);
      setResponseText('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save response');
    },
  });

  const typedReviews = reviews as ReviewWithUser[];

  const metrics = useMemo(() => {
    const total = typedReviews.length;
    const avgRating =
      total > 0
        ? typedReviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;
    const withResponse = typedReviews.filter((r) => r.vendor_response).length;
    const responseRate = total > 0 ? Math.round((withResponse / total) * 100) : 0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of typedReviews) {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    }

    return { total, avgRating, responseRate, distribution };
  }, [typedReviews]);

  const filteredAndSorted = useMemo(() => {
    let filtered = typedReviews;

    if (starFilter !== 'all') {
      const starValue = parseInt(starFilter, 10);
      filtered = filtered.filter((r) => r.rating === starValue);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  }, [typedReviews, starFilter, sortBy]);

  const startResponding = (reviewId: string) => {
    setRespondingTo(reviewId);
    setEditingResponse(null);
    setResponseText('');
  };

  const startEditing = (review: ReviewWithUser) => {
    setEditingResponse(review.id);
    setRespondingTo(null);
    setResponseText(review.vendor_response || '');
  };

  const cancelResponse = () => {
    setRespondingTo(null);
    setEditingResponse(null);
    setResponseText('');
  };

  const saveResponse = (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please write a response before saving.');
      return;
    }
    responseMutation.mutate({ reviewId, response: responseText.trim() });
  };

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Ratings</CardTitle>
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
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Reviews & Ratings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage client feedback and respond to reviews for {vendorName || 'your storefront'}.
        </p>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Reviews</CardDescription>
              <CardTitle className="text-2xl">{metrics.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Rating</CardDescription>
              <div className="flex items-center gap-2 pt-1">
                <StarRating rating={Math.round(metrics.avgRating)} size="md" />
                <span className="text-2xl font-bold">{metrics.avgRating.toFixed(1)}</span>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Response Rate</CardDescription>
              <CardTitle className="text-2xl">{metrics.responseRate}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rating Distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = metrics.distribution[star];
                  const percent = metrics.total > 0 ? (count / metrics.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground">{star}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {!isLoading && metrics.total > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(['all', '5', '4', '3', '2', '1'] as StarFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={starFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStarFilter(filter)}
              >
                {filter === 'all' ? 'All' : `${filter} Star${filter === '1' ? '' : 's'}`}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSorted.length === 0 && starFilter !== 'all' ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-medium">No {starFilter}-star reviews</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no reviews matching this filter.
            </p>
          </CardContent>
        </Card>
      ) : typedReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="mb-4 h-14 w-14 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No reviews yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Reviews from your clients will appear here. Keep delivering great service and encourage happy clients to leave feedback!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((review) => {
            const isResponding = respondingTo === review.id;
            const isEditing = editingResponse === review.id;
            const userName = review.user?.name || 'Anonymous';
            const userAvatar = review.user?.avatar;

            return (
              <Card key={review.id}>
                <CardContent className="p-6 space-y-4">
                  {/* Review header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{userName}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.verified && (
                      <Badge variant="secondary" className="shrink-0">Verified</Badge>
                    )}
                  </div>

                  {/* Review content */}
                  {review.title && (
                    <h4 className="font-semibold">{review.title}</h4>
                  )}
                  <p className="text-sm text-foreground leading-relaxed">{review.content}</p>

                  {/* Review images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="h-16 w-16 rounded-md object-cover border"
                        />
                      ))}
                    </div>
                  )}

                  {/* Event info */}
                  {(review.event_type || review.event_date) && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {review.event_type && (
                        <Badge variant="outline">{review.event_type}</Badge>
                      )}
                      {review.event_date && (
                        <span>Event: {formatEventDate(review.event_date)}</span>
                      )}
                    </div>
                  )}

                  {/* Vendor response section */}
                  {review.vendor_response && !isEditing ? (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Your Response</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(review)}
                        >
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
                      {review.vendor_responded_at && (
                        <p className="text-xs text-muted-foreground/60">
                          Responded {formatRelativeDate(review.vendor_responded_at)}
                        </p>
                      )}
                    </div>
                  ) : (isResponding || isEditing) ? (
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {isEditing ? 'Edit Your Response' : 'Write a Response'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={cancelResponse}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a thoughtful response to this review..."
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={cancelResponse}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveResponse(review.id)}
                          disabled={responseMutation.isPending}
                        >
                          {responseMutation.isPending ? 'Saving...' : 'Save Response'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startResponding(review.id)}
                    >
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                      Write a Response
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
