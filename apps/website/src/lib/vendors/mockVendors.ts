// Mock vendor data - matches the structure from vendors listing page
// This is used as a fallback when vendors don't exist in the database yet

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

import type { Vendor, PortfolioItem, Review } from "@/lib/supabase/vendors";

// Helper to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Mock vendors data
const MOCK_VENDORS_DATA = [
  {
    id: "zuri-lens",
    name: "Zuri Lens Collective",
    category: "Photography",
    location: "Zanzibar",
    price: "$$$",
    rating: 4.9,
    reviews: 128,
    image: vendorPhoto,
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
  },
  {
    id: "amani-planning",
    name: "Amani Planning Studio",
    category: "Wedding Planning",
    location: "Dar es Salaam",
    price: "$$$",
    rating: 5.0,
    reviews: 88,
    image: vendorPlanning,
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
  },
  {
    id: "serenity-bridal",
    name: "Serenity Bridal Beauty",
    category: "Beauty & Makeup",
    location: "Mwanza",
    price: "$$",
    rating: 4.9,
    reviews: 140,
    image: vendorBeauty,
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
  },
  {
    id: "lavish-atelier",
    name: "Lavish Bridal Atelier",
    category: "Bridal Salons",
    location: "Dar es Salaam",
    price: "$$",
    rating: 4.8,
    reviews: 34,
    image: vendorBeauty,
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
  },
];

