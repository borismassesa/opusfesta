"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Building,
  Camera,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Flower2,
  Heart,
  MapPin,
  Music,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";
import { resolveAssetSrc } from "@/lib/assets";

import heroMain from "@assets/stock_images/elegant_wedding_venu_86ae752a.jpg";
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

const STATS = [
  { label: "Vetted vendors", value: "15k+" },
  { label: "Cities covered", value: "120+" },
  { label: "Average rating", value: "4.9/5" },
];

const PROMOTIONS = [
  {
    id: "promo-1",
    label: "Exclusive discount",
    title: "10% off curated catering menus",
    vendor: "Lush Table Catering",
    rating: 5.0,
    reviews: 42,
    category: "Catering",
    location: "Dar es Salaam",
    image: vendorCatering,
  },
  {
    id: "promo-2",
    label: "Limited offer",
    title: "Complimentary bridal film add-on",
    vendor: "Kilimanjaro Films",
    rating: 4.9,
    reviews: 31,
    category: "Videography",
    location: "Arusha",
    image: vendorVideo,
  },
  {
    id: "promo-3",
    label: "Seasonal deal",
    title: "Venue styling package included",
    vendor: "Sunset Estate",
    rating: 4.7,
    reviews: 18,
    category: "Venues",
    location: "Zanzibar",
    image: vendorVenue,
  },
  {
    id: "promo-4",
    label: "Offer",
    title: "Live band + DJ bundle",
    vendor: "Sauti Events",
    rating: 4.8,
    reviews: 27,
    category: "Music",
    location: "Dar es Salaam",
    image: vendorMusic,
  },
  {
    id: "promo-5",
    label: "Special package",
    title: "Bridal bouquet + ceremony arch",
    vendor: "Coastal Florals Studio",
    rating: 4.9,
    reviews: 52,
    category: "Florals",
    location: "Zanzibar",
    image: vendorFlorals,
  },
];

const NEW_VENDORS = [
  {
    id: "new-1",
    name: "Elegant Affairs Tanzania",
    category: "Wedding Planning",
    location: "Dar es Salaam",
    rating: 4.8,
    reviews: 8,
    image: vendorPlanning,
  },
  {
    id: "new-2",
    name: "Sunset Beach Photography",
    category: "Photography",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 12,
    image: vendorPhoto,
  },
  {
    id: "new-3",
    name: "Glamour Beauty Studio",
    category: "Beauty & Makeup",
    location: "Arusha",
    rating: 4.7,
    reviews: 6,
    image: vendorBeauty,
  },
  {
    id: "new-4",
    name: "Divine Decorations",
    category: "Decor",
    location: "Mwanza",
    rating: 4.8,
    reviews: 10,
    image: vendorDecor,
  },
  {
    id: "new-5",
    name: "Harmony Music Events",
    category: "Music",
    location: "Dar es Salaam",
    rating: 4.9,
    reviews: 15,
    image: vendorMusic,
  },
];

const MOST_BOOKED = [
  {
    id: "booked-1",
    name: "Coastal Florals Studio",
    category: "Florals",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 156,
    image: vendorFlorals,
  },
  {
    id: "booked-2",
    name: "Kilimanjaro Films",
    category: "Videography",
    location: "Arusha",
    rating: 4.9,
    reviews: 143,
    image: vendorVideo,
  },
  {
    id: "booked-3",
    name: "Sauti Events",
    category: "Music",
    location: "Dar es Salaam",
    rating: 4.8,
    reviews: 127,
    image: vendorMusic,
  },
  {
    id: "booked-4",
    name: "Lush Table Catering",
    category: "Catering",
    location: "Dar es Salaam",
    rating: 5.0,
    reviews: 142,
    image: vendorCatering,
  },
  {
    id: "booked-5",
    name: "Sunset Estate",
    category: "Venues",
    location: "Zanzibar",
    rating: 4.7,
    reviews: 118,
    image: vendorVenue,
  },
];

