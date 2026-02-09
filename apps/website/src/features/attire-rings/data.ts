import { Category, Collection, Product } from './types';

// Helper for generating consistent, working additional images
const generateImages = (baseId: string) => [
  `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800`, // Wedding Party
  `https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800`, // Flowers
  `https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800`, // Rings
];

const MOCK_SELLER = {
  name: "Dar Bridal Boutique",
  rating: 4.9,
  salesCount: 1250,
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
};

const MOCK_DESCRIPTION = `Exquisitely crafted for your special day. This item represents the finest in Tanzanian craftsmanship and wedding elegance.`;

export const ATTIRE_RINGS_MENU_CATEGORIES: string[] = [
  'Bridal',
  'Groom',
  'Bridesmaids',
  'Rings',
  'Jewelry',
  'Accessories',
];

// 1. Winter/Main Categories
export const WINTER_CATEGORIES: Category[] = [
  { id: 'bridal', title: 'Bridal', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=400' },
  { id: 'groom', title: 'Groom', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400' },
  { id: 'bridesmaids', title: 'Bridesmaids', image: 'https://images.unsplash.com/photo-1512767258384-a169b596144e?auto=format&fit=crop&q=80&w=400' },
  { id: 'rings', title: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400' },
  { id: 'jewelry', title: 'Jewelry', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400' },
  { id: 'accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1588320232497-268e07972412?auto=format&fit=crop&q=80&w=400' },
];

// 2. Featured Gifts (Collections)
export const FEATURED_GIFTS: Collection[] = [
  { id: '1', title: 'Traditional Weddings', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
  { id: '2', title: 'Luxury Rings', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600' },
  { id: '3', title: 'Reception Styles', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600' },
];

// 3. Trending Items
export const TRENDING_ITEMS: Product[] = [
  { id: '1', title: 'Diamond Solitaire Ring', image: 'https://images.unsplash.com/photo-1603561289423-68f3d7d4360c?auto=format&fit=crop&q=80&w=400', price: 2500000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('101') },
  { id: '2', title: 'Lace Wedding Veil', image: 'https://images.unsplash.com/photo-1595467959659-1e3d08c5c792?auto=format&fit=crop&q=80&w=400', price: 150000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('102') },
  { id: '3', title: 'Gold Wedding Bands', image: 'https://images.unsplash.com/photo-1617038220319-33fc2e605273?auto=format&fit=crop&q=80&w=400', price: 850000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('103') },
  { id: '4', title: 'Pearl Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400', price: 120000, originalPrice: 180000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('104') },
  { id: '5', title: 'Groom Bow Tie', image: 'https://images.unsplash.com/photo-1555069519-127a4643f301?auto=format&fit=crop&q=80&w=400', price: 45000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('105') },
  { id: '6', title: 'Bridal Hairpiece', image: 'https://images.unsplash.com/photo-1588320232497-268e07972412?auto=format&fit=crop&q=80&w=400', price: 85000, seller: MOCK_SELLER, description: MOCK_DESCRIPTION, images: generateImages('106') },
];

// 4. Special Gifts Row
export const SPECIAL_GIFTS_ROW: Category[] = [
   { id: 'sg-bridal', title: "Bridal", image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=200' },
   { id: 'sg-groom', title: "Groom", image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=200' },
   { id: 'sg-bridesmaids', title: "Bridesmaids", image: 'https://images.unsplash.com/photo-1512767258384-a169b596144e?auto=format&fit=crop&q=80&w=200' },
   { id: 'sg-rings', title: "Rings", image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=200' },
   { id: 'sg-jewelry', title: "Jewelry", image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200' },
   { id: 'sg-accessories', title: "Accessories", image: 'https://images.unsplash.com/photo-1595967784088-25fb524458bb?auto=format&fit=crop&q=80&w=200' },
];

// 5. Most Loved Departments
export const MOST_LOVED_CATEGORIES: Category[] = [
  { id: 'ml-bridal', title: 'Bridal', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400' },
  { id: 'ml-groom', title: 'Groom', image: 'https://images.unsplash.com/photo-1555069519-127a4643f301?auto=format&fit=crop&q=80&w=400' },
  { id: 'ml-bridesmaids', title: 'Bridesmaids', image: 'https://images.unsplash.com/photo-1605900228373-d34e69b2cb4e?auto=format&fit=crop&q=80&w=400' },
  { id: 'ml-rings', title: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400' },
  { id: 'ml-jewelry', title: 'Jewelry', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400' },
  { id: 'ml-accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&q=80&w=400' },
];

// 6. Today's Deals
export const TODAYS_DEALS: Product[] = [
  { 
    id: '1', 
    title: 'Elegant Satin Wedding Gown', 
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('40'),
    price: 450000, 
    originalPrice: 650000, 
    discountBadge: '30% off',
    rating: 4.9,
    ratingCount: 124,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    isBestseller: true,
    dealText: "Bridal Season Sale"
  },
  { 
    id: '2', 
    title: 'Custom Velvet Ring Box', 
    image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('41'),
    price: 35000, 
    originalPrice: 50000, 
    discountBadge: '30% off',
    rating: 4.9,
    ratingCount: 304,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    dealText: "Limited Time Offer"
  },
  { 
    id: '3', 
    title: 'Maasai Beaded Necklace', 
    image: 'https://images.unsplash.com/photo-1627883984666-4f9e1603c622?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('42'),
    price: 75000, 
    originalPrice: 100000, 
    discountBadge: '25% off',
    rating: 5.0,
    ratingCount: 512,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    isBestseller: true,
    dealText: "Tanzanian Special"
  },
  { 
    id: '4', 
    title: 'Floral Centerpiece Set', 
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('43'),
    price: 150000, 
    originalPrice: 200000, 
    discountBadge: '25% off',
    rating: 4.8,
    ratingCount: 89,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    dealText: "Event Ready"
  },
  { 
    id: '5', 
    title: 'Handmade Guest Book', 
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('44'),
    price: 65000, 
    originalPrice: 85000, 
    discountBadge: '20% off',
    rating: 4.9,
    ratingCount: 122,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    dealText: "Best Seller"
  },
  { 
    id: '6', 
    title: 'Groom Leather Shoes', 
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('45'),
    price: 180000, 
    originalPrice: 220000, 
    discountBadge: '18% off',
    rating: 4.7,
    ratingCount: 230,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION,
    dealText: "Formal Wear Deal"
  },
  { 
    id: '7', 
    title: 'Crystal Tiara', 
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('46'),
    price: 55000, 
    discountBadge: '10% off',
    rating: 4.8,
    ratingCount: 56,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION
  },
  { 
    id: '8', 
    title: 'Wedding Planner Journal', 
    image: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=400', 
    images: generateImages('47'),
    price: 45000, 
    rating: 5.0,
    ratingCount: 12,
    seller: MOCK_SELLER,
    description: MOCK_DESCRIPTION
  }
];

// 7. Editors Picks
export const EDITORS_PICKS: Product[] = [
  { 
    id: 'ep1', 
    title: 'Bespoke Kitenge Dress', 
    image: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&q=80&w=500', 
    isVideo: true, 
    price: 350000, 
    seller: MOCK_SELLER 
  },
  { 
    id: 'ep2', 
    title: 'Custom Gold Pendant', 
    image: 'https://images.unsplash.com/photo-1602751584552-8ba420552826?auto=format&fit=crop&q=80&w=500', 
    isVideo: true, 
    price: 550000, 
    seller: MOCK_SELLER 
  },
  { 
    id: 'ep3', 
    title: 'Hand-Carved Decor', 
    image: 'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&q=80&w=500', 
    isVideo: true, 
    price: 125000, 
    seller: MOCK_SELLER 
  },
  { 
    id: 'ep4', 
    title: 'Luxury Cake Topper', 
    image: 'https://images.unsplash.com/photo-1522333323-325251a37c44?auto=format&fit=crop&q=80&w=500', 
    price: 45000, 
    originalPrice: 60000, 
    seller: MOCK_SELLER 
  },
  { 
    id: 'ep5', 
    title: 'Embroidered Veil', 
    image: 'https://images.unsplash.com/photo-1610427847953-2947a151b759?auto=format&fit=crop&q=80&w=500', 
    isVideo: true, 
    price: 250000, 
    seller: MOCK_SELLER 
  },
  { 
    id: 'ep6', 
    title: 'Personalized Flutes', 
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500', 
    price: 85000, 
    seller: MOCK_SELLER 
  },
];

// 8. Standout Styles
export const STANDOUT_STYLES: Category[] = [
  { id: 'style-bridal', title: 'Bridal', image: 'https://images.unsplash.com/photo-1502163140606-888448ae8cfe?auto=format&fit=crop&q=80&w=300' },
  { id: 'style-groom', title: 'Groom', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=300' },
  { id: 'style-bridesmaids', title: 'Bridesmaids', image: 'https://images.unsplash.com/photo-1605900228373-d34e69b2cb4e?auto=format&fit=crop&q=80&w=300' },
  { id: 'style-rings', title: 'Rings', image: 'https://images.unsplash.com/photo-1600003014608-c2ccc136aa63?auto=format&fit=crop&q=80&w=300' },
  { id: 'style-jewelry', title: 'Jewelry', image: 'https://images.unsplash.com/photo-1635767798638-3e252a0a8637?auto=format&fit=crop&q=80&w=300' },
  { id: 'style-accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1595967784088-25fb524458bb?auto=format&fit=crop&q=80&w=300' },
];

export const STRICT_CATEGORY_SUBTITLES: Record<string, string> = {
  Bridal: 'Wedding gowns, reception looks, and elegant finishing details for the bride.',
  Groom: 'Tuxedos, suits, shoes, and accessories tailored for a polished groom style.',
  Bridesmaids: 'Bridesmaid dresses, coordinated palettes, and matching accessories.',
  Rings: 'Engagement rings, wedding bands, and couple sets for every love story.',
  Jewelry: 'Necklaces, earrings, bracelets, and complete jewelry sets for wedding looks.',
  Accessories: 'Veils, tiaras, hairpieces, shoes, ring boxes, and styling extras.',
};

export const STRICT_CATEGORY_SUBCATEGORIES: Record<string, Category[]> = {
  Bridal: [
    { id: 'bridal-gowns', title: 'Wedding Gowns', image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=400' },
    { id: 'bridal-reception', title: 'Reception Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400' },
    { id: 'bridal-veils', title: 'Veils', image: 'https://images.unsplash.com/photo-1595967784088-25fb524458bb?auto=format&fit=crop&q=80&w=400' },
    { id: 'bridal-shoes', title: 'Bridal Shoes', image: 'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&q=80&w=400' },
    { id: 'bridal-tiaras', title: 'Tiaras', image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=400' },
    { id: 'bridal-hairpieces', title: 'Hairpieces', image: 'https://images.unsplash.com/photo-1588320232497-268e07972412?auto=format&fit=crop&q=80&w=400' },
  ],
  Groom: [
    { id: 'groom-tuxedos', title: 'Tuxedos', image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=400' },
    { id: 'groom-suits', title: 'Suits', image: 'https://images.unsplash.com/photo-1555069519-127a4643f301?auto=format&fit=crop&q=80&w=400' },
    { id: 'groom-shirts', title: 'Dress Shirts', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400' },
    { id: 'groom-bowties', title: 'Bow Ties', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400' },
    { id: 'groom-shoes', title: 'Formal Shoes', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=400' },
    { id: 'groom-cufflinks', title: 'Cuff Links', image: 'https://images.unsplash.com/photo-1596910547037-846b7dd8c278?auto=format&fit=crop&q=80&w=400' },
  ],
  Bridesmaids: [
    { id: 'maids-dresses', title: 'Bridesmaid Dresses', image: 'https://images.unsplash.com/photo-1512767258384-a169b596144e?auto=format&fit=crop&q=80&w=400' },
    { id: 'maids-neutral', title: 'Neutral Palettes', image: 'https://images.unsplash.com/photo-1605900228373-d34e69b2cb4e?auto=format&fit=crop&q=80&w=400' },
    { id: 'maids-jewel', title: 'Jewel Tones', image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&q=80&w=400' },
    { id: 'maids-shoes', title: 'Bridesmaid Shoes', image: 'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&q=80&w=400' },
    { id: 'maids-jewelry', title: 'Matching Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' },
    { id: 'maids-clutches', title: 'Clutches', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400' },
  ],
  Rings: [
    { id: 'rings-engagement', title: 'Engagement Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400' },
    { id: 'rings-bands', title: 'Wedding Bands', image: 'https://images.unsplash.com/photo-1617038220319-33fc2e605273?auto=format&fit=crop&q=80&w=400' },
    { id: 'rings-couples', title: 'Couple Sets', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400' },
    { id: 'rings-men', title: 'Mens Rings', image: 'https://images.unsplash.com/photo-1626019567954-3e981df59b38?auto=format&fit=crop&q=80&w=400' },
    { id: 'rings-custom', title: 'Custom Engraved', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400' },
    { id: 'rings-boxes', title: 'Ring Boxes', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400' },
  ],
  Jewelry: [
    { id: 'jewelry-rings', title: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400' },
    { id: 'jewelry-earrings', title: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400' },
    { id: 'jewelry-necklaces', title: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400' },
    { id: 'jewelry-bracelets', title: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400' },
    { id: 'jewelry-sets', title: 'Jewelry Sets', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' },
    { id: 'jewelry-watches', title: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
  ],
  Accessories: [
    { id: 'acc-veils', title: 'Veils', image: 'https://images.unsplash.com/photo-1595967784088-25fb524458bb?auto=format&fit=crop&q=80&w=400' },
    { id: 'acc-tiaras', title: 'Tiaras', image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=400' },
    { id: 'acc-hairpieces', title: 'Hairpieces', image: 'https://images.unsplash.com/photo-1588320232497-268e07972412?auto=format&fit=crop&q=80&w=400' },
    { id: 'acc-shoes', title: 'Shoes', image: 'https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&q=80&w=400' },
    { id: 'acc-cufflinks', title: 'Cuff Links', image: 'https://images.unsplash.com/photo-1596910547037-846b7dd8c278?auto=format&fit=crop&q=80&w=400' },
    { id: 'acc-gift-boxes', title: 'Gift Boxes', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400' },
  ],
};

// --- JEWELLERY PAGE SPECIFIC DATA ---

export const JEWELLERY_SUB_CATEGORIES: Category[] = [
  { id: 'j1', title: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400' },
  { id: 'j2', title: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400' },
  { id: 'j3', title: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=400' },
  { id: 'j4', title: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400' },
  { id: 'j5', title: 'Jewellery Sets', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' },
  { id: 'j6', title: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400' },
  { id: 'j7', title: 'Jewellery Storage', image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400' },
  { id: 'j8', title: 'Cremation & Memorial Jewellery', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=400' },
  { id: 'j9', title: 'Brooches, Pins & Clips', image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=400' },
  { id: 'j10', title: 'Body Jewellery', image: 'https://images.unsplash.com/photo-1626019567954-3e981df59b38?auto=format&fit=crop&q=80&w=400' },
  { id: 'j11', title: 'Smart Jewellery', image: 'https://images.unsplash.com/photo-1510018572596-e40e2619b412?auto=format&fit=crop&q=80&w=400' },
  { id: 'j12', title: 'Cuff Links & Tie Clips', image: 'https://images.unsplash.com/photo-1596910547037-846b7dd8c278?auto=format&fit=crop&q=80&w=400' },
];

export const JEWELLERY_PRODUCTS: Product[] = [
  { 
    id: 'jp1', 
    title: 'Personalized Mens Woven Leather Bracelet, Custom Beads', 
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500', 
    price: 28600, 
    originalPrice: 57220, 
    discountBadge: '50% off', 
    rating: 4.8, 
    ratingCount: 3310, 
    seller: { ...MOCK_SELLER, name: "Etsy seller" },
    isAd: true,
    isStarSeller: true,
    freeDelivery: true
  },
  { 
    id: 'jp2', 
    title: 'Custom Bar Necklace, Personalized 6mm x 30mm', 
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=500', 
    price: 37800, 
    originalPrice: 42000, 
    discountBadge: '10% off', 
    rating: 4.9, 
    ratingCount: 4274, 
    seller: { ...MOCK_SELLER, name: "Etsy seller" },
    isAd: true,
    isStarSeller: true,
    freeDelivery: true
  },
  { 
    id: 'jp3', 
    title: 'Personalized Leather Watch Case – Custom Travel Organizer', 
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=500', 
    price: 42910, 
    originalPrice: 57220, 
    discountBadge: '25% off', 
    rating: 4.9, 
    ratingCount: 44782, 
    seller: { ...MOCK_SELLER, name: "Etsy seller" },
    isAd: true,
    freeDelivery: false
  },
  { 
    id: 'jp4', 
    title: 'Black Tungsten Ring with Gold Offset Lines', 
    image: 'https://images.unsplash.com/photo-1626019567954-3e981df59b38?auto=format&fit=crop&q=80&w=500', 
    price: 124330, 
    originalPrice: 248660, 
    discountBadge: '50% off', 
    rating: 4.7, 
    ratingCount: 294, 
    seller: { ...MOCK_SELLER, name: "Etsy seller" },
    isAd: true,
    isStarSeller: true,
    freeDelivery: true
  },
  { 
    id: 'jp5', 
    title: 'Paved Double Clicker Hoop, 18k Gold Sterling Silver', 
    image: 'https://images.unsplash.com/photo-1635767798638-3e252a0a8637?auto=format&fit=crop&q=80&w=500', 
    price: 18030, 
    originalPrice: 25750, 
    discountBadge: '30% off', 
    rating: 4.9, 
    ratingCount: 192257, 
    seller: { ...MOCK_SELLER, name: "Elevado" },
    isStarSeller: true,
    freeDelivery: false
  },
  { 
    id: 'jp6', 
    title: 'Versatile 14k Gold Filled Endless Hoop Earrings', 
    image: 'https://images.unsplash.com/photo-1630019852942-e5e1237d3d52?auto=format&fit=crop&q=80&w=500', 
    price: 15000, 
    rating: 4.8, 
    ratingCount: 2649, 
    seller: { ...MOCK_SELLER, name: "SaraJewelleryShop" },
    freeDelivery: true
  },
  { 
    id: 'jp7', 
    title: 'Sterling Silver Double Conch Clicker Hoop', 
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500', 
    price: 22030, 
    originalPrice: 31480, 
    discountBadge: '30% off', 
    rating: 4.9, 
    ratingCount: 192257, 
    seller: { ...MOCK_SELLER, name: "Elevado" },
    isStarSeller: true,
    freeDelivery: false
  },
  { 
    id: 'jp8', 
    title: '14k Gold Filled Hoop Earring Set, Silver, Real', 
    image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&q=80&w=500', 
    price: 5000, 
    originalPrice: 10000, 
    discountBadge: '50% off', 
    rating: 4.8, 
    ratingCount: 14171, 
    seller: { ...MOCK_SELLER, name: "OntarioJewelry" },
    freeDelivery: true
  },
  { 
    id: 'jp9', 
    title: '20G/18G/16G Seamless Gold Conch Clicker', 
    image: 'https://images.unsplash.com/photo-1617038220319-33fc2e605273?auto=format&fit=crop&q=80&w=500', 
    price: 17500, 
    originalPrice: 25000, 
    discountBadge: '30% off', 
    rating: 4.8, 
    ratingCount: 38567, 
    seller: { ...MOCK_SELLER, name: "EnchantByErika" },
    freeDelivery: false
  },
  { 
    id: 'jp10', 
    title: 'Personalized Birth Flower Ring, Dainty Custom', 
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500', 
    price: 19300, 
    originalPrice: 32160, 
    discountBadge: '40% off', 
    rating: 4.7, 
    ratingCount: 205, 
    seller: { ...MOCK_SELLER, name: "Xingora" },
    freeDelivery: true
  },
  { 
    id: 'jp11', 
    title: '16G/18G/20G Implant Grade Titanium Hinged', 
    image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=500', 
    price: 11790, 
    originalPrice: 15720, 
    discountBadge: '25% off', 
    rating: 4.9, 
    ratingCount: 110038, 
    seller: { ...MOCK_SELLER, name: "OuferJewelry" },
    isStarSeller: true,
    freeDelivery: false
  },
  { 
    id: 'jp12', 
    title: 'Tiny Huggie Hoop Earrings - 925 Sterling Silv...', 
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=500', 
    price: 18790, 
    originalPrice: 25050, 
    discountBadge: '25% off', 
    rating: 4.8, 
    ratingCount: 6915, 
    seller: { ...MOCK_SELLER, name: "SaltaireFineJewelry" },
    freeDelivery: true
  }
];
