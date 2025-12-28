import { notFound } from "next/navigation";
import { Metadata } from "next";
import { VendorDetailsPage } from "@/components/vendors/VendorDetailsPage";
import {
  getVendorBySlug,
  getVendorPortfolio,
  getVendorReviews,
  getSimilarVendors,
  incrementVendorViewCount,
} from "@/lib/supabase/vendors";
import {
  getMockVendorBySlug,
  getMockVendorPortfolio,
  getMockVendorReviews,
} from "@/lib/vendors/mockVendors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    return {
      title: "Vendor Not Found",
    };
  }

  const description =
    vendor.description || vendor.bio || `${vendor.business_name} - ${vendor.category} in ${vendor.location?.city || "Tanzania"}`;
  const image = vendor.cover_image || vendor.logo || "";

  return {
    title: `${vendor.business_name} | TheFesta`,
    description,
    openGraph: {
      title: `${vendor.business_name} | TheFesta`,
      description,
      images: image ? [image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${vendor.business_name} | TheFesta`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Try to get vendor from database first, fallback to mock data
  let vendor = await getVendorBySlug(slug);
  let portfolio: any[] = [];
  let reviews: any[] = [];
  let similarVendors: any[] = [];

  if (!vendor) {
    // Fallback to mock data
    vendor = getMockVendorBySlug(slug);
    if (!vendor) {
      notFound();
    }
    // Use mock portfolio and reviews
    portfolio = getMockVendorPortfolio(vendor.id);
    reviews = getMockVendorReviews(vendor.id);
  } else {
    // Load related data from database in parallel
    [portfolio, reviews, similarVendors] = await Promise.all([
      getVendorPortfolio(vendor.id),
      getVendorReviews(vendor.id),
      getSimilarVendors(vendor.category, vendor.id),
    ]);

    // Increment view count (fire and forget)
    incrementVendorViewCount(vendor.id).catch(console.error);
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.business_name,
    description: vendor.description || vendor.bio || "",
    image: vendor.cover_image || vendor.logo || "",
    address: {
      "@type": "PostalAddress",
      addressLocality: vendor.location?.city || "",
      addressCountry: vendor.location?.country || "Tanzania",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: vendor.stats.averageRating,
      reviewCount: vendor.stats.reviewCount,
    },
    priceRange: vendor.price_range || "",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VendorDetailsPage
        vendor={vendor}
        portfolio={portfolio}
        reviews={reviews}
        similarVendors={similarVendors}
      />
    </>
  );
}