const BUDGET_FRIENDLY = [
  {
    id: "budget-1",
    name: "Simple Elegance Decor",
    category: "Decor",
    location: "Mwanza",
    rating: 4.7,
    reviews: 89,
    image: vendorDecor,
  },
  {
    id: "budget-2",
    name: "Affordable Events TZ",
    category: "Wedding Planning",
    location: "Dar es Salaam",
    rating: 4.8,
    reviews: 94,
    image: vendorPlanning,
  },
  {
    id: "budget-3",
    name: "Natural Beauty Studio",
    category: "Beauty & Makeup",
    location: "Arusha",
    rating: 4.6,
    reviews: 76,
    image: vendorBeauty,
  },
  {
    id: "budget-4",
    name: "Garden Blooms",
    category: "Florals",
    location: "Dodoma",
    rating: 4.7,
    reviews: 82,
    image: vendorFlorals,
  },
  {
    id: "budget-5",
    name: "Moment Capture Photos",
    category: "Photography",
    location: "Mwanza",
    rating: 4.8,
    reviews: 91,
    image: vendorPhoto,
  },
];

const QUICK_RESPONDERS = [
  {
    id: "quick-1",
    name: "Swift Events Co",
    category: "Wedding Planning",
    location: "Dar es Salaam",
    rating: 4.9,
    reviews: 124,
    image: vendorPlanning,
  },
  {
    id: "quick-2",
    name: "Instant Catering Services",
    category: "Catering",
    location: "Zanzibar",
    rating: 4.8,
    reviews: 108,
    image: vendorCatering,
  },
  {
    id: "quick-3",
    name: "Ready Cam Studios",
    category: "Videography",
    location: "Arusha",
    rating: 4.9,
    reviews: 115,
    image: vendorVideo,
  },
  {
    id: "quick-4",
    name: "Express Florals",
    category: "Florals",
    location: "Dar es Salaam",
    rating: 4.7,
    reviews: 98,
    image: vendorFlorals,
  },
  {
    id: "quick-5",
    name: "Fast Response Venues",
    category: "Venues",
    location: "Mwanza",
    rating: 4.8,
    reviews: 103,
    image: vendorVenue,
  },
];

const REGIONAL_SPOTLIGHT = {
  region: "Zanzibar",
  description: "Island paradise with stunning beachfront venues and ocean views",
  vendors: [
    {
      id: "region-1",
      name: "Zanzibar Beach Weddings",
      category: "Wedding Planning",
      location: "Zanzibar",
      rating: 4.9,
      reviews: 87,
      image: vendorPlanning,
    },
    {
      id: "region-2",
      name: "Ocean View Venues",
      category: "Venues",
      location: "Zanzibar",
      rating: 4.8,
      reviews: 102,
      image: vendorVenue,
    },
    {
      id: "region-3",
      name: "Island Blooms Florals",
      category: "Florals",
      location: "Zanzibar",
      rating: 4.9,
      reviews: 78,
      image: vendorFlorals,
    },
    {
      id: "region-4",
      name: "Sunset Photography ZNZ",
      category: "Photography",
      location: "Zanzibar",
      rating: 5.0,
      reviews: 94,
      image: vendorPhoto,
    },
    {
      id: "region-5",
      name: "Spice Island Catering",
      category: "Catering",
      location: "Zanzibar",
      rating: 4.8,
      reviews: 86,
      image: vendorCatering,
    },
  ],
};

const AREA_HIGHLIGHTS = [
  { id: "area-1", name: "Zanzibar", count: "214 vendors" },
  { id: "area-2", name: "Dar es Salaam", count: "186 vendors" },
  { id: "area-3", name: "Arusha", count: "94 vendors" },
  { id: "area-4", name: "Mwanza", count: "63 vendors" },
  { id: "area-5", name: "Dodoma", count: "41 vendors" },
  { id: "area-6", name: "Bagamoyo", count: "37 vendors" },
];

