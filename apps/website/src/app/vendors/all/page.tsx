"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  ChevronDown,
  Eye,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { resolveAssetSrc } from "@/lib/assets";

import vendorPlanning from "@assets/stock_images/wedding_planning_che_871a1473.jpg";
import vendorFlorals from "@assets/stock_images/wedding_bouquet_mode_ab76e613.jpg";
import vendorPhoto from "@assets/stock_images/wedding_photographer_abdcbceb.jpg";
import vendorVenue from "@assets/stock_images/outdoor_garden_weddi_24d9a869.jpg";
import vendorCatering from "@assets/stock_images/luxury_wedding_table_da8d592c.jpg";
import vendorBeauty from "@assets/stock_images/wedding_dress_suit_r_bb9b914d.jpg";
import vendorMusic from "@assets/stock_images/wedding_reception_li_3a8fab49.jpg";
import vendorDecor from "@assets/stock_images/wedding_table_settin_c7e6dce8.jpg";
import vendorVenueTwo from "@assets/stock_images/elegant_wedding_venu_86ae752a.jpg";
import vendorVideo from "@assets/stock_images/happy_bride_and_groo_e2e2dc27.jpg";

const VENDORS = [
  {
    id: "zuri-lens",
    name: "Zuri Lens Collective",
    category: "Photography",
    location: "Zanzibar",
    price: "$$$",
    rating: 4.9,
    reviews: 128,
    image: vendorPhoto,
    tags: ["Editorial", "Golden hour", "Drone coverage"],
    featured: true,
    fastResponse: true,
  },
  {
    id: "kilimanjaro-films",
    name: "Kilimanjaro Films",
    category: "Videography",
    location: "Arusha",
    price: "$$$",
    rating: 4.8,
    reviews: 96,
    image: vendorVideo,
    tags: ["Drone", "Documentary", "Same-day edits"],
    featured: true,
    fastResponse: true,
  },
  {
    id: "amani-planning",
    name: "Amani Planning Studio",
    category: "Planning",
    location: "Dar es Salaam",
    price: "$$$",
    rating: 5.0,
    reviews: 88,
    image: vendorPlanning,
    tags: ["Full-service", "Guest care", "Timeline coordination"],
    featured: true,
    fastResponse: true,
  },
  {
    id: "coastal-florals",
    name: "Coastal Florals Studio",
    category: "Florals",
    location: "Zanzibar",
    price: "$$$",
    rating: 4.9,
    reviews: 74,
    image: vendorFlorals,
    tags: ["Installations", "Tropical blooms", "Custom arrangements"],
    featured: true,
    fastResponse: true,
  },
  {
    id: "ocean-bloom",
    name: "Ocean Bloom Florals",
    category: "Florals",
    location: "Zanzibar",
    price: "$$",
    rating: 4.9,
    reviews: 112,
    image: vendorFlorals,
    tags: ["Tropical", "Installations", "Sustainable"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "sunset-estate",
    name: "Sunset Estate",
    category: "Venues",
    location: "Zanzibar",
    price: "$$$$",
    rating: 4.7,
    reviews: 54,
    image: vendorVenue,
    tags: ["Beachfront", "Overnight stays", "Ocean view"],
    featured: false,
    fastResponse: false,
  },
  {
    id: "lush-table",
    name: "Lush Table Catering",
    category: "Catering",
    location: "Dar es Salaam",
    price: "$$$",
    rating: 4.8,
    reviews: 67,
    image: vendorCatering,
    tags: ["Swahili fusion", "Tasting menu", "Dietary options"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "serenity-bridal",
    name: "Serenity Bridal Beauty",
    category: "Beauty",
    location: "Mwanza",
    price: "$$",
    rating: 4.9,
    reviews: 140,
    image: vendorBeauty,
    tags: ["On-site team", "Trials included", "Airbrush makeup"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "sauti-events",
    name: "Sauti Events",
    category: "Music",
    location: "Dar es Salaam",
    price: "$$",
    rating: 4.6,
    reviews: 76,
    image: vendorMusic,
    tags: ["Live band", "Curated playlists", "MC services"],
    featured: false,
    fastResponse: false,
  },
  {
    id: "modern-muse",
    name: "Modern Muse Decor",
    category: "Decor",
    location: "Arusha",
    price: "$$$",
    rating: 4.8,
    reviews: 52,
    image: vendorDecor,
    tags: ["Lighting design", "Tablescapes", "Floral arch"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "baobab-pavilion",
    name: "Baobab Pavilion",
    category: "Venues",
    location: "Dar es Salaam",
    price: "$$$$",
    rating: 4.9,
    reviews: 39,
    image: vendorVenueTwo,
    tags: ["Ballroom", "Garden ceremony", "Indoor-outdoor"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "lavish-atelier",
    name: "Lavish Bridal Atelier",
    category: "Bridal shops",
    location: "Dar es Salaam",
    price: "$$",
    rating: 4.8,
    reviews: 34,
    image: vendorBeauty,
    tags: ["Custom fittings", "Designer gowns", "Alterations"],
    featured: false,
    fastResponse: true,
  },
  {
    id: "vow-keepers",
    name: "Vow Keepers",
    category: "Officiants",
    location: "Zanzibar",
    price: "$$",
    rating: 4.9,
    reviews: 22,
    image: vendorPlanning,
    tags: ["Personalized scripts", "Bilingual", "Interfaith"],
    featured: false,
    fastResponse: true,
  },
];

const SORT_OPTIONS = [
  { label: "Popular", value: "recommended" },
  { label: "Highest rated", value: "rating" },
  { label: "Most reviewed", value: "reviews" },
  { label: "Price: low to high", value: "priceAsc" },
  { label: "Price: high to low", value: "priceDesc" },
];

const PRICE_ORDER: Record<string, number> = {
  "$": 1,
  "$$": 2,
  "$$$": 3,
  "$$$$": 4,
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export default function AllVendorsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [activePrice, setActivePrice] = useState("Any budget");
  const [sortBy, setSortBy] = useState("recommended");

  const categories = useMemo(
    () => ["All", ...new Set(VENDORS.map((vendor) => vendor.category))],
    []
  );

  const locations = useMemo(
    () => ["All", ...new Set(VENDORS.map((vendor) => vendor.location))],
    []
  );

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return VENDORS.filter((vendor) => {
      const matchesQuery =
        query.length === 0 ||
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.location.toLowerCase().includes(query) ||
        vendor.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesCategory =
        activeCategory === "All" || vendor.category === activeCategory;
      const matchesLocation =
        activeLocation === "All" || vendor.location === activeLocation;
      const matchesPrice =
        activePrice === "Any budget" || vendor.price === activePrice;
      return matchesQuery && matchesCategory && matchesLocation && matchesPrice;
    });
  }, [searchQuery, activeCategory, activeLocation, activePrice]);

  const sortedVendors = useMemo(() => {
    const list = [...filteredVendors];
    switch (sortBy) {
      case "rating":
        return list.sort(
          (a, b) => b.rating - a.rating || b.reviews - a.reviews
        );
      case "reviews":
        return list.sort((a, b) => b.reviews - a.reviews);
      case "priceAsc":
        return list.sort(
          (a, b) => PRICE_ORDER[a.price] - PRICE_ORDER[b.price]
        );
      case "priceDesc":
        return list.sort(
          (a, b) => PRICE_ORDER[b.price] - PRICE_ORDER[a.price]
        );
      default:
        return list.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            b.rating - a.rating ||
            b.reviews - a.reviews
        );
    }
  }, [filteredVendors, sortBy]);

  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        <section className="pt-24 px-6 lg:px-12 xl:px-12 2xl:px-16 pb-6 border-b border-border">
          <div className="max-w-[1700px] mx-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                  <Search className="w-4 h-4 text-secondary" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search vendors, categories, locations..."
                    className="w-full bg-transparent text-sm text-primary placeholder:text-secondary focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-primary">
                    <ArrowUpDown className="h-3.5 w-3.5 text-secondary" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="appearance-none bg-transparent pr-6 text-xs font-semibold text-primary focus:outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-secondary pointer-events-none" />
                  </div>

                  <div className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-primary">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                    <select
                      value={activeLocation}
                      onChange={(event) => setActiveLocation(event.target.value)}
                      className="appearance-none bg-transparent pr-6 text-xs font-semibold text-primary focus:outline-none"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-secondary pointer-events-none" />
                  </div>

                  <div className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-primary">
                    <span className="text-[0.65rem] font-semibold text-secondary">
                      $
                    </span>
                    <select
                      value={activePrice}
                      onChange={(event) => setActivePrice(event.target.value)}
                      className="appearance-none bg-transparent pr-6 text-xs font-semibold text-primary focus:outline-none"
                    >
                      <option value="Any budget">Any budget</option>
                      <option value="$">Budget</option>
                      <option value="$$">Moderate</option>
                      <option value="$$$">Premium</option>
                      <option value="$$$$">Luxury</option>
                    </select>
                    <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          activeCategory === category
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-background text-secondary hover:text-primary"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-secondary">
                  {sortedVendors.length} vendors available
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 xl:px-12 2xl:px-16 pt-10 pb-20">
          <div className="max-w-[1700px] mx-auto">
            {sortedVendors.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-12 text-center text-secondary">
                No vendors match your filters yet. Try a different city or category.
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3">
                {sortedVendors.map((vendor, index) => {
                  const isRightEdge = index === sortedVendors.length - 1;
                  return (
                    <div key={vendor.id}>
                      <Link
                        href={`/vendors/${generateSlug(vendor.name)}`}
                        className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block"
                      >
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                          <img
                            src={resolveAssetSrc(vendor.image)}
                            alt={vendor.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                          />
                          {vendor.featured && (
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-indigo-500 text-background text-[0.6rem] font-semibold">
                              <Sparkles className="w-2.5 h-2.5" />
                              Featured
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <h4 className="text-background font-bold text-base line-clamp-2">
                                  {vendor.category}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
                                  onClick={(event) => event.preventDefault()}
                                >
                                  <Heart className="w-4 h-4 text-primary" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
                                  onClick={(event) => event.preventDefault()}
                                >
                                  <Bookmark className="w-4 h-4 text-primary" />
                                </button>
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
                                        onClick={(event) =>
                                          event.preventDefault()
                                        }
                                      >
                                        Follow
                                      </button>
                                      <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                        onClick={(event) =>
                                          event.preventDefault()
                                        }
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
