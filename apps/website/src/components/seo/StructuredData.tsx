import Script from "next/script";
import type { Vendor, Review } from "@/lib/supabase/vendors";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://opusfestaevents.com";

interface StructuredDataProps {
  vendor: Vendor;
  reviews?: Review[];
}

export function VendorStructuredData({ vendor, reviews = [] }: StructuredDataProps) {
  const location = vendor.location?.city 
    ? `${vendor.location.city}${vendor.location.country ? `, ${vendor.location.country}` : ", Tanzania"}`
    : "Tanzania";

  // Calculate aggregate rating
  const aggregateRating = reviews.length > 0
    ? {
        "@type": "AggregateRating",
        ratingValue: vendor.stats?.averageRating || 0,
        reviewCount: vendor.stats?.reviewCount || reviews.length,
        bestRating: 5,
        worstRating: 1,
      }
    : undefined;

  // Build structured data for LocalBusiness (most appropriate for wedding vendors)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/vendors/${vendor.slug}`,
    name: vendor.business_name,
    description: vendor.description || vendor.bio || `${vendor.business_name} - ${vendor.category} in ${location}`,
    image: vendor.cover_image || vendor.logo || undefined,
    url: `${BASE_URL}/vendors/${vendor.slug}`,
    telephone: vendor.contact_info?.phone || undefined,
    email: vendor.contact_info?.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: vendor.location?.city || undefined,
      addressCountry: vendor.location?.country || "Tanzania",
      streetAddress: vendor.location?.address || undefined,
    },
    geo: vendor.location?.coordinates
      ? {
          "@type": "GeoCoordinates",
          latitude: vendor.location.coordinates.lat,
          longitude: vendor.location.coordinates.lng,
        }
      : undefined,
    priceRange: vendor.price_range || undefined,
    ...(aggregateRating && { aggregateRating }),
    ...(vendor.social_links?.website && { sameAs: [vendor.social_links.website] }),
    ...(vendor.years_in_business && {
      foundingDate: new Date(
        new Date().getFullYear() - vendor.years_in_business,
        0,
        1
      ).toISOString().split("T")[0],
    }),
  };

  // Remove undefined values
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData));

  return (
    <Script
      id="vendor-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanStructuredData) }}
    />
  );
}

interface OrganizationStructuredDataProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
}

export function OrganizationStructuredData({
  name = "OpusFesta",
  description = "The all-in-one marketplace for wedding venues, vendors, and planning tools. Discover inspiration and manage every detail in one place.",
  url = BASE_URL,
  logo = `${BASE_URL}/opengraph.png`,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
    logo,
    sameAs: [
      "https://twitter.com/opusfesta",
      // Add other social media links when available
    ],
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
