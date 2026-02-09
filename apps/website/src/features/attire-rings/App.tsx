'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RoundCategoryGrid } from './components/RoundCategoryGrid';
import { FeatureGrid } from './components/FeatureGrid';
import { TrendingSlider } from './components/TrendingSlider';
import { SpecialGiftsGrid } from './components/SpecialGiftsGrid';
import { ProductGrid } from './components/ProductGrid';
import { SquareCategoryGrid } from './components/SquareCategoryGrid';
import { EditorsPicks } from './components/EditorsPicks';
import { LocalShops } from './components/LocalShops';
import { ProductPage } from './components/ProductPage';
import { CategoryPage } from './components/CategoryPage';
import { Product } from './types';

import { 
  ATTIRE_RINGS_MENU_CATEGORIES,
  WINTER_CATEGORIES, 
  FEATURED_GIFTS, 
  TRENDING_ITEMS,
  SPECIAL_GIFTS_ROW,
  MOST_LOVED_CATEGORIES, 
  TODAYS_DEALS,
  EDITORS_PICKS,
  STANDOUT_STYLES,
  JEWELLERY_PRODUCTS,
  STRICT_CATEGORY_SUBCATEGORIES,
  STRICT_CATEGORY_SUBTITLES,
} from './data';

const STORAGE_KEYS = {
  favorites: 'attire_rings_favorites',
  cart: 'attire_rings_cart',
  registry: 'attire_rings_registry',
} as const;

