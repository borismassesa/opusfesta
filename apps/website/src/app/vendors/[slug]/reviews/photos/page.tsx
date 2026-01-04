import { notFound } from "next/navigation";
import { VendorReviewPhotosPage } from "@/components/vendors/VendorReviewPhotosPage";
import type { ReviewImage } from "@/components/vendors/VendorReviewPhotosPage";
import {
  getVendorBySlug,
  getVendorReviews,
} from "@/lib/supabase/vendors";
import type { Review } from "@/lib/supabase/vendors";

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];
  const videoPlatforms = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
  ];
  const lowerUrl = url.toLowerCase();
  return (
    videoExtensions.some((ext) => lowerUrl.includes(ext)) ||
    videoPlatforms.some((platform) => lowerUrl.includes(platform))
  );
};

export default async function VendorReviewPhotosRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Get vendor from database - no mock fallback in production
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const reviews = await getVendorReviews(vendor.id);

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const reviewImages: ReviewImage[] = sortedReviews
    .flatMap((review) =>
      (review.images || []).map((image) => ({
        url: image,
        reviewId: review.id,
        reviewRating: review.rating,
        reviewUserName: review.user?.name || "Anonymous",
        reviewDate: review.created_at,
        reviewContent: review.content,
      }))
    )
    .filter((item) => !isVideoUrl(item.url));

  return (
    <VendorReviewPhotosPage
      vendor={vendor}
      reviewImages={reviewImages}
      reviewCount={reviews.length}
    />
  );
}
