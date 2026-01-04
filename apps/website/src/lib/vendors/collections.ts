// Types for vendor collection items
// Images are now always strings (URLs from Supabase storage)
export type VendorCollectionItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  slug?: string;
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
  image: string;
};

// Hardcoded vendor arrays removed - data now comes from Supabase API
// Keeping empty arrays for type compatibility (not used as fallback anymore)
export const NEW_VENDORS: VendorCollectionItem[] = [];
export const BUDGET_FRIENDLY: VendorCollectionItem[] = [];
export const PROMOTIONS: PromotionItem[] = [];
export const DEALS: VendorCollectionItem[] = [];
export const MOST_BOOKED: VendorCollectionItem[] = [];
export const QUICK_RESPONDERS: VendorCollectionItem[] = [];
export const ZANZIBAR_SPOTLIGHT: VendorCollectionItem[] = [];
