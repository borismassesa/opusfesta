type ServiceOption = { id: string; label: string }

const COMMON: ServiceOption[] = [
  { id: 'travel', label: 'Travel to other regions' },
  { id: 'weekday', label: 'Weekday events' },
  { id: 'extra-hours', label: 'Extra hours' },
]

const BY_CATEGORY: Record<string, ServiceOption[]> = {
  videographer: [
    { id: 'drone', label: 'Drone coverage' },
    { id: 'livestream', label: 'Livestream services' },
    { id: 'engagement-reel', label: 'Engagement reel' },
    { id: 'same-day-edit', label: 'Same-day editing' },
    { id: 'next-day-edit', label: 'Next-day editing' },
    { id: 'film', label: 'Film / vintage stock' },
  ],
  photographer: [
    { id: 'engagement-shoot', label: 'Engagement shoot' },
    { id: 'second-shooter', label: 'Second shooter' },
    { id: 'printed-album', label: 'Printed album' },
    { id: 'photo-booth', label: 'Photo booth' },
    { id: 'next-day-preview', label: 'Next-day preview gallery' },
  ],
  venue: [
    { id: 'in-house-catering', label: 'In-house catering' },
    { id: 'lodging', label: 'On-site lodging' },
    { id: 'parking', label: 'Guest parking' },
    { id: 'outdoor', label: 'Outdoor ceremony space' },
    { id: 'sound-system', label: 'Sound system included' },
  ],
  caterer: [
    { id: 'bar-service', label: 'Bar service' },
    { id: 'tasting', label: 'Tasting session' },
    { id: 'halal', label: 'Halal options' },
    { id: 'vegetarian', label: 'Vegetarian / vegan' },
    { id: 'live-cooking', label: 'Live cooking station' },
  ],
  cakes: [
    { id: 'tasting', label: 'Cake tasting' },
    { id: 'delivery', label: 'Delivery & setup' },
    { id: 'custom-design', label: 'Custom design consult' },
    { id: 'gluten-free', label: 'Gluten-free / dairy-free' },
  ],
  florist: [
    { id: 'bouquets', label: 'Bridal bouquets' },
    { id: 'arches', label: 'Ceremony arches' },
    { id: 'centerpieces', label: 'Reception centerpieces' },
    { id: 'rentals', label: 'Vase / structure rentals' },
  ],
  planner: [
    { id: 'full-service', label: 'Full-service planning' },
    { id: 'day-of', label: 'Day-of coordination' },
    { id: 'design', label: 'Design & styling' },
    { id: 'budget', label: 'Budget management' },
  ],
  musician: [
    { id: 'live-band', label: 'Live band' },
    { id: 'mc', label: 'MC services' },
    { id: 'sound-rig', label: 'Sound system rental' },
    { id: 'lighting', label: 'Lighting package' },
  ],
  officiant: [
    { id: 'religious', label: 'Religious ceremony' },
    { id: 'civil', label: 'Civil ceremony' },
    { id: 'traditional', label: 'Traditional ceremony' },
    { id: 'rehearsal', label: 'Rehearsal session' },
  ],
  extras: [
    { id: 'photo-booth', label: 'Photo booth' },
    { id: 'transport', label: 'Guest transport' },
    { id: 'security', label: 'Security' },
    { id: 'lighting', label: 'Lighting & uplighting' },
    { id: 'tents', label: 'Tents & marquees' },
  ],
  beauty: [
    { id: 'bridal-trial', label: 'Bridal trial' },
    { id: 'bridesmaids', label: 'Bridesmaids package' },
    { id: 'on-location', label: 'On-location service' },
    { id: 'touch-ups', label: 'All-day touch-ups' },
  ],
}

export function getServicesForCategory(categoryId: string | null | undefined): ServiceOption[] {
  if (!categoryId) return COMMON
  const specific = BY_CATEGORY[categoryId] ?? []
  return [...specific, ...COMMON]
}