const VENDOR_TAGS = [
  { label: "All vendors", category: "All" },
  { label: "Wedding planning", category: "Planning" },
  { label: "Venues", category: "Venues" },
  { label: "Photography", category: "Photography" },
  { label: "Videography", category: "Videography" },
  { label: "Catering", category: "Catering" },
  { label: "Florals", category: "Florals" },
  { label: "Music & DJs", category: "Music" },
  { label: "Beauty", category: "Beauty" },
  { label: "Bridal shops", category: "Bridal shops" },
  { label: "Officiants", category: "Officiants" },
  { label: "Decor & rentals", category: "Decor" },
];

const VENDOR_ROW_SECTIONS = [
  {
    id: "planners",
    title: "Wedding planners",
    description:
      "Full-service planners and day-of coordinators to run the timeline flawlessly.",
    items: [
      {
        id: "amani-planning-row",
        name: "Amani Planning Studio",
        location: "Dar es Salaam",
        rating: 5.0,
        reviews: 88,
        image: vendorPlanning,
        deal: "Full-service",
      },
      {
        id: "safari-day-of",
        name: "Safari Day-of Co.",
        location: "Zanzibar",
        rating: 4.8,
        reviews: 41,
        image: vendorVenue,
        deal: "Month-of",
      },
      {
        id: "maple-events",
        name: "Maple Events",
        location: "Arusha",
        rating: 4.9,
        reviews: 29,
        image: vendorCatering,
      },
      {
        id: "ocean-aisle",
        name: "Ocean Aisle Collective",
        location: "Mwanza",
        rating: 4.7,
        reviews: 22,
        image: vendorFlorals,
      },
    ],
  },
  {
    id: "venues",
    title: "Venues",
    description:
      "Beachfront estates, gardens, and intimate resorts for every guest list.",
    items: [
      {
        id: "sunset-estate-row",
        name: "Sunset Estate",
        location: "Zanzibar",
        rating: 4.7,
        reviews: 54,
        image: vendorVenue,
        deal: "Open dates",
      },
      {
        id: "baobab-pavilion-row",
        name: "Baobab Pavilion",
        location: "Dar es Salaam",
        rating: 4.9,
        reviews: 39,
        image: vendorVenueTwo,
      },
      {
        id: "coral-grove",
        name: "Coral Grove",
        location: "Arusha",
        rating: 4.8,
        reviews: 28,
        image: vendorDecor,
      },
      {
        id: "mila-gardens",
        name: "Mila Gardens",
        location: "Mwanza",
        rating: 4.7,
        reviews: 17,
        image: vendorFlorals,
      },
    ],
  },
  {
    id: "photographers",
    title: "Photographers",
    description:
      "Capture the day from every angle with photo teams couples love.",
    items: [
      {
        id: "love-speaks",
        name: "Love Speaks",
        location: "Zanzibar",
        rating: 5.0,
        reviews: 19,
        image: vendorPhoto,
        deal: "1 deal",
      },
      {
        id: "amani-lens",
        name: "Amani Lens",
        location: "Dar es Salaam",
        rating: 4.8,
        reviews: 36,
        image: vendorVenue,
        deal: "5% off",
      },
      {
        id: "coastal-film",
        name: "Coastal Film House",
        location: "Arusha",
        rating: 4.9,
        reviews: 22,
        image: vendorVideo,
      },
      {
        id: "storyline",
        name: "Storyline Studios",
        location: "Mwanza",
        rating: 4.7,
        reviews: 18,
        image: vendorDecor,
      },
    ],
  },
  {
    id: "beauty",
    title: "Beauty salons",
    description:
      "Makeup artists, hair stylists, and on-site teams for the full party.",
    items: [
      {
        id: "blush-society",
        name: "The Blush Society",
        location: "Dar es Salaam",
        rating: 4.8,
        reviews: 65,
        image: vendorBeauty,
        deal: "1 deal",
      },
      {
        id: "imn-beauty",
        name: "IMN Beauty Co.",
        location: "Zanzibar",
        rating: 5.0,
        reviews: 31,
        image: vendorFlorals,
      },
      {
        id: "la-rose",
        name: "La Rose Bridal",
        location: "Arusha",
        rating: 4.7,
        reviews: 26,
        image: vendorPlanning,
        deal: "Trial included",
      },
      {
        id: "borlase",
        name: "Borlase Beauty",
        location: "Mwanza",
        rating: 4.9,
        reviews: 18,
        image: vendorVenueTwo,
      },
    ],
  },
  {
    id: "bridal-shops",
    title: "Bridal shops",
    description:
      "Boutiques and bridal studios with dresses, fittings, and tailoring.",
    items: [
      {
        id: "creme-couture",
        name: "Crème Couture",
        location: "Dar es Salaam",
        rating: 4.9,
        reviews: 81,
        image: vendorDecor,
        deal: "2 deals",
      },
      {
        id: "baba-boutique",
        name: "Baba Bridal Boutique",
        location: "Zanzibar",
        rating: 4.8,
        reviews: 29,
        image: vendorFlorals,
      },
      {
        id: "lavish-atelier-row",
        name: "Lavish Atelier",
        location: "Arusha",
        rating: 4.7,
        reviews: 22,
        image: vendorVenueTwo,
        deal: "10% off",
      },
      {
        id: "mila-bridal",
        name: "Mila Bridal House",
        location: "Mwanza",
        rating: 4.9,
        reviews: 17,
        image: vendorBeauty,
      },
    ],
  },
  {
    id: "officiants",
    title: "Officiants",
    description:
      "Professional officiants who personalize every ceremony with care.",
    items: [
      {
        id: "ever-after",
        name: "Ever After Officiant",
        location: "Dar es Salaam",
        rating: 5.0,
        reviews: 46,
        image: vendorVenue,
        deal: "1 deal",
      },
      {
        id: "love-rite",
        name: "Love Rite Ceremonies",
        location: "Zanzibar",
        rating: 4.8,
        reviews: 19,
        image: vendorPlanning,
      },
      {
        id: "neolex",
        name: "Néolex Notaire",
        location: "Arusha",
        rating: 5.0,
        reviews: 11,
        image: vendorVideo,
      },
      {
        id: "vow-keepers-row",
        name: "Vow Keepers",
        location: "Mwanza",
        rating: 4.9,
        reviews: 24,
        image: vendorCatering,
      },
    ],
  },
];

