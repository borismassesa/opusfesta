type StyleOption = { id: string; label: string; label_sw: string; body: string; body_sw: string }

const FALLBACK: StyleOption[] = [
  {
    id: 'modern',
    label: 'Modern',
    label_sw: 'Kisasa',
    body: 'Clean, contemporary aesthetic with refined details.',
    body_sw: 'Mtindo wa kisasa wenye maelezo safi na ya kupendeza.',
  },
  {
    id: 'traditional',
    label: 'Traditional',
    label_sw: 'Kimila',
    body: 'Honors Tanzanian customs, family rituals, and time-tested craft.',
    body_sw: 'Huheshimu mila za Kitanzania, taratibu za familia, na ufundi wa muda mrefu.',
  },
  {
    id: 'fusion',
    label: 'Fusion',
    label_sw: 'Mchanganyiko',
    body: 'Blends traditional ceremonies with modern celebration.',
    body_sw: 'Huchanganya sherehe za kimila na sherehe za kisasa.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    label_sw: 'Anasa',
    body: 'Premium experience with elevated detail at every touch.',
    body_sw: 'Uzoefu wa hali ya juu wenye maelezo bora katika kila hatua.',
  },
]

const BY_CATEGORY: Record<string, StyleOption[]> = {
  videographer: [
    {
      id: 'cinematic',
      label: 'Cinematic',
      label_sw: 'Kisinema',
      body: 'Blends emotion with striking shots to create a dramatic look and feel.',
      body_sw: 'Huchanganya hisia na picha za kuvutia kuunda mwonekano wa kuvutia.',
    },
    {
      id: 'storytelling',
      label: 'Storytelling',
      label_sw: 'Kusimulia hadithi',
      body: 'Weaves together special moments to tell the story of the couple’s wedding.',
      body_sw: 'Huunganisha matukio maalum kusimulia hadithi ya harusi ya wanandoa.',
    },
    {
      id: 'classic',
      label: 'Classic',
      label_sw: 'Asilia',
      body: 'Follows the couple through all major moments of their ceremony and reception.',
      body_sw: 'Hufuatilia wanandoa katika matukio yote makuu ya sherehe na mapokezi.',
    },
    {
      id: 'documentary',
      label: 'Documentary',
      label_sw: 'Maandishi',
      body: 'Captures intimate, organic moments and behind-the-scenes snippets.',
      body_sw: 'Hunasa matukio ya karibu, ya asili na vipande vya nyuma ya pazia.',
    },
    {
      id: 'vintage',
      label: 'Vintage',
      label_sw: 'Mtindo wa zamani',
      body: 'Mimics the nostalgic look and feel of films from decades past.',
      body_sw: 'Huiga mwonekano wa kumbukumbu wa filamu za miaka iliyopita.',
    },
  ],
  photographer: [
    {
      id: 'editorial',
      label: 'Editorial',
      label_sw: 'Kimagazeti',
      body: 'Magazine-style poses with crisp light and confident composition.',
      body_sw: 'Mikao ya kimagazeti yenye mwanga safi na muundo wa kujiamini.',
    },
    {
      id: 'photojournalistic',
      label: 'Photojournalistic',
      label_sw: 'Kihabari',
      body: 'Candid, in-the-moment storytelling with minimal direction.',
      body_sw: 'Kunasa matukio halisi papo hapo kwa maelekezo machache.',
    },
    {
      id: 'fine-art',
      label: 'Fine art',
      label_sw: 'Sanaa nzuri',
      body: 'Soft, painterly tones with timeless framing.',
      body_sw: 'Rangi laini za kichoraji na mpangilio usiopitwa na wakati.',
    },
    {
      id: 'classic',
      label: 'Classic',
      label_sw: 'Asilia',
      body: 'Traditional posed portraits and full coverage of every milestone.',
      body_sw: 'Picha za mikao ya kawaida na ufuatiliaji kamili wa kila hatua.',
    },
    {
      id: 'documentary',
      label: 'Documentary',
      label_sw: 'Maandishi',
      body: 'Honest, unposed coverage of the day as it unfolds.',
      body_sw: 'Ufuatiliaji wa kweli, usio na mikao wa siku kadri inavyoendelea.',
    },
  ],
  florist: [
    { id: 'romantic', label: 'Romantic', label_sw: 'Kimapenzi', body: 'Soft palettes, lush garlands, and trailing greenery.', body_sw: 'Rangi laini, mashada mazuri, na majani yanayoning’inia.' },
    { id: 'tropical', label: 'Tropical', label_sw: 'Kitropiki', body: 'Bold blooms and lush leaves, perfect for coastal celebrations.', body_sw: 'Maua makubwa na majani mazuri, yanafaa kwa sherehe za pwani.' },
    { id: 'minimalist', label: 'Minimalist', label_sw: 'Sahili', body: 'Single-stem accents and architectural arrangements.', body_sw: 'Maua ya tawi moja na mipangilio ya kiusanifu.' },
    { id: 'classic', label: 'Classic', label_sw: 'Asilia', body: 'Timeless centerpieces with traditional palettes.', body_sw: 'Mapambo yasiyopitwa na wakati yenye rangi za kimila.' },
  ],
  cakes: [
    { id: 'classic', label: 'Classic', label_sw: 'Asilia', body: 'Tiered buttercream with traditional florals.', body_sw: 'Keki ya ngazi yenye krimu na maua ya kimila.' },
    { id: 'modern', label: 'Modern', label_sw: 'Kisasa', body: 'Sculptural shapes and minimalist finishes.', body_sw: 'Maumbo ya kisanaa na umaliziaji sahili.' },
    { id: 'tropical', label: 'Tropical', label_sw: 'Kitropiki', body: 'Bold flavors and colorful coastal-inspired designs.', body_sw: 'Ladha kali na miundo ya rangi iliyovuviwa na pwani.' },
    { id: 'rustic', label: 'Rustic', label_sw: 'Kiasili', body: 'Naked tiers, fresh fruit, and natural textures.', body_sw: 'Ngazi wazi, matunda mabichi, na muundo wa asili.' },
  ],
  planner: [
    { id: 'modern', label: 'Modern', label_sw: 'Kisasa', body: 'Refined, contemporary celebrations with clean design.', body_sw: 'Sherehe za kisasa zilizoboreshwa zenye muundo safi.' },
    { id: 'traditional', label: 'Traditional', label_sw: 'Kimila', body: 'Honoring family rituals and Tanzanian customs.', body_sw: 'Kuheshimu taratibu za familia na mila za Kitanzania.' },
    { id: 'destination', label: 'Destination', label_sw: 'Eneo maalum', body: 'Multi-day celebrations across Zanzibar, Arusha, or beyond.', body_sw: 'Sherehe za siku nyingi Zanzibar, Arusha, au kwingineko.' },
    { id: 'luxury', label: 'Luxury', label_sw: 'Anasa', body: 'High-touch design with premium suppliers.', body_sw: 'Muundo wa hali ya juu na wasambazaji bora.' },
  ],
}

export function getStylesForCategory(categoryId: string | null | undefined): StyleOption[] {
  if (!categoryId) return FALLBACK
  return BY_CATEGORY[categoryId] ?? FALLBACK
}
