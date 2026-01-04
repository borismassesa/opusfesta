'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getVendorReviews, updateReviewResponse, type Vendor } from '@/lib/supabase/vendor';
import { Star, MessageSquare, Send, Edit2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ReviewsManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

export function ReviewsManager({ vendor, onUpdate }: ReviewsManagerProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorReviews(vendor.id);
    },
    enabled: !!vendor,
  });

  const responseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      return await updateReviewResponse(reviewId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onUpdate();
      setRespondingTo(null);
      setResponseText('');
      toast.success('Response saved');
    },
    onError: () => {
      toast.error('Failed to save response');
    },
  });

  const handleSubmitResponse = (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    responseMutation.mutate({ reviewId, response: responseText });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { stars: star, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <Card id="section-reviews" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Reviews & Ratings</CardTitle>
        <CardDescription>
          View and respond to customer reviews below. You cannot edit reviews, only respond to them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor && (
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please complete your vendor profile in the "About" section first.
            </p>
          </div>
        )}
        {isLoading && vendor ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : vendor ? (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">{reviews.length}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="text-3xl font-bold mb-2">
                  {reviews.filter((r) => r.vendor_response).length}
                </div>
                <div className="text-sm text-muted-foreground">Responded</div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              <h3 className="font-semibold">Rating Breakdown</h3>
              {ratingBreakdown.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm">{stars}</span>
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="font-semibold">All Reviews</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                reviews.map((review: any) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isResponding={respondingTo === review.id}
                    responseText={responseText}
                    onResponseChange={setResponseText}
                    onStartResponding={() => {
                      setRespondingTo(review.id);
                      setResponseText(review.vendor_response || '');
                    }}
                    onCancelResponding={() => {
                      setRespondingTo(null);
                      setResponseText('');
                    }}
                    onSubmitResponse={() => handleSubmitResponse(review.id)}
                    isSaving={responseMutation.isPending}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface ReviewCardProps {
  review: any;
  isResponding: boolean;
  responseText: string;
  onResponseChange: (text: string) => void;
  onStartResponding: () => void;
  onCancelResponding: () => void;
  onSubmitResponse: () => void;
  isSaving: boolean;
}

function ReviewCard({
  review,
  isResponding,
  responseText,
  onResponseChange,
  onStartResponding,
  onCancelResponding,
  onSubmitResponse,
  isSaving,
}: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {review.user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="font-semibold">{review.user?.name || 'Anonymous'}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span>•</span>
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div>
            {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
            <p className="text-sm">{review.content}</p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {review.images.slice(0, 4).map((url: string, index: number) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={url} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Vendor Response */}
          {review.vendor_response && !isResponding && (
            <div className="bg-muted rounded-lg p-4">
              <div className="font-semibold text-sm mb-2">Your Response</div>
              <p className="text-sm">{review.vendor_response}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onStartResponding}
              >
                <Edit2 className="mr-2 h-3 w-3" />
                Edit Response
              </Button>
            </div>
          )}

          {/* Response Form */}
          {isResponding && (
            <div className="space-y-2">
              <Label>Your Response</Label>
              <Textarea
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder="Thank the customer for their review..."
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onCancelResponding} disabled={isSaving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={onSubmitResponse} disabled={isSaving || !responseText.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3" />
                      Send Response
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Respond Button */}
          {!review.vendor_response && !isResponding && (
            <Button variant="outline" size="sm" onClick={onStartResponding}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Respond to Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
