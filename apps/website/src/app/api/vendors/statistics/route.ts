import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  VendorStatisticsResponseSchema,
  type VendorStatisticsResponse,
} from "@opusfesta/lib";

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

type StatisticsPayload = VendorStatisticsResponse;

const formatVendorCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k+`;
  }
  return `${count}+`;
};

const formatCityCount = (count: number): string => `${count}+`;

const formatRating = (rating: number): string => `${rating.toFixed(1)}/5`;

const toFiniteNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const buildStatisticsResponse = ({
  totalVendors,
  verifiedVendors,
  totalCities,
  averageRating,
  categoryCounts,
}: Omit<StatisticsPayload, "formatted">): StatisticsPayload => {
  const formattedCategoryCounts: Record<string, string> = {};

  Object.keys(categoryCounts).forEach((categoryId) => {
    formattedCategoryCounts[categoryId] = formatVendorCount(categoryCounts[categoryId]);
  });

  return {
    totalVendors,
    verifiedVendors,
    totalCities,
    averageRating,
    categoryCounts,
    formatted: {
      vendorCount: formatVendorCount(verifiedVendors),
      cityCount: formatCityCount(totalCities),
      rating: formatRating(averageRating),
      categoryCounts: formattedCategoryCounts,
    },
  };
};

const ensureStatisticsContract = (payload: StatisticsPayload): StatisticsPayload => {
  const parsed = VendorStatisticsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`Vendor statistics response contract mismatch: ${parsed.error.message}`);
  }
  return parsed.data;
};

const defaultStatistics = (): StatisticsPayload =>
  ensureStatisticsContract(
    buildStatisticsResponse({
      totalVendors: 0,
      verifiedVendors: 0,
      totalCities: 0,
      averageRating: 0,
      categoryCounts: {},
    })
  );

const isMissingRpcFunctionError = (error: { code?: string } | null | undefined) =>
  error?.code === "PGRST202";

type FallbackVendorRow = {
  category: string | null;
  location: unknown;
  stats: unknown;
};

const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  return typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const getFallbackStatistics = async (): Promise<StatisticsPayload> => {
  const [totalVendorsResult, verifiedVendorRowsResult] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase
      .from("vendors")
      .select("category, location, stats")
      .eq("verified", true),
  ]);

  if (totalVendorsResult.error || verifiedVendorRowsResult.error) {
    console.error("Error fetching fallback vendor statistics:", {
      totalError: totalVendorsResult.error,
      verifiedError: verifiedVendorRowsResult.error,
    });
    return defaultStatistics();
  }

  const categoryCounts: Record<string, number> = {};
  const uniqueCities = new Set<string>();
  const verifiedRows = (verifiedVendorRowsResult.data || []) as FallbackVendorRow[];
  let ratingTotal = 0;
  let ratedVendors = 0;

  verifiedRows.forEach((row) => {
    if (row.category) {
      const frontendCategoryId = CATEGORY_MAPPING[row.category] || row.category;
      categoryCounts[frontendCategoryId] = (categoryCounts[frontendCategoryId] || 0) + 1;
    }

    const location = parseJsonObject(row.location);
    const city = location?.city;
    if (typeof city === "string" && city.trim().length > 0) {
      uniqueCities.add(city.trim());
    }

    const stats = parseJsonObject(row.stats);
    const rawRating = stats?.averageRating;
    const numericRating = Number(rawRating);

    if (Number.isFinite(numericRating) && numericRating > 0) {
      ratingTotal += numericRating;
      ratedVendors += 1;
    }
  });

  const averageRating = ratedVendors > 0 ? Number((ratingTotal / ratedVendors).toFixed(1)) : 0;

  return buildStatisticsResponse({
    totalVendors: totalVendorsResult.count ?? verifiedRows.length,
    verifiedVendors: verifiedRows.length,
    totalCities: uniqueCities.size,
    averageRating,
    categoryCounts,
  });
};

export async function GET() {
  try {
    // Call the Supabase RPC functions to get statistics
    const [statsResult, categoryCountsResult] = await Promise.all([
      supabase.rpc("get_vendor_statistics"),
      supabase.rpc("get_vendor_category_counts"),
    ]);

    if (
      isMissingRpcFunctionError(statsResult.error) ||
      isMissingRpcFunctionError(categoryCountsResult.error)
    ) {
      const fallbackStats = await getFallbackStatistics();
      return NextResponse.json(ensureStatisticsContract(fallbackStats));
    }

    if (statsResult.error) {
      console.error("Error fetching vendor statistics:", statsResult.error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 }
      );
    }

    if (!statsResult.data || statsResult.data.length === 0) {
      return NextResponse.json(defaultStatistics());
    }

    const stats = statsResult.data[0];

    // Process category counts
    const categoryCounts: Record<string, number> = {};

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
    }

    return NextResponse.json(
      ensureStatisticsContract(
        buildStatisticsResponse({
          totalVendors: toFiniteNumber(stats.total_vendors),
          verifiedVendors: toFiniteNumber(stats.verified_vendors),
          totalCities: toFiniteNumber(stats.total_cities),
          averageRating: toFiniteNumber(stats.average_rating),
          categoryCounts,
        })
      ),
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Error in statistics API:", error);
    return NextResponse.json(defaultStatistics());
  }
}
