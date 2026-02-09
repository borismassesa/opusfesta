export interface Seller {
  name: string;
  rating: number;
  salesCount: number;
  avatar: string;
}

export interface Product {
  id: string;
  title: string;
  image: string;
  images?: string[]; // Additional images for the product page
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  rating?: number;
  ratingCount?: number;
  isVideo?: boolean;
  seller?: Seller;
  description?: string;
  isBestseller?: boolean;
  dealText?: string;
  isAd?: boolean;
  isStarSeller?: boolean;
  freeDelivery?: boolean;
}

export interface Category {
  id: string;
  title: string;
  image: string;
}

export interface Collection {
  id: string;
  title: string;
  image: string;
  priceTag?: number;
}