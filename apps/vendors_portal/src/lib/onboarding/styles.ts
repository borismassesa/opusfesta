type StyleOption = { id: string; label: string; body: string }

const FALLBACK: StyleOption[] = [
  {
    id: 'modern',
    label: 'Modern',
    body: 'Clean, contemporary aesthetic with refined details.',
  },
  {
    id: 'traditional',
    label: 'Traditional',
    body: 'Honors Tanzanian customs, family rituals, and time-tested craft.',
  },
  {
    id: 'fusion',
    label: 'Fusion',
    body: 'Blends traditional ceremonies with modern celebration.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    body: 'Premium experience with elevated detail at every touch.',
  },
]

const BY_CATEGORY: Record<string, StyleOption[]> = {
  videographer: [
    {
      id: 'cinematic',
      label: 'Cinematic',
      body: 'Blends emotion with striking shots to create a dramatic look and feel.',
    },
    {
      id: 'storytelling',
      label: 'Storytelling',
      body: 'Weaves together special moments to tell the story of the couple’s wedding.',
    },
    {
      id: 'classic',
      label: 'Classic',
      body: 'Follows the couple through all major moments of their ceremony and reception.',
    },
    {
      id: 'documentary',
      label: 'Documentary',
      body: 'Captures intimate, organic moments and behind-the-scenes snippets.',
    },
    {
      id: 'vintage',
      label: 'Vintage',
      body: 'Mimics the nostalgic look and feel of films from decades past.',
    },
  ],
  photographer: [
    {
      id: 'editorial',
      label: 'Editorial',
      body: 'Magazine-style poses with crisp light and confident composition.',
    },
    {
      id: 'photojournalistic',
      label: 'Photojournalistic',
      body: 'Candid, in-the-moment storytelling — minimal direction.',
    },
    {
      id: 'fine-art',
      label: 'Fine art',
      body: 'Soft, painterly tones with timeless framing.',
    },
    {
      id: 'classic',
      label: 'Classic',
      body: 'Traditional posed portraits and full coverage of every milestone.',
    },
    {
      id: 'documentary',
      label: 'Documentary',
      body: 'Honest, unposed coverage of the day as it unfolds.',
    },
  ],
  florist: [
    { id: 'romantic', label: 'Romantic', body: 'Soft palettes, lush garlands, and trailing greenery.' },
    { id: 'tropical', label: 'Tropical', body: 'Bold blooms and lush leaves — perfect for coastal celebrations.' },
    { id: 'minimalist', label: 'Minimalist', body: 'Single-stem accents and architectural arrangements.' },
    { id: 'classic', label: 'Classic', body: 'Timeless centerpieces with traditional palettes.' },
  ],
  cakes: [
    { id: 'classic', label: 'Classic', body: 'Tiered buttercream with traditional florals.' },
    { id: 'modern', label: 'Modern', body: 'Sculptural shapes and minimalist finishes.' },
    { id: 'tropical', label: 'Tropical', body: 'Bold flavors and colorful coastal-inspired designs.' },
    { id: 'rustic', label: 'Rustic', body: 'Naked tiers, fresh fruit, and natural textures.' },
  ],
  planner: [
    { id: 'modern', label: 'Modern', body: 'Refined, contemporary celebrations with clean design.' },
    { id: 'traditional', label: 'Traditional', body: 'Honoring family rituals and Tanzanian customs.' },
    { id: 'destination', label: 'Destination', body: 'Multi-day celebrations across Zanzibar, Arusha, or beyond.' },
    { id: 'luxury', label: 'Luxury', body: 'High-touch design with premium suppliers.' },
  ],
}

export function getStylesForCategory(categoryId: string | null | undefined): StyleOption[] {
  if (!categoryId) return FALLBACK
  return BY_CATEGORY[categoryId] ?? FALLBACK
}
