import { notFound } from "next/navigation";
import { Metadata } from "next";
import { VendorGalleryPage } from "@/components/vendors/VendorGalleryPage";
import {
  getVendorBySlug,
  getVendorPortfolio,
} from "@/lib/supabase/vendors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) {
    return {
      title: "Gallery Not Found",
    };
  }

  return {
    title: `${vendor.business_name} - Gallery | TheFesta`,
    description: `View the complete portfolio gallery for ${vendor.business_name}`,
  };
}

export default async function VendorGalleryRoute({
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

  const portfolio = await getVendorPortfolio(vendor.id);

  return <VendorGalleryPage vendor={vendor} portfolio={portfolio} />;
}
