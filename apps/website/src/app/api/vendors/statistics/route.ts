import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Map database category enum values to frontend category IDs
const CATEGORY_MAPPING: Record<string, string> = {
  'Venues': 'Venues',
  'Photographers': 'Photography',
  'Videographers': 'Videography',
  'Caterers': 'Catering',
  'Wedding Planners': 'Planning',
  'Florists': 'Florals',
  'DJs & Music': 'Music',
  'Beauty & Makeup': 'Beauty',
  'Bridal Salons': 'Bridal shops',
  'Officiants': 'Officiants',
  'Decorators': 'Decor',
  'Cake & Desserts': 'Decor', // Map to closest match
  'Rentals': 'Decor', // Map to closest match
  'Transportation': 'Decor', // Map to closest match
};

export async function GET() {
  try {
    // Call the Supabase RPC functions to get statistics
    const [statsResult, categoryCountsResult] = await Promise.all([
      supabase.rpc("get_vendor_statistics"),
      supabase.rpc("get_vendor_category_counts"),
    ]);

    if (statsResult.error) {
      console.error("Error fetching vendor statistics:", statsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 }
      );
    }

    if (!statsResult.data || statsResult.data.length === 0) {
      // Return default values if no data
      return NextResponse.json({
        totalVendors: 0,
        verifiedVendors: 0,
        totalCities: 0,
        averageRating: 0,
        categoryCounts: {},
      });
    }

    const stats = statsResult.data[0];

    // Format the statistics for display
    const formatVendorCount = (count: number): string => {
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k+`;
      }
      return `${count}+`;
    };

    const formatCityCount = (count: number): string => {
      return `${count}+`;
    };

    const formatRating = (rating: number): string => {
      return `${rating.toFixed(1)}/5`;
    };

    // Process category counts
    const categoryCounts: Record<string, number> = {};
    const formattedCategoryCounts: Record<string, string> = {};

    if (categoryCountsResult.data && !categoryCountsResult.error) {
      categoryCountsResult.data.forEach((item: { category: string; count: number }) => {
        const frontendCategoryId = CATEGORY_MAPPING[item.category] || item.category;
        // Sum counts if multiple database categories map to the same frontend category
        if (categoryCounts[frontendCategoryId]) {
          categoryCounts[frontendCategoryId] += item.count;
        } else {
          categoryCounts[frontendCategoryId] = item.count;
        }
      });

      // Format category counts
      Object.keys(categoryCounts).forEach((categoryId) => {
        formattedCategoryCounts[categoryId] = formatVendorCount(categoryCounts[categoryId]);
      });
    }

    return NextResponse.json({
      totalVendors: stats.total_vendors || 0,
      verifiedVendors: stats.verified_vendors || 0,
      totalCities: stats.total_cities || 0,
      averageRating: stats.average_rating || 0,
      categoryCounts,
      formatted: {
        vendorCount: formatVendorCount(stats.verified_vendors || 0),
        cityCount: formatCityCount(stats.total_cities || 0),
        rating: formatRating(stats.average_rating || 0),
        categoryCounts: formattedCategoryCounts,
      },
    });
  } catch (error) {
    console.error("Error in statistics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
