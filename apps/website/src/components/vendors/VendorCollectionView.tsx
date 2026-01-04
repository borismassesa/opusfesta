"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Eye,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { resolveAssetSrc } from "@/lib/assets";
import { useSaveVendor } from "@/hooks/useSaveVendor";
import {
  BUDGET_FRIENDLY,
  DEALS,
  MOST_BOOKED,
  NEW_VENDORS,
  QUICK_RESPONDERS,
  ZANZIBAR_SPOTLIGHT,
  type VendorCollectionItem,
} from "@/lib/vendors/collections";

import heroMain from "@assets/stock_images/elegant_wedding_venu_86ae752a.jpg";

// Stats will be fetched dynamically from the API
interface VendorStats {
  vendorCount: string;
  cityCount: string;
  rating: string;
}

const PAGE_SIZE = 12;

type CollectionConfig = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeClassName: string;
  items: VendorCollectionItem[];
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const COLLECTIONS: Record<string, CollectionConfig> = {
  deals: {
    id: "deals",
    eyebrow: "Promotions",
    title: "Exclusive deals from top-rated vendors.",
    subtitle:
      "Limited-time offers on catering, venues, and more from vetted professionals.",
    badgeLabel: "Deal",
    badgeClassName: "bg-amber-500",
    items: DEALS,
  },
  new: {
    id: "new",
    eyebrow: "New vendors",
    title: "Talented teams ready to book right now.",
    subtitle:
      "Browse the latest vendors joining the marketplace and reach out while their calendars are open.",
    badgeLabel: "New",
    badgeClassName: "bg-blue-500",
    items: NEW_VENDORS,
  },
  trending: {
    id: "trending",
    eyebrow: "Most booked this month",
    title: "See which vendors couples are booking right now.",
    subtitle:
      "Popular teams with standout reviews and high demand across Tanzania.",
    badgeLabel: "Trending",
    badgeClassName: "bg-purple-500",
    items: MOST_BOOKED,
  },
  budget: {
    id: "budget",
    eyebrow: "Budget-friendly picks",
    title: "Quality vendors at prices that feel effortless.",
    subtitle:
      "Explore value-packed teams that deliver premium experiences without stretching the budget.",
    badgeLabel: "Great value",
    badgeClassName: "bg-emerald-500",
    items: BUDGET_FRIENDLY,
  },
  "fast-responders": {
    id: "fast-responders",
    eyebrow: "Quick responders",
    title: "Vendors who reply in under 2 hours.",
    subtitle:
      "Fast-response teams who keep your planning on track from the first message.",
    badgeLabel: "Fast reply",
    badgeClassName: "bg-orange-500",
    items: QUICK_RESPONDERS,
  },
  zanzibar: {
    id: "zanzibar",
    eyebrow: "Zanzibar spotlight",
    title: "Island paradise with standout local vendors.",
    subtitle:
      "Beachfront venues, floral studios, and photo teams trusted by Zanzibar couples.",
    badgeLabel: "Featured",
    badgeClassName: "bg-indigo-500",
    items: ZANZIBAR_SPOTLIGHT,
  },
};

const COLLECTION_BADGE_ICONS: Record<string, LucideIcon> = {
  deals: Tag,
  new: Sparkles,
  trending: TrendingUp,
  budget: Wallet,
  "fast-responders": Zap,
  zanzibar: Star,
};