const CATEGORIES = [
  {
    id: "Planning",
    label: "Planning",
    count: "80+",
    description: "Full-service and day-of coordination.",
    icon: Calendar,
    image: vendorPlanning,
  },
  {
    id: "Venues",
    label: "Venues",
    count: "60+",
    description: "Beachfront, garden, and ballroom.",
    icon: Building,
    image: vendorVenue,
  },
  {
    id: "Photography",
    label: "Photography",
    count: "240+",
    description: "Editorial and documentary coverage.",
    icon: Camera,
    image: vendorPhoto,
  },
  {
    id: "Videography",
    label: "Videography",
    count: "130+",
    description: "Cinematic films with drone options.",
    icon: Video,
    image: vendorVideo,
  },
  {
    id: "Catering",
    label: "Catering",
    count: "110+",
    description: "Modern menus and tastings.",
    icon: ChefHat,
    image: vendorCatering,
  },
  {
    id: "Florals",
    label: "Florals",
    count: "95+",
    description: "Bouquets and large-scale installations.",
    icon: Flower2,
    image: vendorFlorals,
  },
  {
    id: "Music",
    label: "Music",
    count: "75+",
    description: "Live bands, DJs, and curators.",
    icon: Music,
    image: vendorMusic,
  },
  {
    id: "Beauty",
    label: "Beauty",
    count: "140+",
    description: "Hair, makeup, and wellness teams.",
    icon: Sparkles,
    image: vendorBeauty,
  },
  {
    id: "Bridal shops",
    label: "Bridal shops",
    count: "55+",
    description: "Dresses, fittings, and tailoring.",
    icon: Sparkles,
    image: vendorBeauty,
  },
  {
    id: "Officiants",
    label: "Officiants",
    count: "40+",
    description: "Personalized ceremonies with heart.",
    icon: Heart,
    image: vendorPlanning,
  },
  {
    id: "Decor",
    label: "Decor",
    count: "90+",
    description: "Lighting, tablescapes, and styling.",
    icon: Palette,
    image: vendorDecor,
  },
];