// Convert mock data to Vendor interface
export function getMockVendorBySlug(slug: string): Vendor | null {
  const mockVendor = MOCK_VENDORS_DATA.find(
    (v) => generateSlug(v.name) === slug || v.id === slug
  );

  if (!mockVendor) {
    return null;
  }

  // Convert to Vendor interface
  const [city, country] = mockVendor.location.split(", ").length > 1
    ? mockVendor.location.split(", ")
    : [mockVendor.location, "Tanzania"];

  return {
    id: mockVendor.id,
    slug: generateSlug(mockVendor.name),
    user_id: `mock-user-${mockVendor.id}`,
    business_name: mockVendor.name,
    category: mockVendor.category,
    subcategories: [],
    bio: `Professional ${mockVendor.category.toLowerCase()} services in ${mockVendor.location}.`,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    logo: null,
    cover_image: resolveAssetSrc(mockVendor.image),
    location: {
      city,
      country: country || "Tanzania",
    },
    price_range: mockVendor.price as any,
    verified: true,
    tier: "pro",
    stats: {
      viewCount: 0,
      inquiryCount: 0,
      saveCount: 0,
      averageRating: mockVendor.rating,
      reviewCount: mockVendor.reviews,
    },
    contact_info: {},
    social_links: {},
    years_in_business: 5,
    team_size: 3,
    services_offered: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function getMockVendorPortfolio(vendorId: string): PortfolioItem[] {
  // Get the vendor to use their cover image
  const vendor = MOCK_VENDORS_DATA.find(v => v.id === vendorId);
  const coverImage = vendor?.image ? resolveAssetSrc(vendor.image) : "";
  
  // Return some mock portfolio items with images
  return [
    {
      id: `portfolio-${vendorId}-1`,
      vendor_id: vendorId,
      title: "Featured Wedding",
      images: coverImage ? [coverImage] : [],
      description: "A beautiful wedding we had the pleasure of working on.",
      event_type: "Wedding",
      event_date: new Date().toISOString().split("T")[0],
      featured: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `portfolio-${vendorId}-2`,
      vendor_id: vendorId,
      title: "Elegant Ceremony",
      images: coverImage ? [coverImage] : [],
      description: "An elegant ceremony showcasing our attention to detail.",
      event_type: "Wedding",
      event_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      featured: false,
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function getMockVendorReviews(vendorId: string): Review[] {
  const mockReviews: Review[] = [
    {
      id: `review-${vendorId}-1`,
      vendor_id: vendorId,
      user_id: "user-1",
      rating: 5,
      title: "Absolutely amazing experience!",
      content: "We couldn't have asked for a better vendor for our special day. The attention to detail was incredible, and they made sure everything ran smoothly. Our guests are still talking about how beautiful everything was. Highly recommend to any couple planning their wedding!",
      images: [resolveAssetSrc(vendorVideo)], // Sample image for demo
      event_type: "Wedding",
      event_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 12,
      vendor_response: "Thank you so much for your kind words! It was an absolute pleasure working with you and your family. We're thrilled that your special day was everything you dreamed of. Wishing you both a lifetime of happiness!",
      vendor_responded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Sarah & James",
        avatar: null,
      },
    },
    {
      id: `review-${vendorId}-2`,
      vendor_id: vendorId,
      user_id: "user-2",
      rating: 5,
      title: "Exceeded all expectations",
      content: "From the initial consultation to the final delivery, this vendor was professional, creative, and incredibly responsive. They understood our vision perfectly and brought it to life in ways we never imagined. The quality of their work is outstanding, and we're so grateful we chose them for our wedding.",
      images: [resolveAssetSrc(vendorPhoto), resolveAssetSrc(vendorFlorals)], // Sample images for demo
      event_type: "Wedding",
      event_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 8,
      vendor_response: null,
      vendor_responded_at: null,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Emily & David",
        avatar: null,
      },
    },
    {
      id: `review-${vendorId}-3`,
      vendor_id: vendorId,
      user_id: "user-3",
      rating: 4,
      title: "Great service with minor hiccups",
      content: "Overall, we had a wonderful experience. The team was professional and the final result was beautiful. There were a couple of small communication issues during planning, but they were resolved quickly. Would definitely recommend, especially for couples who want quality work at a fair price.",
      images: [],
      event_type: "Wedding",
      event_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 5,
      vendor_response: "Thank you for your feedback! We appreciate your patience with the communication challenges and are glad we could resolve them quickly. We're continuously working to improve our processes. Congratulations on your wedding!",
      vendor_responded_at: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Michael & Lisa",
        avatar: null,
      },
    },
    {
      id: `review-${vendorId}-4`,
      vendor_id: vendorId,
      user_id: "user-4",
      rating: 5,
      title: "Perfect in every way",
      content: "This vendor made our wedding day absolutely perfect. Every detail was taken care of, and they went above and beyond to ensure everything was exactly as we envisioned. The team was friendly, professional, and truly passionate about what they do. We couldn't be happier with our choice!",
      images: [],
      event_type: "Wedding",
      event_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 15,
      vendor_response: null,
      vendor_responded_at: null,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Jessica & Mark",
        avatar: null,
      },
    },
    {
      id: `review-${vendorId}-5`,
      vendor_id: vendorId,
      user_id: "user-5",
      rating: 5,
      title: "Outstanding quality and service",
      content: "We were blown away by the quality of service and attention to detail. From our first meeting, we knew we were in good hands. The vendor understood our style and budget perfectly, and delivered beyond our expectations. Our wedding was everything we dreamed of and more.",
      images: [],
      event_type: "Wedding",
      event_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 10,
      vendor_response: "Thank you for choosing us! It was such a joy to be part of your special day. We're so happy that we could help make your wedding dreams come true. Best wishes to you both!",
      vendor_responded_at: new Date(Date.now() - 119 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Amanda & Robert",
        avatar: null,
      },
    },
    {
      id: `review-${vendorId}-6`,
      vendor_id: vendorId,
      user_id: "user-6",
      rating: 4,
      title: "Very satisfied",
      content: "Great vendor with excellent service. They were professional throughout the entire process and delivered quality work. The only reason I'm giving 4 stars instead of 5 is because of a small delay in the initial response time, but once we connected, everything was smooth sailing.",
      images: [],
      event_type: "Wedding",
      event_date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      verified: true,
      helpful: 3,
      vendor_response: null,
      vendor_responded_at: null,
      created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        name: "Maria & Carlos",
        avatar: null,
      },
    },
  ];

  return mockReviews;
}

