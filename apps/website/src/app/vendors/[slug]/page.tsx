import { Suspense } from "react";
import { Metadata } from "next";
import { VendorDetailsClient } from "./VendorDetailsClient";
import { getVendorBySlug } from "@/lib/supabase/vendors";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://opusfestaevents.com";

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
  const canonicalUrl = `${BASE_URL}/vendors/${slug}`;
  const location = vendor.location?.city 
    ? `${vendor.location.city}${vendor.location.country ? `, ${vendor.location.country}` : ", Tanzania"}`
    : "Tanzania";

  return {
    title: `${vendor.business_name} | ${vendor.category} in ${location} | OpusFesta`,
    description: description.length > 160 ? description.substring(0, 157) + "..." : description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${vendor.business_name} | OpusFesta`,
      description: description.length > 200 ? description.substring(0, 197) + "..." : description,
      images: image ? [image] : [],
      type: "website",
      url: canonicalUrl,
      siteName: "OpusFesta",
    },
    twitter: {
      card: "summary_large_image",
      title: `${vendor.business_name} | OpusFesta`,
      description: description.length > 200 ? description.substring(0, 197) + "..." : description,
      images: image ? [image] : [],
    },
  };
}

export default function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-primary min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading vendor profile...</div>
        </div>
      }
    >
      <VendorDetailsClient params={params} />
    </Suspense>
  );
}

