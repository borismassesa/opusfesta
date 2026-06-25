type ServiceOption = { id: string; label: string; label_sw: string }

const COMMON: ServiceOption[] = [
  { id: 'travel', label: 'Travel to other regions', label_sw: 'Kusafiri mikoa mingine' },
  { id: 'weekday', label: 'Weekday events', label_sw: 'Matukio ya siku za kazi' },
  { id: 'extra-hours', label: 'Extra hours', label_sw: 'Saa za ziada' },
]

const BY_CATEGORY: Record<string, ServiceOption[]> = {
  videographer: [
    { id: 'drone', label: 'Drone coverage', label_sw: 'Upigaji wa droni' },
    { id: 'livestream', label: 'Livestream services', label_sw: 'Huduma za matangazo ya moja kwa moja' },
    { id: 'engagement-reel', label: 'Engagement reel', label_sw: 'Video fupi ya uchumba' },
    { id: 'same-day-edit', label: 'Same-day editing', label_sw: 'Uhariri wa siku hiyo hiyo' },
    { id: 'next-day-edit', label: 'Next-day editing', label_sw: 'Uhariri wa siku inayofuata' },
    { id: 'film', label: 'Film / vintage stock', label_sw: 'Filamu / mtindo wa zamani' },
  ],
  photographer: [
    { id: 'engagement-shoot', label: 'Engagement shoot', label_sw: 'Picha za uchumba' },
    { id: 'second-shooter', label: 'Second shooter', label_sw: 'Mpiga picha msaidizi' },
    { id: 'printed-album', label: 'Printed album', label_sw: 'Albamu iliyochapishwa' },
    { id: 'photo-booth', label: 'Photo booth', label_sw: 'Kibanda cha picha' },
    { id: 'next-day-preview', label: 'Next-day preview gallery', label_sw: 'Matunzio ya awali ya siku inayofuata' },
  ],
  venue: [
    { id: 'in-house-catering', label: 'In-house catering', label_sw: 'Huduma ya chakula ya ndani' },
    { id: 'lodging', label: 'On-site lodging', label_sw: 'Malazi eneo la tukio' },
    { id: 'parking', label: 'Guest parking', label_sw: 'Maegesho ya wageni' },
    { id: 'outdoor', label: 'Outdoor ceremony space', label_sw: 'Eneo la sherehe la nje' },
    { id: 'sound-system', label: 'Sound system included', label_sw: 'Mfumo wa sauti umejumuishwa' },
  ],
  caterer: [
    { id: 'bar-service', label: 'Bar service', label_sw: 'Huduma ya baa' },
    { id: 'tasting', label: 'Tasting session', label_sw: 'Kipindi cha kuonja' },
    { id: 'halal', label: 'Halal options', label_sw: 'Chaguo za halali' },
    { id: 'vegetarian', label: 'Vegetarian / vegan', label_sw: 'Mboga / vegan' },
    { id: 'live-cooking', label: 'Live cooking station', label_sw: 'Kituo cha kupika papo hapo' },
  ],
  cakes: [
    { id: 'tasting', label: 'Cake tasting', label_sw: 'Kuonja keki' },
    { id: 'delivery', label: 'Delivery & setup', label_sw: 'Usafirishaji na upangaji' },
    { id: 'custom-design', label: 'Custom design consult', label_sw: 'Ushauri wa muundo maalum' },
    { id: 'gluten-free', label: 'Gluten-free / dairy-free', label_sw: 'Bila gluteni / bila maziwa' },
  ],
  florist: [
    { id: 'bouquets', label: 'Bridal bouquets', label_sw: 'Mashada ya bibi harusi' },
    { id: 'arches', label: 'Ceremony arches', label_sw: 'Matao ya sherehe' },
    { id: 'centerpieces', label: 'Reception centerpieces', label_sw: 'Mapambo ya meza za sherehe' },
    { id: 'rentals', label: 'Vase / structure rentals', label_sw: 'Ukodishaji wa vyombo / miundo' },
  ],
  planner: [
    { id: 'full-service', label: 'Full-service planning', label_sw: 'Upangaji kamili' },
    { id: 'day-of', label: 'Day-of coordination', label_sw: 'Uratibu wa siku ya tukio' },
    { id: 'design', label: 'Design & styling', label_sw: 'Ubunifu na upambaji' },
    { id: 'budget', label: 'Budget management', label_sw: 'Usimamizi wa bajeti' },
  ],
  musician: [
    { id: 'live-band', label: 'Live band', label_sw: 'Bendi ya moja kwa moja' },
    { id: 'mc', label: 'MC services', label_sw: 'Huduma za MC' },
    { id: 'sound-rig', label: 'Sound system rental', label_sw: 'Ukodishaji wa mfumo wa sauti' },
    { id: 'lighting', label: 'Lighting package', label_sw: 'Kifurushi cha taa' },
  ],
  officiant: [
    { id: 'religious', label: 'Religious ceremony', label_sw: 'Sherehe ya kidini' },
    { id: 'civil', label: 'Civil ceremony', label_sw: 'Sherehe ya kiserikali' },
    { id: 'traditional', label: 'Traditional ceremony', label_sw: 'Sherehe ya kimila' },
    { id: 'rehearsal', label: 'Rehearsal session', label_sw: 'Kipindi cha mazoezi' },
  ],
  extras: [
    { id: 'photo-booth', label: 'Photo booth', label_sw: 'Kibanda cha picha' },
    { id: 'transport', label: 'Guest transport', label_sw: 'Usafiri wa wageni' },
    { id: 'security', label: 'Security', label_sw: 'Ulinzi' },
    { id: 'lighting', label: 'Lighting & uplighting', label_sw: 'Taa na mwangaza' },
    { id: 'tents', label: 'Tents & marquees', label_sw: 'Mahema' },
  ],
  beauty: [
    { id: 'bridal-trial', label: 'Bridal trial', label_sw: 'Jaribio la urembo wa bibi harusi' },
    { id: 'bridesmaids', label: 'Bridesmaids package', label_sw: 'Kifurushi cha wasaidizi wa bibi harusi' },
    { id: 'on-location', label: 'On-location service', label_sw: 'Huduma eneo la tukio' },
    { id: 'touch-ups', label: 'All-day touch-ups', label_sw: 'Marekebisho ya siku nzima' },
  ],
}

export function getServicesForCategory(categoryId: string | null | undefined): ServiceOption[] {
  if (!categoryId) return COMMON
  const specific = BY_CATEGORY[categoryId] ?? []
  return [...specific, ...COMMON]
}
