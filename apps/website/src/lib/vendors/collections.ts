import vendorPlanning from "@assets/stock_images/wedding_planning_che_871a1473.jpg";
import vendorFlorals from "@assets/stock_images/wedding_bouquet_mode_ab76e613.jpg";
import vendorPhoto from "@assets/stock_images/wedding_photographer_abdcbceb.jpg";
import vendorVenue from "@assets/stock_images/outdoor_garden_weddi_24d9a869.jpg";
import vendorCatering from "@assets/stock_images/luxury_wedding_table_da8d592c.jpg";
import vendorBeauty from "@assets/stock_images/wedding_dress_suit_r_bb9b914d.jpg";
import vendorMusic from "@assets/stock_images/wedding_reception_li_3a8fab49.jpg";
import vendorDecor from "@assets/stock_images/wedding_table_settin_c7e6dce8.jpg";
import vendorVideo from "@assets/stock_images/happy_bride_and_groo_e2e2dc27.jpg";

export type VendorCollectionItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  image: typeof vendorPlanning;
};

export type PromotionItem = {
  id: string;
  label: string;
  title: string;
  vendor: string;
  rating: number;
  reviews: number;
  category: string;
  location: string;
  image: typeof vendorPlanning;
};

export const NEW_VENDORS: VendorCollectionItem[] = [
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
  {
    id: "new-6",
    name: "Tropical Venue Collection",
    category: "Venues",
    location: "Zanzibar",
    rating: 4.8,
    reviews: 9,
    image: vendorVenue,
  },
];

export const BUDGET_FRIENDLY: VendorCollectionItem[] = [
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
  {
    id: "budget-6",
    name: "Coastal Sounds DJ",
    category: "Music",
    location: "Dar es Salaam",
    rating: 4.7,
    reviews: 68,
    image: vendorMusic,
  },
];

export const PROMOTIONS: PromotionItem[] = [
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
  {
    id: "promo-6",
    label: "New vendor",
    title: "Free consultation + portfolio review",
    vendor: "Elegant Affairs Tanzania",
    rating: 4.8,
    reviews: 24,
    category: "Wedding Planning",
    location: "Dar es Salaam",
    image: vendorPlanning,
  },
];

export const DEALS: VendorCollectionItem[] = PROMOTIONS.map((promo) => ({
  id: promo.id,
  name: promo.vendor,
  category: promo.category,
  location: promo.location,
  rating: promo.rating,
  reviews: promo.reviews,
  image: promo.image,
}));

export const MOST_BOOKED: VendorCollectionItem[] = [
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
  {
    id: "booked-6",
    name: "Zuri Lens Collective",
    category: "Photography",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 128,
    image: vendorPhoto,
  },
];

export const QUICK_RESPONDERS: VendorCollectionItem[] = [
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
  {
    id: "quick-6",
    name: "Beauty Express Studio",
    category: "Beauty & Makeup",
    location: "Arusha",
    rating: 4.9,
    reviews: 92,
    image: vendorBeauty,
  },
];

export const ZANZIBAR_SPOTLIGHT: VendorCollectionItem[] = [
  {
    id: "zanzibar-1",
    name: "Zuri Lens Collective",
    category: "Photography",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 128,
    image: vendorPhoto,
  },
  {
    id: "zanzibar-2",
    name: "Coastal Florals Studio",
    category: "Florals",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 74,
    image: vendorFlorals,
  },
  {
    id: "zanzibar-3",
    name: "Ocean Bloom Florals",
    category: "Florals",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 112,
    image: vendorFlorals,
  },
  {
    id: "zanzibar-4",
    name: "Sunset Estate",
    category: "Venues",
    location: "Zanzibar",
    rating: 4.7,
    reviews: 54,
    image: vendorVenue,
  },
  {
    id: "zanzibar-5",
    name: "Sunset Beach Photography",
    category: "Photography",
    location: "Zanzibar",
    rating: 4.9,
    reviews: 12,
    image: vendorPhoto,
  },
  {
    id: "zanzibar-6",
    name: "Tropical Venue Collection",
    category: "Venues",
    location: "Zanzibar",
    rating: 4.8,
    reviews: 9,
    image: vendorVenue,
  },
];