// Vendor Save Button Component
function VendorSaveButton({ vendorId }: { vendorId: string }) {
  const { isSaved, isLoading, toggleSave } = useSaveVendor({
    vendorId,
    redirectToLogin: true,
  });

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave();
      }}
      disabled={isLoading}
      className={`p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors ${
        isSaved ? "text-red-500" : "text-primary"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isSaved ? "Remove from saved" : "Save vendor"}
    >
      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
    </button>
  );
}

type VendorCollectionViewProps = {
  collectionKey: string;
};

export function VendorCollectionView({
  collectionKey,
}: VendorCollectionViewProps) {
  const collection = COLLECTIONS[collectionKey] ?? null;
  const BadgeIcon = collection
    ? COLLECTION_BADGE_ICONS[collection.id] ?? Sparkles
    : Sparkles;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("All");
  // Using infinite scroll with intersection observer
  const [stats, setStats] = useState<VendorStats>({
    vendorCount: "15k+",
    cityCount: "120+",
    rating: "4.9/5",
  });
  const [vendors, setVendors] = useState<VendorCollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Map collection keys to search API parameters
  const getSearchParams = (collectionKey: string, page: number, searchQuery: string, activeLocation: string) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", PAGE_SIZE.toString());
    params.set("verified", "true");
    
    // Add search query if provided
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    
    // Add location filter if not "All"
    if (activeLocation !== "All") {
      params.set("location", activeLocation);
    }
    
    // Map collection-specific filters
    switch (collectionKey) {
      case "budget":
        params.set("priceRange", "$");
        params.set("sort", "rating");
        break;
      case "zanzibar":
        params.set("location", "Zanzibar");
        params.set("sort", "rating");
        break;
      case "trending":
      case "most-booked":
        params.set("sort", "bookings");
        break;
      case "new":
        params.set("sort", "newest");
        break;
      case "deals":
        params.set("sort", "rating");
        break;
      case "fast-responders":
        params.set("sort", "bookings");
        break;
      default:
        params.set("sort", "recommended");
    }
    
    return params.toString();
  };

  // Helper function to transform vendor data
  const transformVendor = (vendor: any): VendorCollectionItem => {
    const location = typeof vendor.location === 'string' 
      ? JSON.parse(vendor.location) 
      : vendor.location || {};
    const stats = typeof vendor.stats === 'string'
      ? JSON.parse(vendor.stats)
      : vendor.stats || {};
    
    return {
      id: vendor.id,
      name: vendor.business_name || vendor.name,
      category: vendor.category,
      location: location?.city || "Unknown",
      rating: stats.averageRating || vendor.rating || 0,
      reviews: stats.reviewCount || vendor.reviews || 0,
      image: vendor.cover_image || vendor.logo || "",
      slug: vendor.slug || generateSlug(vendor.business_name || vendor.name),
    };
  };

  // Fetch initial vendors when filters change
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      try {
        const searchParams = getSearchParams(collectionKey, 1, searchQuery, activeLocation);
        const response = await fetch(`/api/vendors/search?${searchParams}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }
        const data = await response.json();
        
        const transformedVendors: VendorCollectionItem[] = (data.vendors || []).map(transformVendor);
        
        setVendors(transformedVendors);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
        setError("Failed to load vendors. Please try again later.");
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    if (collection) {
      fetchVendors();
    } else {
      setLoading(false);
    }
  }, [collectionKey, collection, searchQuery, activeLocation]);

  // Load more vendors when page changes (infinite scroll)
  useEffect(() => {
    if (currentPage > 1 && !loading && collection) {
      const fetchMore = async () => {
        setLoadingMore(true);
        try {
          const searchParams = getSearchParams(collectionKey, currentPage, searchQuery, activeLocation);
          const response = await fetch(`/api/vendors/search?${searchParams}`);
          
          if (response.ok) {
            const data = await response.json();
            const transformedVendors: VendorCollectionItem[] = (data.vendors || []).map(transformVendor);
            setVendors((prev) => [...prev, ...transformedVendors]);
          }
        } catch (err) {
          console.error("Failed to load more vendors:", err);
        } finally {
          setLoadingMore(false);
        }
      };
      
      fetchMore();
    }
  }, [currentPage, collectionKey, searchQuery, activeLocation, collection, loading]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || currentPage >= totalPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore && currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, loadingMore, currentPage, totalPages]);

  // Fetch vendor statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/vendors/statistics");
        if (response.ok) {
          const data = await response.json();
          if (data.formatted) {
            setStats({
              vendorCount: data.formatted.vendorCount,
              cityCount: data.formatted.cityCount,
              rating: data.formatted.rating,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch vendor statistics:", error);
        // Keep default values on error
      }
    };

    fetchStats();
  }, []);

  // Server-side filtering means we don't need client-side filtering anymore
  // But we still need to track locations for the filter dropdown
  // We'll fetch unique locations separately or use a static list
  const locations = useMemo(() => {
    // For now, use common locations - could be enhanced to fetch from API
    return ["All", "Dar es Salaam", "Zanzibar", "Arusha", "Mwanza", "Dodoma", "Bagamoyo"];
  }, []);

  // Since filtering is now server-side, vendors are already filtered
  const visibleItems = useMemo(
    () => vendors,
    [vendors]
  );

  // Pagination state is managed by currentPage and totalPages

  useEffect(() => {
    setActiveLocation("All");
    setSearchQuery("");
    setCurrentPage(1);
  }, [collectionKey]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-background text-primary">
        <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="pt-24 px-6 lg:px-12 xl:px-12 2xl:px-16">
          <div className="max-w-[1200px] mx-auto rounded-3xl border border-border bg-surface/80 p-10 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold">Collection not found</h1>
            <p className="mt-3 text-secondary">
              Choose a curated vendor collection to keep browsing.
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-background"
            >
              Back to vendors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen overflow-hidden">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        <section className="relative pt-20 pb-8 px-6 lg:px-12 xl:px-12 2xl:px-16 border-b border-border">
          <div className="max-w-[1800px] mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <nav className="vendors-hero-eyebrow flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-secondary">
                <Link href="/" className="hover:text-primary transition-colors">
                  Weddings
                </Link>
                <span className="text-secondary">/</span>
                <Link href="/vendors" className="hover:text-primary transition-colors">
                  Wedding Vendors
                </Link>
                <span className="text-secondary">/</span>
                <span className="text-primary">{collection.eyebrow}</span>
              </nav>
              <h1 className="vendors-hero-title mt-5 text-3xl md:text-4xl lg:text-4xl font-semibold leading-[1.05]">
                {collection.title}
              </h1>
              <p className="vendors-hero-subtitle mt-3 text-base md:text-lg text-secondary leading-relaxed max-w-xl">
                {collection.subtitle}
              </p>

              <div className="vendors-hero-actions mt-6">
                <div className="flex flex-col sm:flex-row bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 flex-1">
                    <Search className="w-4 h-4 text-secondary" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search vendors"
                      className="w-full bg-transparent text-sm text-primary placeholder:text-secondary/60 focus:outline-none"
                    />
                  </div>
                  <div className="h-px w-full sm:h-auto sm:w-px bg-border" />
                  <div className="flex items-center gap-3 px-4 py-3 flex-1">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <select
                      value={activeLocation}
                      onChange={(event) => setActiveLocation(event.target.value)}
                      className="w-full bg-transparent text-sm text-primary focus:outline-none"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="sm:w-auto w-full px-8 py-3 bg-primary text-background text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="vendors-hero-stats mt-6 flex flex-wrap gap-5 text-sm text-secondary">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-primary">
                    {stats.vendorCount}
                  </span>
                  <span className="text-xs">Vetted vendors</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-primary">
                    {stats.cityCount}
                  </span>
                  <span className="text-xs">Cities covered</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-primary">
                    {stats.rating}
                  </span>
                  <span className="text-xs">Average rating</span>
                </div>
              </div>
            </div>

            <div className="vendors-hero-media relative lg:w-full">
              <div
                className="relative h-[200px] md:h-[240px] lg:h-[300px] overflow-hidden shadow-xl"
                style={{
                  clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
                }}
              >
                <img
                  src={resolveAssetSrc(heroMain)}
                  alt="Elegant wedding venue"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 px-6 lg:px-12 xl:px-12 2xl:px-16 bg-background">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  {collection.eyebrow}
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  {collection.title}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-12 text-center text-secondary">
                Loading vendors...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-12 text-center text-secondary">
                {error}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-12 text-center text-secondary">
                No vendors match your search yet. Try another location or name.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3">
                  {visibleItems.map((vendor, index) => {
                  const isRightEdge = index === visibleItems.length - 1;
                  return (
                    <div key={vendor.id}>
                      <Link
                        href={`/vendors/${vendor.slug || generateSlug(vendor.name)}`}
                        className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block"
                      >
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                          <img
                            src={resolveAssetSrc(vendor.image)}
                            alt={vendor.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                          />
                          <div
                            className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${collection.badgeClassName} text-background text-[0.6rem] font-semibold`}
                          >
                            <BadgeIcon className="w-2.5 h-2.5" />
                            {collection.badgeLabel}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <h4 className="text-background font-bold text-base line-clamp-2">
                                  {vendor.category}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <VendorSaveButton vendorId={vendor.id} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="mt-2.5 relative">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="group/avatar">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs cursor-pointer transition-all hover:scale-110 hover:bg-primary/20">
                                {vendor.name.charAt(0)}
                              </div>
                              <div
                                className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                                  isRightEdge ? "right-0" : "left-[-10px]"
                                }`}
                              >
                                <div className="p-5">
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
                                      <span className="text-lg font-bold text-primary">
                                        {vendor.name.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm text-primary mb-0.5 truncate">
                                        {vendor.category}
                                      </h4>
                                      <p className="text-[0.65rem] text-secondary mb-1">
                                        {vendor.location}, Tanzania
                                      </p>
                                      <div className="flex items-center gap-2 text-[0.65rem]">
                                        <div className="flex items-center gap-0.5 font-semibold">
                                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                          {vendor.rating}
                                        </div>
                                        <span className="text-secondary">
                                          ({vendor.reviews})
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                        onClick={(event) => event.preventDefault()}
                                      >
                                        Follow
                                      </button>
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                        onClick={(event) => event.preventDefault()}
                                      >
                                        Contact
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                      <img
                                        src={resolveAssetSrc(vendor.image)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                      <img
                                        src={resolveAssetSrc(vendor.image)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                      <img
                                        src={resolveAssetSrc(vendor.image)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`absolute top-full w-3 h-3 bg-background border-r border-b border-border transform rotate-45 -mt-1.5 ${
                                    isRightEdge ? "right-6" : "left-6"
                                  }`}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-secondary">
                              {vendor.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold shrink-0">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {vendor.rating}
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3 text-secondary" />
                              {vendor.reviews}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Infinite scroll loading indicator */}
              {loadingMore && (
                <div className="mt-10 flex justify-center">
                  <div className="rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-primary">
                    Loading more vendors...
                  </div>
                </div>
              )}
              
              {/* Results count */}
              {total > 0 && (
                <div className="mt-4 text-center text-sm text-secondary">
                  Showing {vendors.length} of {total} vendors
                </div>
              )}
            </>
            )}
            
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