function App() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'category' | 'search' | 'favorites' | 'cart' | 'registry'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [registryProducts, setRegistryProducts] = useState<Product[]>([]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedProduct, activeCategory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignInClick = () => {
    router.push('/login');
  };

  const openCollectionView = (view: 'favorites' | 'cart' | 'registry') => {
    setSelectedProduct(null);
    setCurrentView(view);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setCurrentView('category');
  };

  const searchableProducts = useMemo(() => {
    const datasets = [TRENDING_ITEMS, TODAYS_DEALS, EDITORS_PICKS, JEWELLERY_PRODUCTS];
    const flattenedProducts = datasets.flat();
    const uniqueProducts = new Map<string, Product>();

    for (const product of flattenedProducts) {
      const dedupeKey = `${product.id}-${product.title.toLowerCase()}`;
      if (!uniqueProducts.has(dedupeKey)) {
        uniqueProducts.set(dedupeKey, product);
      }
    }

    return Array.from(uniqueProducts.values());
  }, []);

  const uniqueProducts = (products: Product[]) => {
    const productsMap = new Map<string, Product>();
    for (const product of products) {
      const key = `${product.id}-${product.title.toLowerCase()}`;
      if (!productsMap.has(key)) {
        productsMap.set(key, product);
      }
    }
    return Array.from(productsMap.values());
  };

  const productKey = (product: Product) => `${product.id}-${product.title.toLowerCase()}`;

  const addUniqueProduct = (items: Product[], product: Product) => {
    const key = productKey(product);
    return items.some((item) => productKey(item) === key) ? items : [product, ...items];
  };

  const removeProduct = (items: Product[], product: Product) => {
    const key = productKey(product);
    return items.filter((item) => productKey(item) !== key);
  };

  const isProductSaved = (product: Product) => {
    const key = productKey(product);
    return favoriteProducts.some((item) => productKey(item) === key);
  };

  const toggleSavedProduct = (product: Product) => {
    setFavoriteProducts((prev) => {
      const key = productKey(product);
      const exists = prev.some((item) => productKey(item) === key);
      return exists ? removeProduct(prev, product) : addUniqueProduct(prev, product);
    });
  };

  const addToCart = (product: Product) => {
    setCartProducts((prev) => addUniqueProduct(prev, product));
  };

  const addToRegistry = (product: Product) => {
    setRegistryProducts((prev) => addUniqueProduct(prev, product));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const readList = (key: string): Product[] => {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    setFavoriteProducts(readList(STORAGE_KEYS.favorites));
    setCartProducts(readList(STORAGE_KEYS.cart));
    setRegistryProducts(readList(STORAGE_KEYS.registry));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteProducts));
  }, [favoriteProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartProducts));
  }, [cartProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.registry, JSON.stringify(registryProducts));
  }, [registryProducts]);

  const allCategoryProducts = useMemo(
    () => uniqueProducts([...TRENDING_ITEMS, ...TODAYS_DEALS, ...EDITORS_PICKS, ...JEWELLERY_PRODUCTS]),
    []
  );

  const strictCategoryMatchers: Record<string, RegExp> = {
    Bridal: /(bridal|gown|dress|veil|hairpiece|tiara|wedding)/i,
    Groom: /(groom|suit|tux|bow tie|formal|leather shoe|cuff)/i,
    Bridesmaids: /(bridesmaid|flower girl|dress|palette|clutch)/i,
    Rings: /(ring|band|solitaire|engagement|wedding band)/i,
    Jewelry: /(jewel|earring|necklace|bracelet|pendant|pearl|gold)/i,
    Accessories: /(accessor|veil|hairpiece|tiara|shoe|box|journal|flutes|guest book)/i,
  };

  const strictCategoryFallbacks: Record<string, Product[]> = {
    Bridal: uniqueProducts([...TODAYS_DEALS, ...TRENDING_ITEMS]),
    Groom: uniqueProducts([...TODAYS_DEALS, ...TRENDING_ITEMS]),
    Bridesmaids: uniqueProducts([...TODAYS_DEALS, ...EDITORS_PICKS]),
    Rings: uniqueProducts([...JEWELLERY_PRODUCTS, ...TRENDING_ITEMS]),
    Jewelry: uniqueProducts([...JEWELLERY_PRODUCTS, ...TRENDING_ITEMS]),
    Accessories: uniqueProducts([...TODAYS_DEALS, ...TRENDING_ITEMS, ...EDITORS_PICKS]),
  };

  const strictCategoryProducts = useMemo(() => {
    const entries = ATTIRE_RINGS_MENU_CATEGORIES.map((category) => {
      const matcher = strictCategoryMatchers[category];
      const filtered = allCategoryProducts.filter((product) =>
        matcher.test([product.title, product.description, product.seller?.name].filter(Boolean).join(' '))
      );
      return [
        category,
        filtered.length > 0 ? filtered : strictCategoryFallbacks[category] || allCategoryProducts,
      ] as const;
    });

    return Object.fromEntries(entries) as Record<string, Product[]>;
  }, [allCategoryProducts]);

  const normalizeStrictCategory = (rawCategory: string): string => {
    const trimmed = rawCategory.trim();
    if (ATTIRE_RINGS_MENU_CATEGORIES.includes(trimmed)) {
      return trimmed;
    }

    const lower = trimmed.toLowerCase();
    if (/(ring|band|engagement)/i.test(lower)) return 'Rings';
    if (/(jewel|earring|necklace|bracelet|pendant)/i.test(lower)) return 'Jewelry';
    if (/(groom|suit|tux|bow tie|cuff)/i.test(lower)) return 'Groom';
    if (/(bridesmaid|flower girl)/i.test(lower)) return 'Bridesmaids';
    if (/(accessor|veil|tiara|hairpiece|shoe|box|journal)/i.test(lower)) return 'Accessories';
    return 'Bridal';
  };

  const categoryPageContent = useMemo(() => {
    const strictCategory = normalizeStrictCategory(activeCategory || 'Bridal');

    return {
      title: strictCategory,
      subtitle:
        STRICT_CATEGORY_SUBTITLES[strictCategory] ||
        'Curated categories for bridal fashion, groom styles, and ring collections.',
      subCategories: STRICT_CATEGORY_SUBCATEGORIES[strictCategory] || WINTER_CATEGORIES,
      products: strictCategoryProducts[strictCategory] || searchableProducts.slice(0, 18),
    };
  }, [
    activeCategory,
    searchableProducts,
    strictCategoryProducts,
  ]);

  const runSearch = (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setSearchResults([]);
      setCurrentView('home');
      return;
    }

    const filteredProducts = searchableProducts.filter((product) => {
      const searchableText = [
        product.title,
        product.description,
        product.seller?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });

    setSearchResults(filteredProducts);
    setSelectedProduct(null);
    setCurrentView('search');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    runSearch(query);
  };

  const handleSearchSubmit = () => {
    runSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLogoClick={handleLogoClick}
        onCategoryClick={handleCategoryClick}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onSignInClick={handleSignInClick}
        onFavoritesClick={() => openCollectionView('favorites')}
        onRegistryClick={() => openCollectionView('registry')}
        onCartClick={() => openCollectionView('cart')}
        favoritesCount={favoriteProducts.length}
        registryCount={registryProducts.length}
        cartCount={cartProducts.length}
      />
      
      <main>
        {currentView === 'home' && (
          <>
            <Hero />
            
            <RoundCategoryGrid 
              title="Shop Attire & Ring Categories" 
              items={WINTER_CATEGORIES} 
              onCategoryClick={handleCategoryClick}
            />
            
            {/* The "OpusFesta Collections" Section */}
            <div>
              <FeatureGrid 
                title="OpusFesta Collections" 
                subtitle="Curated for your big day" 
                buttonText="Browse collections"
                items={FEATURED_GIFTS} 
              />
              
              <TrendingSlider 
                 items={TRENDING_ITEMS} 
                 onProductClick={handleProductClick}
                 isProductSaved={isProductSaved}
                 onToggleSave={toggleSavedProduct}
              />
              
              <SpecialGiftsGrid 
                 title="Wedding Essentials"
                 items={SPECIAL_GIFTS_ROW}
                 onCategoryClick={handleCategoryClick}
              />
            </div>

            <SquareCategoryGrid 
              title="Browse Popular Attire & Rings Departments" 
              items={MOST_LOVED_CATEGORIES} 
              onCategoryClick={handleCategoryClick}
            />
            
            {/* Today's Deals as a Slider - UPDATED VARIANT */}
            <ProductGrid 
              title="Exclusive Wedding Deals" 
              subtitle="Offers ending soon"
              products={TODAYS_DEALS}
              timer="Offers end in 15:29:46"
              layout="slider"
              cardVariant="deal"
              onProductClick={handleProductClick}
              isProductSaved={isProductSaved}
              onToggleSave={toggleSavedProduct}
            />
            
            <EditorsPicks
              products={EDITORS_PICKS}
              onProductClick={handleProductClick}
              isProductSaved={isProductSaved}
              onToggleSave={toggleSavedProduct}
            />
            
            <RoundCategoryGrid 
              title="Style Inspiration for Your Celebration" 
              items={STANDOUT_STYLES} 
              onCategoryClick={handleCategoryClick}
            />

            {/* Recently Viewed - New Section with Slider */}
            <ProductGrid 
              title="Recently viewed & more" 
              products={[...TODAYS_DEALS].reverse()} 
              layout="slider"
              onProductClick={handleProductClick}
              isProductSaved={isProductSaved}
              onToggleSave={toggleSavedProduct}
            />
            
            <LocalShops />
          </>
        )}

        {currentView === 'product' && (
          <>
            {selectedProduct && (
              <ProductPage
                product={selectedProduct}
                isSaved={isProductSaved(selectedProduct)}
                onToggleSave={toggleSavedProduct}
                onAddToCart={addToCart}
                onAddToRegistry={addToRegistry}
              />
            )}
          </>
        )}

        {currentView === 'category' && (
          <CategoryPage 
             categoryTitle={categoryPageContent.title}
             subtitle={categoryPageContent.subtitle}
             subCategories={categoryPageContent.subCategories}
             products={categoryPageContent.products}
             onProductClick={handleProductClick}
             isProductSaved={isProductSaved}
             onToggleSave={toggleSavedProduct}
          />
        )}

        {currentView === 'search' && (
          <>
            {searchResults.length > 0 ? (
              <ProductGrid
                title={`Search results for "${searchQuery.trim()}"`}
                subtitle={`${searchResults.length} item${searchResults.length === 1 ? '' : 's'} found`}
                products={searchResults}
                layout="grid"
                onProductClick={handleProductClick}
                isProductSaved={isProductSaved}
                onToggleSave={toggleSavedProduct}
              />
            ) : (
              <section className="py-16">
                <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 text-center">
                  <h2 className="font-serif text-3xl text-gray-900 mb-3">No matches found</h2>
                  <p className="text-gray-600 mb-8">
                    We couldn&apos;t find products matching &quot;{searchQuery.trim()}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Back to Attire & Rings
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {(currentView === 'favorites' || currentView === 'cart' || currentView === 'registry') && (
          <>
            {currentView === 'favorites' && favoriteProducts.length > 0 && (
              <ProductGrid
                title="Saved Items"
                subtitle={`${favoriteProducts.length} item${favoriteProducts.length === 1 ? '' : 's'} saved`}
                products={favoriteProducts}
                layout="grid"
                onProductClick={handleProductClick}
                isProductSaved={isProductSaved}
                onToggleSave={toggleSavedProduct}
              />
            )}
            {currentView === 'cart' && cartProducts.length > 0 && (
              <ProductGrid
                title="Your Cart"
                subtitle={`${cartProducts.length} item${cartProducts.length === 1 ? '' : 's'} in cart`}
                products={cartProducts}
                layout="grid"
                onProductClick={handleProductClick}
                isProductSaved={isProductSaved}
                onToggleSave={toggleSavedProduct}
              />
            )}
            {currentView === 'registry' && registryProducts.length > 0 && (
              <ProductGrid
                title="Your Registry"
                subtitle={`${registryProducts.length} item${registryProducts.length === 1 ? '' : 's'} added`}
                products={registryProducts}
                layout="grid"
                onProductClick={handleProductClick}
                isProductSaved={isProductSaved}
                onToggleSave={toggleSavedProduct}
              />
            )}

            {((currentView === 'favorites' && favoriteProducts.length === 0) ||
              (currentView === 'cart' && cartProducts.length === 0) ||
              (currentView === 'registry' && registryProducts.length === 0)) && (
              <section className="py-16">
                <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 text-center">
                  <h2 className="font-serif text-3xl text-gray-900 mb-3">
                    {currentView === 'favorites' && 'No saved items yet'}
                    {currentView === 'cart' && 'Your cart is empty'}
                    {currentView === 'registry' && 'Your registry is empty'}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {currentView === 'favorites' && 'Tap the heart icon on any product to save it here.'}
                    {currentView === 'cart' && 'Add products to your cart to review them here.'}
                    {currentView === 'registry' && 'Add products to your registry to keep track of must-haves.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Continue shopping
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
