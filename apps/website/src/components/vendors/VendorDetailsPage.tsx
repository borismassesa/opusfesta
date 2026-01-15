"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { VendorImageGallery } from "./VendorImageGallery";
import { VendorNavigationTabs, vendorNavigationTabs } from "./VendorNavigationTabs";
import { VendorContent } from "./VendorContent";
import { VendorBookingSidebar } from "./VendorBookingSidebar";
import { VendorReviews } from "./VendorReviews";
import { VendorLocation } from "./VendorLocation";
import { VendorProfile } from "./VendorProfile";
import { SimilarVendors } from "./SimilarVendors";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import type { Vendor, PortfolioItem, Review, VendorAward } from "@/lib/supabase/vendors";
import { resolveAssetSrc } from "@/lib/assets";
import celebrationImg from "@assets/stock_images/happy_wedding_couple_e3561dd1.jpg";
import { supabase } from "@/lib/supabaseClient";

interface VendorDetailsPageProps {
  vendor: Vendor;
  portfolio: PortfolioItem[];
  reviews: Review[];
  similarVendors: Vendor[];
  awards: VendorAward[];
}

export function VendorDetailsPage({
  vendor,
  portfolio,
  reviews,
  similarVendors,
  awards,
}: VendorDetailsPageProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showNavBar, setShowNavBar] = useState(false);
  const [isSidebarSticky, setIsSidebarSticky] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<"booking" | "details">("details");
  const [hasShownAuthGate, setHasShownAuthGate] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const connectSectionRef = useRef<HTMLDivElement>(null);
  const ratingSectionRef = useRef<HTMLDivElement>(null);
  const authGateRef = useRef<HTMLDivElement>(null);
  const rating = vendor.stats.averageRating || 0;
  const reviewCount = Math.max(vendor.stats.reviewCount || 0, reviews.length);
  const locationText = vendor.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}`
    : "Tanzania";

  // Check authentication on mount and on auth changes
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Verify user exists in the database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          if (userError || !userData) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getStartingPrice = () => {
    if (vendor.price_range === "$") return "$200";
    if (vendor.price_range === "$$") return "$500";
    if (vendor.price_range === "$$$") return "$1,000";
    if (vendor.price_range === "$$$$") return "$2,500";
    return "$500";
  };

  const authGateStorageKey = `vendor_auth_gate_${vendor.id}`;

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(authGateStorageKey);
    if (stored === "true") {
      setHasShownAuthGate(true);
    }
  }, [authGateStorageKey]);

  useEffect(() => {
    if (isAuthenticated) return;
    if (hasShownAuthGate) return;

    const target = authGateRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !authModalOpen && !hasShownAuthGate) {
          openAuthGate("details");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [authModalOpen, hasShownAuthGate, isAuthenticated]);

  useEffect(() => {
    const sectionIds = vendorNavigationTabs.map((tab) => tab.id);

    const handleScroll = () => {
      try {
        if (galleryRef.current) {
          const galleryBottom = galleryRef.current.getBoundingClientRect().bottom;
          // Show nav bar when gallery has been scrolled past (with a small offset)
          setShowNavBar(galleryBottom < 0);
        }
        
        // Check if rating section has been scrolled past
        // First try to find it by ref, then fallback to data attribute
        let ratingSection: HTMLElement | null = null;
        if (ratingSectionRef.current) {
          ratingSection = ratingSectionRef.current;
        } else {
          // Fallback: find by data attribute
          ratingSection = document.querySelector('[data-rating-section="true"]') as HTMLElement;
        }
        
        if (ratingSection) {
          const ratingSectionRect = ratingSection.getBoundingClientRect();
          const ratingSectionBottom = ratingSectionRect.bottom;
          // Make sidebar non-sticky when rating section has completely scrolled past
          // The sidebar sticky top is at 144px (top-36 = 9rem = 144px)
          // When rating section bottom is <= 144px, the entire section has scrolled past the sticky position
          const shouldBeSticky = ratingSectionBottom > 144;
          setIsSidebarSticky(shouldBeSticky);
        } else {
          // If rating section doesn't exist, check connect section as fallback
          if (connectSectionRef.current) {
            // Look for the Connect section within the VendorInfo container
            const connectSection = connectSectionRef.current.querySelector('[data-connect-section]') as HTMLElement;
            
            if (connectSection) {
              const connectSectionTop = connectSection.getBoundingClientRect().top;
              // Make sidebar non-sticky when connect section reaches or passes the top of viewport
              // Add a small offset to account for the sticky top position
              setIsSidebarSticky(connectSectionTop > 200);
            } else {
              // If no connect section exists, keep sidebar sticky
              setIsSidebarSticky(true);
            }
          } else {
            // If VendorInfo container doesn't exist, keep sidebar sticky
            setIsSidebarSticky(true);
          }
        }

        // Update active tab based on scroll position.
        // Use the last section whose top is above the sticky nav offset.
        const navOffset = 180;
        const viewportTop = window.scrollY + navOffset;
        const viewportBottom = window.scrollY + window.innerHeight;
        let activeSection = sectionIds[0];
        let maxVisibleHeight = -1;

        for (const id of sectionIds) {
          const element = document.getElementById(`section-${id}`);
          if (!element) {
            continue;
          }
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
      } catch (error) {
        // Silently handle any errors
        console.error('Scroll handler error:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Check on mount in case page is already scrolled
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="bg-background text-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} sticky={false} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="pt-12 lg:pt-16 pb-24 lg:pb-0">
        {/* Sticky Navigation Bar - Appears when gallery is scrolled past */}
        {showNavBar && (
          <nav className="fixed top-0 w-full z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-all">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
              <VendorNavigationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Pricing/Rating/Request Quote - Only show when sidebar is NOT sticky */}
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

        {/* Full Width Sections (After Info Section) */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-6">
          <VendorReviews vendor={vendor} reviews={reviews} />
          <VendorLocation vendor={vendor} />
          <VendorProfile vendor={vendor} reviews={reviews} />
          
          {/* Payment Protection - Independent Section */}
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
          <SimilarVendors
            vendors={similarVendors}
            title={`Explore more ${vendor.category} vendors near ${locationText}`}
            subtitle={`More ${vendor.category} teams couples are booking in ${locationText}.`}
          />
        </div>

        {/* OpusFesta CTA Banner */}
        <div className="bg-surface/70 py-16 px-6 mt-12">
          <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center bg-background rounded-3xl overflow-hidden border border-border shadow-sm">
            <div className="p-10 lg:p-12 lg:w-1/2 space-y-5">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Plan every detail with OpusFesta
              </h2>
              <p className="text-lg text-secondary">
                Build your vendor short list, track quotes, and keep your
                timeline on one beautiful workspace.
              </p>
              <button className="bg-primary text-background px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Start planning
              </button>
            </div>
            <div className="lg:w-1/2 w-full h-full min-h-[320px] relative">
              <Image
                src={resolveAssetSrc(celebrationImg)}
                alt="OpusFesta wedding planning"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Persistent Mobile Reserve Bar - Only show when sidebar is NOT sticky */}
        {!isSidebarSticky && (
          <div className="lg:hidden fixed bottom-0 w-full bg-background border-t border-border px-6 py-4 flex items-center justify-between z-50">
            <div>
              <div className="font-bold text-lg">
                {getStartingPrice()}
              </div>
              <div className="text-sm underline">per event</div>
            </div>
            <button
              onClick={handleBookingIntent}
              className="bg-primary text-background px-8 py-3 rounded-lg font-bold"
            >
              Request Quote
            </button>
          </div>
        )}
      </main>

      <AuthGateModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        intent={authModalIntent}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
        }}
      />

      <Footer />
    </div>
  );
}
