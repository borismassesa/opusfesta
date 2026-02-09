import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  Leaf,
  MapPin,
  Plus,
  Star,
  Truck,
  WandSparkles,
} from 'lucide-react';
import { SafeImage } from './SafeImage';

interface ProductPageProps {
  product: Product;
  isSaved?: boolean;
  onToggleSave?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToRegistry?: (product: Product) => void;
}

interface ReviewItem {
  id: string;
  author: string;
  date: string;
  text: string;
  rating: number;
  image?: string;
}

interface ShopSuggestion {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
}

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1483653085484-eb63c9f0250b?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1507914995485-1db4b4669dfc?auto=format&fit=crop&q=80&w=1400',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=1400',
];

const REVIEW_PHOTOS = [
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=700',
  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&q=80&w=700',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=700',
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=700',
];

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: 'review-1',
    author: 'Wasteland Wanderer',
    date: '22 Jan, 2026',
    rating: 4,
    text: 'Pretty nice and arrived quickly, thanks!',
  },
  {
    id: 'review-2',
    author: 'kof',
    date: '05 Jan, 2026',
    rating: 5,
    text: 'First view. Look good. It is neatly done. Thank you.',
  },
  {
    id: 'review-3',
    author: 'Lisa P.',
    date: '07 Feb, 2026',
    rating: 5,
    text: 'Great quality and excellent communication. The final product looked better than the preview.',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=400',
  },
];

const RELATED_SEARCH_CARDS = [
  {
    id: 'related-1',
    title: 'Engraved ring box',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-2',
    title: 'Wedding chain',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-3',
    title: 'Bridal necklace',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-4',
    title: 'Custom vow print',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-5',
    title: 'Photo keepsake',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-6',
    title: 'Minimal bridal jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-7',
    title: 'Promise ring set',
    image: 'https://images.unsplash.com/photo-1603561596112-db7f5b5f5f58?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-8',
    title: 'Bridesmaid gift',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0d799?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-9',
    title: 'Gold cufflinks',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'related-10',
    title: 'Wedding day accessories',
    image: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&q=80&w=300',
  },
];

const MAX_GALLERY_IMAGES = 8;
const MAX_SIDE_THUMBNAILS = MAX_GALLERY_IMAGES - 1;

const formatCurrency = (value: number) => `TSh ${value.toLocaleString()}`;

