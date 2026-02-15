import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { VENDOR_LIST_COLUMNS } from "@/lib/vendor-columns";

const CATEGORY_MAPPING: Record<string, string> = {
  Venues: "Venues",
  Photographers: "Photography",
  Videographers: "Videography",
  Caterers: "Catering",
  "Wedding Planners": "Planning",
  Florists: "Florals",
  "DJs & Music": "Music",
  "Beauty & Makeup": "Beauty",
  "Bridal Salons": "Bridal shops",
  Officiants: "Officiants",
  Decorators: "Decor",
  "Cake & Desserts": "Decor",
  Rentals: "Decor",
  Transportation: "Decor",
};

const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}+`;

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all queries in parallel on the server
    const [
      statsResult,
      categoryCountsResult,
      featuredResult,
      plannersResult,
      venuesResult,
      photographersResult,
      beautyResult,
      bridalResult,
      officiantsResult,
      dealsResult,
      newResult,
      trendingResult,
      budgetResult,
      fastRespondersResult,
      spotlightResult,
    ] = await Promise.all([
      supabase.rpc("get_vendor_statistics"),
      supabase.rpc("get_vendor_category_counts"),
      supabase
        .from("vendors")
        .select(VENDOR_LIST_COLUMNS)
        .eq("verified", true)
        .order("stats->averageRating", { ascending: false })
        .limit(12),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Wedding Planners").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Venues").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Photographers").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Beauty & Makeup").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Bridal Salons").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("category", "Officiants").order("stats->averageRating", { ascending: false }).limit(4),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).in("tier", ["premium", "pro"]).order("stats->averageRating", { ascending: false }).limit(6),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).gte("created_at", thirtyDaysAgo.toISOString()).order("created_at", { ascending: false }).limit(6),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).order("stats->inquiryCount", { ascending: false }).order("stats->averageRating", { ascending: false }).limit(6),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).in("price_range", ["$", "$$"]).order("stats->averageRating", { ascending: false }).limit(6),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).order("stats->inquiryCount", { ascending: false }).limit(6),
      supabase.from("vendors").select(VENDOR_LIST_COLUMNS).eq("verified", true).eq("location->>city", "Zanzibar").order("stats->averageRating", { ascending: false }).limit(6),
    ]);

    // Process statistics
    let stats = {
      vendorCount: "0+",
      cityCount: "0+",
      rating: "0.0/5",
      categoryCounts: {} as Record<string, string>,
    };
    if (statsResult.data?.[0]) {
      const s = statsResult.data[0];
      const categoryCounts: Record<string, number> = {};
      if (categoryCountsResult.data) {
        categoryCountsResult.data.forEach(
          (item: { category: string; count: number }) => {
            const id = CATEGORY_MAPPING[item.category] || item.category;
            categoryCounts[id] = (categoryCounts[id] || 0) + item.count;
          }
        );
      }
      const formattedCategoryCounts: Record<string, string> = {};
      Object.entries(categoryCounts).forEach(([k, v]) => {
        formattedCategoryCounts[k] = formatCount(v);
      });
      stats = {
        vendorCount: formatCount(toNum(s.verified_vendors)),
        cityCount: `${toNum(s.total_cities)}+`,
        rating: `${toNum(s.average_rating).toFixed(1)}/5`,
        categoryCounts: formattedCategoryCounts,
      };
    }

    // Fallback for "new" collection if no vendors in last 30 days
    let newVendors = newResult.data || [];
    if (newVendors.length === 0) {
      const { data: fallbackNew } = await supabase
        .from("vendors")
        .select(VENDOR_LIST_COLUMNS)
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .limit(6);
      newVendors = fallbackNew || [];
    }

    const response = {
      stats,
      featured: featuredResult.data || [],
      categories: {
        planners: plannersResult.data || [],
        venues: venuesResult.data || [],
        photographers: photographersResult.data || [],
        beauty: beautyResult.data || [],
        "bridal-shops": bridalResult.data || [],
        officiants: officiantsResult.data || [],
      },
      collections: {
        deals: dealsResult.data || [],
        new: newVendors,
        trending: trendingResult.data || [],
        budget: budgetResult.data || [],
        "fast-responders": fastRespondersResult.data || [],
      },
      spotlight: spotlightResult.data || [],
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error in vendors homepage API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