// Helper function to generate slug from vendor name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

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
    recentBookings: 5,
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
    recentBookings: 3,
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
    recentBookings: 7,
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
    recentBookings: 4,
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
    recentBookings: 6,
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
    recentBookings: 2,
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
    recentBookings: 4,
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
    recentBookings: 8,
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
    recentBookings: 3,
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
    recentBookings: 3,
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
    recentBookings: 2,
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
    recentBookings: 5,
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
    recentBookings: 4,
  },
];

const LOCATIONS = ["All", "Dar es Salaam", "Zanzibar", "Arusha", "Mwanza"];
const PRICE_FILTERS = ["Any budget", "$", "$$", "$$$", "$$$$"];

// Helper function to format price tiers to Tanzanian Shilling display
const formatPriceDisplay = (priceCode: string): string => {
  const priceMap: Record<string, string> = {
    "$": "Budget",
    "$$": "Moderate",
    "$$$": "Premium",
    "$$$$": "Luxury"
  };
  return priceMap[priceCode] || priceCode;
};

const TRUST_POINTS = [
  {
    title: "Verified pros only",
    description: "Every vendor is vetted for quality, responsiveness, and on-time delivery.",
    icon: ShieldCheck,
  },
  {
    title: "Fast replies",
    description: "We track response times so you can book with confidence.",
    icon: Clock,
  },
  {
    title: "Couples-first support",
    description: "Our concierge team helps you compare, shortlist, and plan.",
    icon: Users,
  },
];

const STEPS = [
  {
    title: "Tell us your date and vision",
    description: "Share your location, vibe, and guest count in minutes.",
  },
  {
    title: "Compare curated vendors",
    description: "Explore portfolios, packages, and verified reviews.",
  },
  {
    title: "Book with confidence",
    description: "Secure your team with clear pricing and expert support.",
  },
];

