import type { Metadata } from "next";

export const SITE_NAME = "OpusFesta";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://opusfestaevents.com";
export const SITE_DESCRIPTION =
  "Tanzania's all-in-one wedding & events marketplace. Discover venues, vendors, and planning tools to manage every detail of your perfect day.";
export const TWITTER_HANDLE = "@opusfesta";

export function getBaseUrl(): string {
  return SITE_URL;
}

export function createMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || {
    url: "/opengraph.png",
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} - Plan Your Perfect Wedding`,
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [typeof ogImage === "string" ? ogImage : ogImage.url],
      creator: TWITTER_HANDLE,
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "OPUS FESTA",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: SITE_DESCRIPTION,
    areaServed: {
      "@type": "Country",
      name: "Tanzania",
    },
    sameAs: [
      "https://twitter.com/opusfesta",
      "https://instagram.com/opusfesta",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Swahili"],
    },
  };
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "OPUS FESTA",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/vendors/all?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createLocalBusinessSchema(vendor: {
  business_name: string;
  description?: string | null;
  bio?: string | null;
  category?: string | null;
  cover_image?: string | null;
  logo?: string | null;
  location?: { city?: string; address?: string } | null;
  price_range?: string | null;
  stats?: { averageRating?: number; reviewCount?: number } | null;
  slug?: string | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.business_name,
    description:
      vendor.description ||
      vendor.bio ||
      `${vendor.business_name} - Wedding ${vendor.category || "vendor"} in Tanzania`,
    image: vendor.cover_image || vendor.logo || undefined,
    url: vendor.slug ? `${SITE_URL}/vendors/${vendor.slug}` : undefined,
  };

  if (vendor.location?.city) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: vendor.location.city,
      addressCountry: "TZ",
    };
  }

  if (vendor.price_range) {
    schema.priceRange = vendor.price_range;
  }

  if (
    vendor.stats?.averageRating &&
    vendor.stats.averageRating > 0 &&
    vendor.stats?.reviewCount &&
    vendor.stats.reviewCount > 0
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: vendor.stats.averageRating,
      reviewCount: vendor.stats.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function createBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createJobPostingSchema(job: {
  title: string;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  employment_type?: string | null;
  created_at?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description:
      job.description?.replace(/<[^>]*>/g, "") ||
      `${job.title} position at OpusFesta`,
    datePosted: job.created_at || new Date().toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Dar es Salaam",
        addressCountry: "TZ",
      },
    },
  };

  if (job.employment_type) {
    const typeMap: Record<string, string> = {
      "full-time": "FULL_TIME",
      "part-time": "PART_TIME",
      contract: "CONTRACTOR",
      internship: "INTERN",
      temporary: "TEMPORARY",
    };
    schema.employmentType =
      typeMap[job.employment_type.toLowerCase()] || "FULL_TIME";
  }

  if (job.salary_min || job.salary_max) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "TZS",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min && { minValue: job.salary_min }),
        ...(job.salary_max && { maxValue: job.salary_max }),
        unitText: "MONTH",
      },
    };
  }

  return schema;
}

export function createItemListSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