const StarRating = ({ value, size = 14 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5 text-[#f59e0b]">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={`star-${index}`}
        size={size}
        fill={index < Math.round(value) ? 'currentColor' : 'none'}
        className={index < Math.round(value) ? 'text-[#f59e0b]' : 'text-gray-300'}
      />
    ))}
  </div>
);

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  isSaved = false,
  onToggleSave,
  onAddToCart,
  onAddToRegistry,
}) => {
  const galleryImages = useMemo(() => {
    const merged = [product.image, ...(product.images || []), ...FALLBACK_GALLERY].filter(Boolean);
    return Array.from(new Set(merged)).slice(0, MAX_GALLERY_IMAGES);
  }, [product.image, product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPersonalisation, setShowPersonalisation] = useState(false);
  const [selectedChain, setSelectedChain] = useState('18 inch / Gold');
  const [selectedEngraving, setSelectedEngraving] = useState('Single side');
  const [selectedQuantity, setSelectedQuantity] = useState('1');

  useEffect(() => {
    setActiveImageIndex(0);
    setShowPersonalisation(false);
    setSelectedChain('18 inch / Gold');
    setSelectedEngraving('Single side');
    setSelectedQuantity('1');
  }, [product.id, product.title]);

  const activeImage = galleryImages[activeImageIndex] || product.image;
  const sellerName = product.seller?.name || 'OpusFesta Studio';
  const sellerAvatar =
    product.seller?.avatar ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300';
  const rating = product.rating || 4.1;
  const ratingCount = product.ratingCount || 8;
  const listPrice = product.originalPrice || Math.round(product.price * 1.4);
  const discountPercent = Math.max(8, Math.round(((listPrice - product.price) / listPrice) * 100));

  const moreFromShop: ShopSuggestion[] = [
    {
      id: 'shop-1',
      title: 'Signature Couple Portrait',
      image: galleryImages[2] || FALLBACK_GALLERY[2],
      price: product.price,
      originalPrice: listPrice,
    },
    {
      id: 'shop-2',
      title: 'Minimal Ring Holder',
      image: galleryImages[3] || FALLBACK_GALLERY[3],
      price: Math.round(product.price * 0.74),
      originalPrice: Math.round(listPrice * 0.9),
    },
    {
      id: 'shop-3',
      title: 'Wedding Date Illustration',
      image: galleryImages[4] || FALLBACK_GALLERY[4],
      price: Math.round(product.price * 0.86),
      originalPrice: Math.round(listPrice * 0.95),
    },
    {
      id: 'shop-4',
      title: 'Custom Bridal Keepsake',
      image: galleryImages[5] || FALLBACK_GALLERY[5],
      price: Math.round(product.price * 0.9),
      originalPrice: Math.round(listPrice * 0.98),
    },
  ];

  const alsoLike: ShopSuggestion[] = [
    ...moreFromShop,
    {
      id: 'like-1',
      title: 'Custom Vows Print',
      image: galleryImages[6] || FALLBACK_GALLERY[6],
      price: Math.round(product.price * 0.58),
      originalPrice: Math.round(listPrice * 0.83),
    },
    {
      id: 'like-2',
      title: 'Luxury Gift Box',
      image: galleryImages[7] || FALLBACK_GALLERY[7],
      price: Math.round(product.price * 0.45),
      originalPrice: Math.round(listPrice * 0.68),
    },
  ];

  const thumbnailEntries = useMemo(
    () =>
      galleryImages
        .map((image, index) => ({ image, index }))
        .filter(({ index }) => index !== activeImageIndex)
        .slice(0, MAX_SIDE_THUMBNAILS),
    [galleryImages, activeImageIndex]
  );

  return (
    <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 pb-14 pt-6">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <button type="button" className="hover:underline">
          Homepage
        </button>
        <span>{'>'}</span>
        <button type="button" className="hover:underline">
          Attire & Rings
        </button>
        <span>{'>'}</span>
        <button type="button" className="hover:underline">
          Collections
        </button>
        <span>{'>'}</span>
        <span className="max-w-[30ch] truncate text-gray-900">{product.title}</span>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px] gap-6 xl:gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[84px_minmax(0,1fr)] gap-3 lg:gap-4 items-start">
            <div className="order-2 lg:order-1">
              <div className="relative flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {thumbnailEntries.map(({ image, index }) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 hover:border-gray-400 transition-colors"
                  >
                    <SafeImage
                      src={image}
                      alt={`${product.title} preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 1 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <div className="h-8 w-8 rounded-full bg-white/90 text-[12px] font-semibold text-black flex items-center justify-center">
                          ▶
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="group order-1 lg:order-2 relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <div className="absolute left-4 top-4 z-20 rounded-full bg-[#f5c7a0] px-3 py-1 text-sm font-semibold text-[#2f241d]">
                OpusFesta&apos;s Pick
              </div>

              <button
                type="button"
                onClick={() => onToggleSave?.(product)}
                className="absolute right-4 top-4 z-20 h-12 w-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center"
                aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart
                  size={22}
                  fill={isSaved ? 'currentColor' : 'none'}
                  className={isSaved ? 'text-red-500' : 'text-gray-800'}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex(
                    (current) => (current - 1 + galleryImages.length) % galleryImages.length
                  )
                }
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 border border-gray-200 shadow-sm flex items-center justify-center transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                type="button"
                onClick={() => setActiveImageIndex((current) => (current + 1) % galleryImages.length)}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 h-14 w-14 rounded-full bg-white/95 border border-gray-200 shadow-sm flex items-center justify-center transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>

              <div className="relative aspect-[4/3]">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    setActiveImageIndex(
                      (current) => (current - 1 + galleryImages.length) % galleryImages.length
                    )
                  }
                  className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-w-resize"
                />
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActiveImageIndex((current) => (current + 1) % galleryImages.length)}
                  className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-e-resize"
                />
                <SafeImage src={activeImage} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex justify-end text-sm text-gray-600">
            <button type="button" className="inline-flex items-center gap-2 hover:underline">
              <Flag size={14} />
              Report this item
            </button>
          </div>

          <details open className="rounded-2xl border border-gray-200 p-5">
            <summary className="list-none cursor-pointer flex items-center justify-between font-serif text-xl sm:text-2xl text-gray-900">
              Product description
              <ChevronDown size={22} />
            </summary>

            <div className="mt-4 space-y-3 text-base leading-relaxed text-gray-700">
              <p>
                {product.description ||
                  'The Cross Name Necklace is one of our top picks for Baptism gifts and daily wear. Personalize it with names to create a meaningful keepsake for engagements, weddings, and anniversaries.'}
              </p>
              <p>
                Crafted for everyday wear with a minimal finish and customizable engraving, this design balances modern style with sentimental value.
              </p>
            </div>
          </details>

          <section className="pt-1">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-gray-900">
              Reviews for this item ({ratingCount})
            </h2>

            <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <div className="flex items-end gap-2">
                  <Star className="text-[#f59e0b]" fill="currentColor" size={28} />
                  <p className="text-4xl leading-none font-semibold text-gray-900">
                    {rating.toFixed(1)}
                    <span className="text-2xl text-gray-500">/5</span>
                  </p>
                </div>
                <p className="text-sm text-gray-600">item average</p>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'Item quality', value: '4.1' },
                  { label: 'Delivery', value: '4.3' },
                  { label: 'Customer service', value: '3.8' },
                  { label: 'Buyers recommend', value: '80%' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-2 border-[#f59e0b] flex items-center justify-center text-sm font-semibold text-gray-900">
                      {metric.value}
                    </div>
                    <span className="text-sm leading-tight text-gray-700 max-w-[140px]">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <p className="font-semibold inline-flex items-center gap-2 text-gray-900">
                  <WandSparkles size={20} />
                  Buyer highlights, summarised by AI
                </p>
                <span className="text-gray-600">Fast delivery</span>
                <span className="text-gray-600">Looks great</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {['Delivery & Packaging (2)', 'Quality (2)', 'Condition (1)', 'Seller service (1)'].map((tag) => (
                  <span key={tag} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-5">
                {REVIEW_ITEMS.map((review) => (
                  <article key={review.id} className="border-b border-gray-200 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} size={18} />
                        <span className="text-lg font-semibold">{review.rating}</span>
                        <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          This item
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{review.author}</span> | {review.date}
                      </p>
                    </div>
                    <p className="mt-3 text-base text-gray-800">{review.text}</p>
                    {review.image && (
                      <div className="mt-3 h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                        <SafeImage src={review.image} alt={`${review.author} review`} className="h-full w-full object-cover" />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="pt-1">
            <h3 className="font-serif text-xl sm:text-2xl text-gray-900">Photos from reviews</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {REVIEW_PHOTOS.map((photo, index) => (
                <div key={`${photo}-${index}`} className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <SafeImage src={photo} alt={`Review photo ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>

          <section className="pt-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-gray-900">More from this shop</h3>
              <button type="button" className="text-sm sm:text-base font-semibold underline">
                Visit shop
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moreFromShop.map((item) => (
                <article key={item.id}>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    <SafeImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-900">{item.title}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-semibold leading-none text-[#15803d]">{formatCurrency(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-xs leading-none text-gray-500 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="pt-1">
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-gray-900">You may also like</h3>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              {alsoLike.map((item) => (
                <article key={item.id}>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    <SafeImage src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-900">{item.title}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-semibold leading-none text-[#15803d]">{formatCurrency(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-xs leading-none text-gray-500 line-through">
                        {formatCurrency(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="pt-1">
            <h4 className="font-serif text-xl sm:text-2xl text-gray-900">Explore more related searches</h4>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {RELATED_SEARCH_CARDS.map((searchCard) => (
                <button
                  key={searchCard.id}
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-2 py-2 text-left hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <SafeImage src={searchCard.image} alt={searchCard.title} className="h-full w-full object-cover" />
                  </div>
                  <span className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800">{searchCard.title}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>
                Designed by <span className="font-semibold underline">{sellerName}</span>
              </span>
              <span>|</span>
              <StarRating value={rating} size={14} />
              <span>|</span>
              <span className="font-medium text-[#7c3aed]">Star Seller</span>
            </div>

            <p className="text-sm font-semibold text-[#b42318]">In 20+ baskets</p>

            <div>
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-3xl font-bold leading-none text-gray-900">Now {formatCurrency(product.price)}</span>
                <span className="text-lg leading-none text-gray-500 line-through">{formatCurrency(listPrice)}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#15803d]">
                {discountPercent}% off - Sale ends soon
              </p>
            </div>

            <h1 className="text-2xl leading-tight text-gray-900">{product.title}</h1>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Chain Length & Color</label>
              <select
                value={selectedChain}
                onChange={(event) => setSelectedChain(event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base outline-none focus:border-gray-500"
              >
                <option>18 inch / Gold</option>
                <option>20 inch / Silver</option>
                <option>22 inch / Black</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Engraving Sides</label>
              <select
                value={selectedEngraving}
                onChange={(event) => setSelectedEngraving(event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base outline-none focus:border-gray-500"
              >
                <option>Single side</option>
                <option>Both sides</option>
                <option>No engraving</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowPersonalisation((current) => !current)}
              className="inline-flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black"
            >
              <Plus size={20} />
              Add personalisation
            </button>

            {showPersonalisation && (
              <textarea
                rows={3}
                placeholder="Add names, date, initials..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-gray-500"
              />
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Quantity</label>
              <select
                value={selectedQuantity}
                onChange={(event) => setSelectedQuantity(event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base outline-none focus:border-gray-500"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              className="h-12 w-full rounded-full bg-[#1f1f23] text-base font-semibold text-white transition-colors hover:bg-black"
            >
              Add to basket
            </button>

            <button
              type="button"
              onClick={() => onAddToRegistry?.(product)}
              className="w-full text-sm text-gray-700 underline hover:text-black"
            >
              Save for registry
            </button>
          </div>

          <details open className="rounded-2xl border border-gray-200 p-5">
            <summary className="list-none cursor-pointer flex items-center justify-between text-lg font-semibold text-gray-900">
              Item details
              <ChevronDown size={22} />
            </summary>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900">Highlights</h3>
              <p className="flex items-start gap-3">
                <BadgeCheck size={20} className="mt-1 shrink-0 text-gray-900" />
                Designed by <span className="font-semibold text-gray-900">{sellerName}</span>
              </p>
              <p className="flex items-start gap-3">
                <WandSparkles size={20} className="mt-1 shrink-0 text-gray-900" />
                Materials: Stainless steel, Yellow gold
              </p>
              <p className="flex items-start gap-3">
                <Leaf size={20} className="mt-1 shrink-0 text-gray-900" />
                Sustainable features: recycled metal
              </p>
              <p className="flex items-start gap-3">
                <Plus size={20} className="mt-1 shrink-0 text-gray-900" />
                Can be personalised
              </p>
              <p className="flex items-start gap-3">
                <Truck size={20} className="mt-1 shrink-0 text-gray-900" />
                Made to order
              </p>
            </div>
          </details>

          <details open className="rounded-2xl border border-gray-200 p-5">
            <summary className="list-none cursor-pointer flex items-center justify-between text-lg font-semibold text-gray-900">
              Delivery and return policies
              <ChevronDown size={22} />
            </summary>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <Truck size={20} className="text-gray-900" />
                Dispatches within 6-10 business days
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck size={20} className="text-gray-900" />
                Returns & exchanges accepted within 30 days
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={20} className="text-gray-900" />
                Dispatched from: <span className="font-semibold text-gray-900">Tanzania</span>
              </p>
            </div>
          </details>

          <details open className="rounded-2xl border border-gray-200 p-5">
            <summary className="list-none cursor-pointer flex items-center justify-between text-lg font-semibold text-gray-900">
              Meet your seller
              <ChevronDown size={22} />
            </summary>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                  <SafeImage src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{sellerName}</p>
                  <p className="text-sm text-gray-600">Owner of {sellerName}</p>
                </div>
              </div>
              <button
                type="button"
                className="h-12 w-full rounded-full border border-gray-900 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                Message seller
              </button>
            </div>
          </details>
        </aside>
      </section>
    </div>
  );
};
