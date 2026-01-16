"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { VendorImageGallery } from "@/components/vendors/VendorImageGallery";
import { VendorNavigationTabs, vendorNavigationTabs } from "@/components/vendors/VendorNavigationTabs";
import { VendorContent } from "@/components/vendors/VendorContent";
import { VendorBookingSidebar } from "@/components/vendors/VendorBookingSidebar";
import { VendorReviews } from "@/components/vendors/VendorReviews";
import { VendorLocation } from "@/components/vendors/VendorLocation";
import { VendorProfile } from "@/components/vendors/VendorProfile";
import { SimilarVendors } from "@/components/vendors/SimilarVendors";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import type { Vendor, PortfolioItem, Review, VendorAward } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";
import celebrationImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VendorDetailsClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarVendors, setSimilarVendors] = useState<Vendor[]>([]);
  const [awards, setAwards] = useState<VendorAward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showNavBar, setShowNavBar] = useState(false);
  const [isSidebarSticky, setIsSidebarSticky] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<"booking" | "details">("details");
  const [hasShownAuthGate, setHasShownAuthGate] = useState(false);
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const connectSectionRef = useRef<HTMLDivElement>(null);
  const ratingSectionRef = useRef<HTMLDivElement>(null);
  const authGateRef = useRef<HTMLDivElement>(null);

  // Load vendor data - PUBLIC, no authentication required initially
  useEffect(() => {
    async function loadVendor() {
      try {
        setIsLoading(true);
        setError(null);
        const resolvedParams = await params;
        const vendorSlug = resolvedParams.slug;
        setSlug(vendorSlug);

        // Fetch vendor data from API (will return teaser or full based on auth)
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        setIsAuthenticated(!!session);

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/vendors/by-slug/${vendorSlug}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Vendor not found");
          }
          throw new Error("Failed to load vendor");
        }

        const data = await response.json();
        setVendor(data.vendor);
        setIsLoading(false);

        // If authenticated, load additional data directly from Supabase
        if (session && data.vendor.id) {
          try {
            // Load portfolio
            const { data: portfolioData } = await supabase
              .from("portfolio")
              .select("*")
              .eq("vendor_id", data.vendor.id)
              .order("display_order", { ascending: true })
              .order("created_at", { ascending: false });
            if (portfolioData) setPortfolio(portfolioData as PortfolioItem[]);

            // Load reviews using RPC
            const { data: reviewsData } = await supabase.rpc("get_vendor_reviews_with_users", {
              vendor_id_param: data.vendor.id,
            });
            if (reviewsData) {
              setReviews(reviewsData.map((row: any) => ({
                id: row.id,
                vendor_id: row.vendor_id,
                user_id: row.user_id,
                rating: row.rating,
                title: row.title,
                content: row.content,
                images: row.images || [],
                event_type: row.event_type,
                event_date: row.event_date,
                verified: row.verified,
                helpful: row.helpful,
                vendor_response: row.vendor_response,
                vendor_responded_at: row.vendor_responded_at,
                created_at: row.created_at,
                updated_at: row.updated_at,
                user: {
                  name: row.user_name || "Anonymous",
                  avatar: row.user_avatar || null,
                },
              })) as Review[]);
            }

            // Load similar vendors
            const { data: similarData } = await supabase
              .from("vendors")
              .select("*")
              .eq("category", data.vendor.category)
              .eq("verified", true)
              .neq("id", data.vendor.id)
              .order("stats->averageRating", { ascending: false })
              .limit(6);
            if (similarData) setSimilarVendors(similarData as Vendor[]);

            // Load awards
            const { data: vendorData } = await supabase
              .from("vendors")
              .select("awards")
              .eq("id", data.vendor.id)
              .single();
            if (vendorData?.awards) {
              setAwards(vendorData.awards as VendorAward[]);
            }
          } catch (err) {
            console.error("Error loading vendor details:", err);
          }
        }
      } catch (err: any) {
        console.error("Error loading vendor:", err);
        setError(err.message || "Failed to load vendor");
      }
      setIsLoading(false);
    }

    loadVendor();
  }, [params, authRefreshKey]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setAuthRefreshKey((prev) => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const rating = vendor?.stats?.averageRating || 0;
  const reviewCount = Math.max(vendor?.stats?.reviewCount || 0, reviews.length);
  const locationText = vendor?.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}`
    : "Tanzania";

  const getStartingPrice = () => {
    if (!vendor) return "$500";
    if (vendor.price_range === "$") return "$200";
    if (vendor.price_range === "$$") return "$500";
    if (vendor.price_range === "$$$") return "$1,000";
    if (vendor.price_range === "$$$$") return "$2,500";
    return "$500";
  };

  const authGateStorageKey = slug ? `vendor_auth_gate_${slug}` : "vendor_auth_gate";

  const openAuthGate = (intent: "booking" | "details") => {
    setAuthModalIntent(intent);
    setAuthModalOpen(true);
    setHasShownAuthGate(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(authGateStorageKey, "true");
    }
  };

  const handleBookingIntent = () => {
    if (!isAuthenticated) {
      openAuthGate("booking");
      return;
    }
    const bookingTarget = document.getElementById("vendor-booking-sidebar");
    if (bookingTarget) {
      bookingTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAuthModalChange = (nextOpen: boolean) => {
    setAuthModalOpen(nextOpen);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(authGateStorageKey);
    if (stored === "true") {
      setHasShownAuthGate(true);
    }
  }, [authGateStorageKey]);

  useEffect(() => {
    const shouldOpenModal = searchParams.get("authModal") === "1";
    if (!shouldOpenModal || isAuthenticated) return;
    const intentParam = searchParams.get("authIntent");
    const intent = intentParam === "booking" ? "booking" : "details";
    openAuthGate(intent);
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (!vendor) return;

    const sectionIds = vendorNavigationTabs.map((tab) => tab.id);

    const handleScroll = () => {
      try {
        if (galleryRef.current) {
          const galleryBottom = galleryRef.current.getBoundingClientRect().bottom;
          setShowNavBar(galleryBottom < 0);
        }
        
        let ratingSection: HTMLElement | null = null;
        if (ratingSectionRef.current) {
          ratingSection = ratingSectionRef.current;
        } else {
          ratingSection = document.querySelector('[data-rating-section="true"]') as HTMLElement;
        }
        
        if (ratingSection) {
          const ratingSectionRect = ratingSection.getBoundingClientRect();
          const ratingSectionBottom = ratingSectionRect.bottom;
          const shouldBeSticky = ratingSectionBottom > 144;
          setIsSidebarSticky(shouldBeSticky);
        } else {
          if (connectSectionRef.current) {
            const connectSection = connectSectionRef.current.querySelector('[data-connect-section]') as HTMLElement;
            if (connectSection) {
              const connectSectionTop = connectSection.getBoundingClientRect().top;
              setIsSidebarSticky(connectSectionTop > 200);
            } else {
              setIsSidebarSticky(true);
            }
          } else {
            setIsSidebarSticky(true);
          }
        }

        const navOffset = 180;
        const viewportTop = window.scrollY + navOffset;
        const viewportBottom = window.scrollY + window.innerHeight;
        let activeSection = sectionIds[0];
        let maxVisibleHeight = -1;

        for (const id of sectionIds) {
          const element = document.getElementById(`section-${id}`);
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = rect.bottom + window.scrollY;
          const visibleTop = Math.max(elementTop, viewportTop);
          const visibleBottom = Math.min(elementBottom, viewportBottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          if (visibleHeight > maxVisibleHeight) {
            maxVisibleHeight = visibleHeight;
            activeSection = id;
          }
        }

        setActiveTab(activeSection);

        if (!isAuthenticated && !authModalOpen && !hasShownAuthGate && authGateRef.current) {
          const gateTop = authGateRef.current.getBoundingClientRect().top;
          if (gateTop <= 0) {
            openAuthGate("details");
          }
        }
      } catch (error) {
        console.error('Scroll handler error:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [vendor, isAuthenticated, authModalOpen, hasShownAuthGate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Loading vendor profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !vendor || !slug) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <Link href="/vendors/all">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
          <div className="text-center py-20">
            <div className="p-4 bg-destructive/10 rounded-2xl mb-4 inline-block">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-primary">Vendor Not Found</h3>
            <p className="text-destructive mb-6">{error || "Vendor not found"}</p>
            <Link href="/vendors/all">
              <Button>Browse All Vendors</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Vendor details
  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} sticky={false} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="pt-12 lg:pt-16 pb-24 lg:pb-0">
        {/* Sticky Navigation Bar */}
        {showNavBar && (
          <nav className="fixed top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-all">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
              <VendorNavigationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {!isSidebarSticky && (
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {getStartingPrice()}
                    </div>
                    <div className="text-xs text-secondary">per event</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 32 32"
                      className="w-4 h-4 fill-amber-500 text-amber-500"
                    >
                      <path d="m15.1 1.58-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.73-1.91 9.7a1 1 0 0 0 1.48 1.06L16 26.28l8.66 4.68a1 1 0 0 0 1.48-1.06l-1.91-9.7 7.3-6.73a1 1 0 0 0-.54-1.74l-9.86-1.27L16.9 1.58a1 1 0 0 0-1.8 0z"></path>
                    </svg>
                    <span className="text-base font-semibold">
                      {rating.toFixed(2)}
                    </span>
                    <span className="text-secondary">·</span>
                    <span className="text-sm text-secondary">
                      {reviewCount} reviews
                    </span>
                  </div>
                  <button
                    onClick={handleBookingIntent}
                    className="bg-primary text-background px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Request Quote
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Image Gallery */}
        <VendorImageGallery ref={galleryRef} vendor={vendor} portfolio={portfolio} />

        {/* Content Section */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content (Left) */}
            <div className="lg:col-span-2">
              <VendorContent
                ref={connectSectionRef}
                vendor={vendor}
                portfolio={portfolio}
                reviews={reviews}
                ratingSectionRef={ratingSectionRef}
                authGateRef={authGateRef}
                awards={awards}
              />
            </div>

            {/* Booking Sticky Sidebar (Right) */}
            <div className="hidden lg:block">
              <VendorBookingSidebar
                vendor={vendor}
                isSticky={isSidebarSticky}
                isAuthenticated={isAuthenticated}
                onAuthRequired={() => openAuthGate("booking")}
              />
            </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-6">
          <VendorReviews vendor={vendor} reviews={reviews} />
          <VendorLocation vendor={vendor} />
          <VendorProfile vendor={vendor} reviews={reviews} />
          
          <div className="pt-12 border-t border-border">
            <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-surface pb-6">
              <ShieldCheck className="w-5 h-5 text-foreground shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-sm text-foreground">
                  To help protect your payment, always use OpusFesta to send money and communicate with vendors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explore similar vendors */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-12">
          <SimilarVendors vendors={similarVendors} />
        </div>
      </main>

      <AuthGateModal
        open={authModalOpen}
        onOpenChange={handleAuthModalChange}
        intent={authModalIntent}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          setAuthRefreshKey((prev) => prev + 1);
        }}
      />

      <Footer />
    </div>
  );
}
