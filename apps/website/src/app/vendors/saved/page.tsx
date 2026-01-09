"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bookmark, 
  Star, 
  MapPin, 
  Eye, 
  Loader2, 
  ArrowRight,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabaseClient";
import { resolveAssetSrc } from "@/lib/assets";

interface SavedVendor {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  location: {
    city?: string;
    country?: string;
  };
  price_range: string;
  verified: boolean;
  stats: {
    averageRating: number;
    reviewCount: number;
    saveCount: number;
  };
  cover_image: string | null;
  logo: string | null;
  saved_at: string;
}

export default function SavedVendorsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    async function checkAuthAndLoadVendors() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session || sessionError) {
          router.push(`/login?next=${encodeURIComponent("/vendors/saved")}`);
          return;
        }

        // Verify user exists in database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (userError || !userData) {
          router.push(`/login?next=${encodeURIComponent("/vendors/saved")}`);
          return;
        }

        // Load saved vendors
        await loadSavedVendors(session.access_token);
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push(`/login?next=${encodeURIComponent("/vendors/saved")}`);
      }
    }

    checkAuthAndLoadVendors();
  }, [router]);

  async function loadSavedVendors(token: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/users/saved-vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent("/vendors/saved")}`);
          return;
        }
        throw new Error("Failed to load saved vendors");
      }

      const data = await response.json();
      setSavedVendors(data.vendors || []);
    } catch (err: any) {
      console.error("Error loading saved vendors:", err);
      setError(err.message || "Failed to load saved vendors");
    } finally {
      setLoading(false);
    }
  }

  async function unsaveVendor(vendorId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/vendors/${vendorId}/save`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setSavedVendors((prev) => prev.filter((v) => v.id !== vendorId));
      }
    } catch (err) {
      console.error("Error unsaving vendor:", err);
    }
  }

  const filteredVendors = savedVendors.filter((vendor) => {
    const matchesSearch =
      searchQuery === "" ||
      vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.location.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      filterCategory === "All" || vendor.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(savedVendors.map((v) => v.category))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        <section className="pt-24 pb-8 px-6 lg:px-12 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-secondary mb-4">
              <span className="h-[1px] w-10 bg-accent" />
              My Vendors
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-primary mb-3">
              Saved Vendors
            </h1>
            <p className="text-secondary text-base font-light max-w-2xl">
              Your collection of favorite vendors. Compare, contact, and manage your saved vendors all in one place.
            </p>
          </div>
        </section>

        <section className="py-8 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Search saved vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 pl-11 pr-4 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-light"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filterCategory === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-secondary hover:text-primary border border-border"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filterCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-secondary hover:text-primary border border-border"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredVendors.length === 0 && (
              <div className="text-center py-24 bg-surface border border-border rounded-xl">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bookmark className="w-8 h-8 text-primary opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {savedVendors.length === 0
                      ? "No saved vendors yet"
                      : "No vendors match your filters"}
                  </h3>
                  <p className="text-secondary mb-6 leading-relaxed font-light">
                    {savedVendors.length === 0
                      ? "Start saving vendors you're interested in to see them here."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {savedVendors.length === 0 && (
                    <Link
                      href="/vendors/all"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Browse Vendors
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Vendor Grid */}
            {filteredVendors.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <Link href={`/vendors/${vendor.slug}`}>
                      <div className="relative aspect-4/3 overflow-hidden bg-surface">
                        <img
                          src={vendor.cover_image || resolveAssetSrc("/placeholder-vendor.jpg")}
                          alt={vendor.business_name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = resolveAssetSrc("/placeholder-vendor.jpg");
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              unsaveVendor(vendor.id);
                            }}
                            className="p-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors text-red-500"
                            aria-label="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/vendors/${vendor.slug}`}>
                        <h3 className="font-semibold text-lg text-primary mb-2 hover:underline line-clamp-1">
                          {vendor.business_name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-secondary mb-3">
                        <span>{vendor.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{vendor.location.city || "Tanzania"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold">
                            {vendor.stats.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-secondary">
                            ({vendor.stats.reviewCount})
                          </span>
                        </div>
                        <Link
                          href={`/vendors/${vendor.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors"
                        >
                          View
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