export default function VendorsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [priceFilter, setPriceFilter] = useState("Any budget");
  const pageRef = useRef<HTMLDivElement>(null);
  const categoryRowRef = useRef<HTMLDivElement>(null);
  const promotionsRowRef = useRef<HTMLDivElement>(null);
  const areasRowRef = useRef<HTMLDivElement>(null);
  const vendorRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const featuredVendors = useMemo(
    () => VENDORS.filter((vendor) => vendor.featured),
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
        priceFilter === "Any budget" || vendor.price === priceFilter;
      return matchesQuery && matchesCategory && matchesLocation && matchesPrice;
    });
  }, [searchQuery, activeCategory, activeLocation, priceFilter]);

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoryRowRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollPromotions = (direction: "left" | "right") => {
    const container = promotionsRowRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollAreas = (direction: "left" | "right") => {
    const container = areasRowRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollVendorRow = (id: string, direction: "left" | "right") => {
    const container = vendorRowRefs.current[id];
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = categoryRowRef.current;
    if (!container) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let hasInteracted = false;

    const scrollOnce = () => {
      if (hasInteracted) return;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 0) return;
      const nextLeft =
        container.scrollLeft >= maxScrollLeft - 2 ? 0 : container.scrollLeft + container.clientWidth * 0.75;
      container.scrollTo({ left: nextLeft, behavior: "smooth" });
    };

    const stopAutoScroll = () => {
      hasInteracted = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    intervalId = setInterval(scrollOnce, 3500);
    container.addEventListener("pointerdown", stopAutoScroll);
    container.addEventListener("wheel", stopAutoScroll, { passive: true });
    container.addEventListener("touchstart", stopAutoScroll, { passive: true });

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      container.removeEventListener("pointerdown", stopAutoScroll);
      container.removeEventListener("wheel", stopAutoScroll);
      container.removeEventListener("touchstart", stopAutoScroll);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="bg-background text-primary min-h-screen overflow-hidden"
    >
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main>
        <section className="relative pt-20 pb-8 px-6 lg:pl-12 lg:pr-0 border-b border-border">
          <div className="max-w-[1300px] mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
            <div>
              <nav className="vendors-hero-eyebrow flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-secondary">
                <Link href="/" className="hover:text-primary transition-colors">
                  Weddings
                </Link>
                <span className="text-secondary">/</span>
                <span className="text-primary">Wedding Vendors</span>
              </nav>
              <h1 className="vendors-hero-title mt-5 text-3xl md:text-4xl lg:text-4xl font-semibold leading-[1.05]">
                Wedding vendors
              </h1>
              <p className="vendors-hero-subtitle mt-3 text-base md:text-lg text-secondary leading-relaxed max-w-xl">
                Discover photographers, planners, venues, and more in one
                curated marketplace.
              </p>

              <div className="vendors-hero-actions mt-6">
                <div className="flex flex-col sm:flex-row bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 flex-1">
                    <Search className="w-4 h-4 text-secondary" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Wedding vendors"
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
                      {LOCATIONS.map((location) => (
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
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-primary">
                      {stat.value}
                    </span>
                    <span className="text-xs">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vendors-hero-media relative lg:w-[calc(100%+(100vw-1300px)/2)]">
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

        <section className="py-16 px-6 lg:px-12 border-t border-border">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  Explore categories
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold mt-4">
                  Explore wedding vendors by category.
                </h2>
                <p className="text-secondary mt-3 max-w-2xl">
                  Photographers, florists, planners, and more with portfolios
                  you can browse instantly.
                </p>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                Browse all categories
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {CATEGORIES.slice(0, 10).map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      aria-pressed={isActive}
                      className="category-card group text-left transition-transform duration-300 hover:-translate-y-1"
                    >
                    <div
                        className={`relative h-44 rounded-3xl overflow-hidden border ${
                          isActive ? "border-primary" : "border-border"
                        }`}
                      >
                        <img
                          src={resolveAssetSrc(category.image)}
                          alt={category.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-primary">
                          {category.label}
                        </h3>
                        <div className="text-sm text-secondary mt-1">
                          {category.count} vendors
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
          </div>
        </section>

        <section className="py-14 px-6 lg:px-12 border-t border-border bg-surface/20">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  Promotions
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  Promotions you might be interested in.
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                Explore all deals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div
                ref={promotionsRowRef}
                className="promotions-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
              >
                {PROMOTIONS.map((promo, index) => {
                  const isRightEdge = index === PROMOTIONS.length - 1;
                  return (
                  <div key={promo.id}>
                    <Link
                      href={`/vendors/${generateSlug(promo.vendor)}`}
                      className="promo-card group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block"
                    >
                      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                        <img
                          src={resolveAssetSrc(promo.image)}
                          alt={promo.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                        />
                        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500 text-background text-[0.6rem] font-semibold">
                          <Sparkles className="w-2.5 h-2.5" />
                          {promo.label}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <h4 className="text-background font-bold text-base line-clamp-2">
                                {promo.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
                                onClick={(e) => e.preventDefault()}
                                aria-label="Like"
                              >
                                <Heart className="w-4 h-4 text-primary" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
                                onClick={(e) => e.preventDefault()}
                                aria-label="Save"
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
                              {promo.vendor.charAt(0)}
                            </div>
                            {/* Rich hover card */}
                            <div
                              className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                                isRightEdge ? "right-0" : "left-[-10px]"
                              }`}
                            >
                              <div className="p-5">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
                                    <span className="text-lg font-bold text-primary">
                                      {promo.vendor.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-primary mb-0.5 truncate">
                                      {promo.category}
                                    </h4>
                                    <p className="text-[0.65rem] text-secondary mb-1">
                                      {promo.location}, Tanzania
                                    </p>
                                    <div className="flex items-center gap-2 text-[0.65rem]">
                                      <div className="flex items-center gap-0.5 font-semibold">
                                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                        {promo.rating}
                                      </div>
                                      <span className="text-secondary">({promo.reviews})</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      Follow
                                    </button>
                                    <button
                                      type="button"
                                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      Contact
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                    <img
                                      src={resolveAssetSrc(promo.image)}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                    <img
                                      src={resolveAssetSrc(promo.image)}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="aspect-4/3 overflow-hidden rounded-lg bg-surface">
                                    <img
                                      src={resolveAssetSrc(promo.image)}
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
                            {promo.vendor}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold shrink-0">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {promo.rating}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3 text-secondary" />
                            {promo.reviews}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
          </div>
        </section>

        {/* New Vendors Section */}
        <section className="py-14 px-6 lg:px-12 border-t border-border bg-background">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  New vendors
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  Talented teams who recently joined our marketplace.
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                View all new vendors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {NEW_VENDORS.map((vendor, index) => {
                const isRightEdge = index === NEW_VENDORS.length - 1;
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
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-blue-500 text-background text-[0.6rem] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        New
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-background font-bold text-base line-clamp-2">
                              {vendor.category}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
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
                          {/* Rich hover card */}
                          <div
                            className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                              isRightEdge ? "right-0" : "left-[-10px]"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
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
                                    <span className="text-secondary">({vendor.reviews})</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Follow
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                    onClick={(e) => e.preventDefault()}
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
                        <span className="text-xs font-medium text-secondary">{vendor.name}</span>
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
          </div>
        </section>

        {/* Most Booked Section */}
        <section className="py-14 px-6 lg:px-12 border-t border-border bg-surface/40">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  Most booked this month
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  See which vendors couples are booking right now.
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                Explore trending vendors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {MOST_BOOKED.map((vendor, index) => {
                const isRightEdge = index === MOST_BOOKED.length - 1;
                return (
                <div key={vendor.id}>
                  <Link href={`/vendors/${generateSlug(vendor.name)}`} className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                      <img src={resolveAssetSrc(vendor.image)} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-purple-500 text-background text-[0.6rem] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        Trending
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-background font-bold text-base line-clamp-2">{vendor.category}</h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
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
                          {/* Rich hover card */}
                          <div
                            className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                              isRightEdge ? "right-0" : "left-[-10px]"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
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
                                    <span className="text-secondary">({vendor.reviews})</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Follow
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                    onClick={(e) => e.preventDefault()}
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
                        <span className="text-xs font-medium text-secondary">{vendor.name}</span>
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
          </div>
        </section>

        {/* Budget-Friendly Section */}
        <section className="py-14 px-6 lg:px-12 border-t border-border bg-background">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  Budget-friendly picks
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  Quality vendors at accessible price points for smart planners.
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                View budget options
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {BUDGET_FRIENDLY.map((vendor, index) => {
                const isRightEdge = index === BUDGET_FRIENDLY.length - 1;
                return (
                <div key={vendor.id}>
                  <Link href={`/vendors/${generateSlug(vendor.name)}`} className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                      <img src={resolveAssetSrc(vendor.image)} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500 text-background text-[0.6rem] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        Great value
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-background font-bold text-base line-clamp-2">{vendor.category}</h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
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
                          {/* Rich hover card */}
                          <div
                            className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                              isRightEdge ? "right-0" : "left-[-10px]"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
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
                                    <span className="text-secondary">({vendor.reviews})</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Follow
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                    onClick={(e) => e.preventDefault()}
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
                        <span className="text-xs font-medium text-secondary">{vendor.name}</span>
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
          </div>
        </section>

        {/* Quick Responders Section */}
        <section className="py-14 px-6 lg:px-12 border-t border-border bg-surface/20">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  Quick responders
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  Vendors who reply in under 2 hours to keep your planning on track.
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                View fast responders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {QUICK_RESPONDERS.map((vendor, index) => {
                const isRightEdge = index === QUICK_RESPONDERS.length - 1;
                return (
                <div key={vendor.id}>
                  <Link href={`/vendors/${generateSlug(vendor.name)}`} className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                      <img src={resolveAssetSrc(vendor.image)} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-orange-500 text-background text-[0.6rem] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        Fast reply
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-background font-bold text-base line-clamp-2">{vendor.category}</h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
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
                          {/* Rich hover card */}
                          <div
                            className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                              isRightEdge ? "right-0" : "left-[-10px]"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
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
                                    <span className="text-secondary">({vendor.reviews})</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Follow
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                    onClick={(e) => e.preventDefault()}
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
                        <span className="text-xs font-medium text-secondary">{vendor.name}</span>
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
          </div>
        </section>

        {/* Regional Spotlight Section */}
        <section className="py-14 px-6 lg:px-12 border-t border-border bg-surface/40">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-secondary">
                  <span className="h-[1px] w-10 bg-accent" />
                  {REGIONAL_SPOTLIGHT.region} spotlight
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-4">
                  {REGIONAL_SPOTLIGHT.description}
                </h2>
              </div>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                >
                Explore {REGIONAL_SPOTLIGHT.region}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {REGIONAL_SPOTLIGHT.vendors.map((vendor, index) => {
                const isRightEdge = index === REGIONAL_SPOTLIGHT.vendors.length - 1;
                return (
                <div key={vendor.id}>
                  <Link href={`/vendors/${generateSlug(vendor.name)}`} className="group rounded-lg overflow-visible hover:shadow-lg transition-shadow duration-200 block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface group/image">
                      <img src={resolveAssetSrc(vendor.image)} alt={vendor.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" />
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-indigo-500 text-background text-[0.6rem] font-semibold">
                        <Sparkles className="w-2.5 h-2.5" />
                        Featured
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-background font-bold text-base line-clamp-2">{vendor.category}</h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4 text-primary" />
                            </button>
                            <button type="button" className="p-1.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors" onClick={(e) => e.preventDefault()}>
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
                          {/* Rich hover card */}
                          <div
                            className={`absolute bottom-full mb-3 w-[420px] bg-background border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-[9999] ${
                              isRightEdge ? "right-0" : "left-[-10px]"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 shrink-0">
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
                                    <span className="text-secondary">({vendor.reviews})</span>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-surface text-[0.65rem] font-semibold text-primary transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Follow
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-[0.65rem] font-semibold text-background transition-colors"
                                    onClick={(e) => e.preventDefault()}
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
                        <span className="text-xs font-medium text-secondary">{vendor.name}</span>
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
          </div>
        </section>

        <section className="py-12 px-6 lg:px-12 border-t border-border bg-surface/20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  Vendors by area
                </h2>
                <p className="text-secondary mt-2">
                  Browse top wedding teams in each region.
                </p>
              </div>
            </div>
            <div
                ref={areasRowRef}
                className="areas-row flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
              >
                {AREA_HIGHLIGHTS.map((area) => (
                  <div
                    key={area.id}
                    className="area-card min-w-[200px] sm:min-w-[220px] bg-background border border-border rounded-2xl px-5 py-4 shadow-sm snap-start"
                  >
                    <div className="text-base font-semibold">{area.name}</div>
                    <div className="text-sm text-secondary mt-1">
                      {area.count}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-12 border-t border-border">
          <div className="max-w-[1200px] mx-auto rounded-[32px] border border-border bg-gradient-to-br from-primary to-accent text-background p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-[-80px] right-[-60px] w-56 h-56 bg-background/20 rounded-full blur-3xl" />
            <div className="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono tracking-[0.3em] uppercase text-background/70">
                  <span className="h-[1px] w-10 bg-background/50" />
                  For vendors
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold mt-4">
                  Grow your business with couples ready to book.
                </h2>
                <p className="text-lg text-background/80 mt-4 leading-relaxed">
                  Join the curated marketplace trusted by modern couples across
                  East Africa. Highlight your portfolio and respond to qualified
                  leads.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-background text-primary font-semibold hover:bg-background/90 transition-colors"
                >
                  Apply to join
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/inspiration"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-background/40 text-background font-semibold hover:bg-background/10 transition-colors"
                >
                  Browse inspiration
                </Link>
                <div className="text-xs text-background/70 text-center">
                  Approval in 48 hours for qualified teams.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
