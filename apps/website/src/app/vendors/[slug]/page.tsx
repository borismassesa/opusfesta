import { Suspense } from "react";
import { Metadata } from "next";
import { VendorDetailsClient } from "./VendorDetailsClient";
import { getVendorBySlug } from "@/lib/supabase/vendors";

export const dynamic = "force-dynamic";

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

