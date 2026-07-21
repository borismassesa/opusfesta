import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface ChecklistCategory {
  id: string;
  label: string;
  icon: IoniconName;
  /** Accent used for the category's icon, keeping the list scannable. */
  color: string;
}

export interface ChecklistTask {
  /** Stable across releases — completion is stored against this, so never
   *  renumber or reuse a key once shipped. */
  key: string;
  categoryId: string;
  title: string;
  /** Months before the wedding this is due. 12 = a year out, 0 = the month of. */
  monthsBefore: number;
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  { id: 'venue', label: 'Venue', icon: 'location', color: '#E0A82E' },
  { id: 'website', label: 'Wedding website', icon: 'globe', color: '#D4569B' },
  { id: 'photos', label: 'Photos & videos', icon: 'camera', color: '#7FA9E0' },
  { id: 'food', label: 'Food & drink', icon: 'restaurant', color: '#E07B3C' },
  { id: 'attire', label: 'Attire', icon: 'shirt', color: '#E0A82E' },
  { id: 'music', label: 'Music', icon: 'musical-notes', color: '#D4569B' },
  { id: 'flowers', label: 'Flowers & decor', icon: 'flower', color: '#7FA9E0' },
  { id: 'registry', label: 'Registry', icon: 'gift', color: '#E07B3C' },
  { id: 'invitations', label: 'Invitations & paper', icon: 'mail', color: '#E0A82E' },
  { id: 'beauty', label: 'Beauty', icon: 'heart', color: '#D4569B' },
  { id: 'ceremony', label: 'Ceremony', icon: 'notifications', color: '#7FA9E0' },
  { id: 'guests', label: 'Guests', icon: 'people', color: '#E07B3C' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#E0A82E' },
  { id: 'details', label: 'Details', icon: 'wine', color: '#D4569B' },
];

/**
 * The built-in wedding checklist. Tasks live in code rather than a per-couple
 * table: they're the same for everyone, so only the couple's *progress* is
 * stored (on-device, see useChecklist). `monthsBefore` is an offset rather
 * than a date, so the same catalogue works for any wedding date — and for
 * couples with no date set, where the month grouping is simply hidden.
 *
 * Wording is written for the Tanzanian market (send-off, kitchen party,
 * mobile-money deposits) rather than copied from a US checklist.
 */
export const CHECKLIST_TASKS: ChecklistTask[] = [
  // Venue
  { key: 'venue-budget', categoryId: 'venue', title: 'Set your venue budget', monthsBefore: 12 },
  { key: 'venue-guest-estimate', categoryId: 'venue', title: 'Estimate your guest count', monthsBefore: 12 },
  { key: 'venue-shortlist', categoryId: 'venue', title: 'Shortlist venues you love', monthsBefore: 11 },
  { key: 'venue-visits', categoryId: 'venue', title: 'Visit your top venues', monthsBefore: 10 },
  { key: 'venue-compare', categoryId: 'venue', title: 'Compare quotes and packages', monthsBefore: 10 },
  { key: 'venue-book', categoryId: 'venue', title: 'Book your venue and pay the deposit', monthsBefore: 9 },
  { key: 'venue-reception', categoryId: 'venue', title: 'Confirm your reception hall', monthsBefore: 9 },
  { key: 'venue-sendoff', categoryId: 'venue', title: 'Choose a send-off venue', monthsBefore: 6 },
  { key: 'venue-walkthrough', categoryId: 'venue', title: 'Do a final walkthrough', monthsBefore: 1 },

  // Wedding website
  { key: 'website-claim', categoryId: 'website', title: 'Create your wedding website', monthsBefore: 9 },
  { key: 'website-story', categoryId: 'website', title: 'Add your story and photos', monthsBefore: 8 },
  { key: 'website-details', categoryId: 'website', title: 'Add venue, date and directions', monthsBefore: 8 },
  { key: 'website-rsvp', categoryId: 'website', title: 'Turn on RSVPs', monthsBefore: 6 },
  { key: 'website-share', categoryId: 'website', title: 'Share your link with guests', monthsBefore: 5 },
  { key: 'website-final', categoryId: 'website', title: 'Update with day-of details', monthsBefore: 1 },

  // Photos & videos
  { key: 'photos-budget', categoryId: 'photos', title: 'Set your photo and video budget', monthsBefore: 11 },
  { key: 'photos-shortlist', categoryId: 'photos', title: 'Shortlist photographers', monthsBefore: 10 },
  { key: 'photos-galleries', categoryId: 'photos', title: 'Review full galleries, not just highlights', monthsBefore: 10 },
  { key: 'photos-book', categoryId: 'photos', title: 'Book your photographer', monthsBefore: 8 },
  { key: 'photos-video', categoryId: 'photos', title: 'Book your videographer', monthsBefore: 8 },
  { key: 'photos-engagement', categoryId: 'photos', title: 'Plan an engagement shoot', monthsBefore: 6 },
  { key: 'photos-shotlist', categoryId: 'photos', title: 'Write your must-have shot list', monthsBefore: 2 },
  { key: 'photos-timeline', categoryId: 'photos', title: 'Share the timeline with your photographer', monthsBefore: 1 },

  // Food & drink
  { key: 'food-style', categoryId: 'food', title: 'Decide on your catering style', monthsBefore: 10 },
  { key: 'food-shortlist', categoryId: 'food', title: 'Shortlist caterers', monthsBefore: 9 },
  { key: 'food-tasting', categoryId: 'food', title: 'Arrange a tasting', monthsBefore: 7 },
  { key: 'food-book', categoryId: 'food', title: 'Book your caterer', monthsBefore: 7 },
  { key: 'food-menu', categoryId: 'food', title: 'Finalise your menu', monthsBefore: 3 },
  { key: 'food-drinks', categoryId: 'food', title: 'Plan drinks and soft drinks', monthsBefore: 3 },
  { key: 'food-cake', categoryId: 'food', title: 'Order your cake', monthsBefore: 2 },

  // Attire
  { key: 'attire-budget', categoryId: 'attire', title: 'Set your attire budget', monthsBefore: 10 },
  { key: 'attire-shop', categoryId: 'attire', title: 'Start shopping for your outfits', monthsBefore: 9 },
  { key: 'attire-order', categoryId: 'attire', title: 'Order your wedding outfits', monthsBefore: 6 },
  { key: 'attire-party', categoryId: 'attire', title: 'Choose the wedding party outfits', monthsBefore: 5 },
  { key: 'attire-fitting', categoryId: 'attire', title: 'Book your fittings', monthsBefore: 2 },
  { key: 'attire-final-fitting', categoryId: 'attire', title: 'Final fitting and collection', monthsBefore: 1 },

  // Music
  { key: 'music-style', categoryId: 'music', title: 'Decide on DJ, band or both', monthsBefore: 9 },
  { key: 'music-shortlist', categoryId: 'music', title: 'Shortlist DJs and bands', monthsBefore: 8 },
  { key: 'music-book', categoryId: 'music', title: 'Book your entertainment', monthsBefore: 7 },
  { key: 'music-mc', categoryId: 'music', title: 'Book your MC', monthsBefore: 6 },
  { key: 'music-ceremony', categoryId: 'music', title: 'Choose your ceremony music', monthsBefore: 3 },
  { key: 'music-firstdance', categoryId: 'music', title: 'Pick your first dance song', monthsBefore: 2 },
  { key: 'music-playlist', categoryId: 'music', title: 'Share your playlist and do-not-play list', monthsBefore: 1 },

  // Flowers & decor
  { key: 'flowers-vision', categoryId: 'flowers', title: 'Settle on your colours and style', monthsBefore: 9 },
  { key: 'flowers-shortlist', categoryId: 'flowers', title: 'Shortlist florists and decorators', monthsBefore: 7 },
  { key: 'flowers-book', categoryId: 'flowers', title: 'Book your florist', monthsBefore: 5 },
  { key: 'flowers-bouquets', categoryId: 'flowers', title: 'Choose bouquets and buttonholes', monthsBefore: 3 },
  { key: 'flowers-centrepieces', categoryId: 'flowers', title: 'Plan your centrepieces', monthsBefore: 3 },
  { key: 'flowers-delivery', categoryId: 'flowers', title: 'Confirm delivery and setup times', monthsBefore: 1 },

  // Registry
  { key: 'registry-open', categoryId: 'registry', title: 'Decide what to ask guests for', monthsBefore: 8 },
  { key: 'registry-create', categoryId: 'registry', title: 'Set up your gift registry', monthsBefore: 7 },
  { key: 'registry-payment', categoryId: 'registry', title: 'Add your mobile money details', monthsBefore: 7 },
  { key: 'registry-share', categoryId: 'registry', title: 'Share your registry with guests', monthsBefore: 5 },

  // Invitations & paper
  { key: 'inv-browse', categoryId: 'invitations', title: 'Browse invitation designs', monthsBefore: 9 },
  { key: 'inv-save', categoryId: 'invitations', title: 'Save the designs you love', monthsBefore: 9 },
  { key: 'inv-package', categoryId: 'invitations', title: 'Choose your invitation package', monthsBefore: 8 },
  { key: 'inv-wording', categoryId: 'invitations', title: 'Write your invitation wording', monthsBefore: 7 },
  { key: 'inv-swahili', categoryId: 'invitations', title: 'Check the Kiswahili wording reads well', monthsBefore: 7 },
  { key: 'inv-proof', categoryId: 'invitations', title: 'Approve your proof', monthsBefore: 6 },
  { key: 'inv-savedate', categoryId: 'invitations', title: 'Send your save the dates', monthsBefore: 8 },
  { key: 'inv-order', categoryId: 'invitations', title: 'Place your invitation order', monthsBefore: 6 },
  { key: 'inv-prints', categoryId: 'invitations', title: 'Order printed cards for elders', monthsBefore: 5 },
  { key: 'inv-addresses', categoryId: 'invitations', title: 'Collect guest phone numbers', monthsBefore: 5 },
  { key: 'inv-send', categoryId: 'invitations', title: 'Send your invitations', monthsBefore: 4 },
  { key: 'inv-track', categoryId: 'invitations', title: 'Track who has opened their invite', monthsBefore: 3 },
  { key: 'inv-remind', categoryId: 'invitations', title: 'Remind guests who have not replied', monthsBefore: 2 },
  { key: 'inv-programme', categoryId: 'invitations', title: 'Design your ceremony programme', monthsBefore: 2 },
  { key: 'inv-menus', categoryId: 'invitations', title: 'Order menus and place cards', monthsBefore: 2 },
  { key: 'inv-seating-cards', categoryId: 'invitations', title: 'Order your seating chart', monthsBefore: 1 },
  { key: 'inv-signage', categoryId: 'invitations', title: 'Order day-of signage', monthsBefore: 1 },
  { key: 'inv-michango', categoryId: 'invitations', title: 'Prepare kadi za michango if you need them', monthsBefore: 6 },
  { key: 'inv-thanks-design', categoryId: 'invitations', title: 'Choose your thank you card design', monthsBefore: 1 },
  { key: 'inv-thanks-order', categoryId: 'invitations', title: 'Order thank you cards', monthsBefore: 0 },
  { key: 'inv-thanks-send', categoryId: 'invitations', title: 'Send thank you cards', monthsBefore: 0 },

  // Beauty
  { key: 'beauty-trials', categoryId: 'beauty', title: 'Book hair and makeup trials', monthsBefore: 4 },
  { key: 'beauty-book', categoryId: 'beauty', title: 'Book your hair and makeup artist', monthsBefore: 3 },
  { key: 'beauty-schedule', categoryId: 'beauty', title: 'Agree the morning schedule', monthsBefore: 1 },

  // Ceremony
  { key: 'ceremony-officiant', categoryId: 'ceremony', title: 'Confirm your officiant', monthsBefore: 9 },
  { key: 'ceremony-church', categoryId: 'ceremony', title: 'Book the church or mosque', monthsBefore: 9 },
  { key: 'ceremony-counselling', categoryId: 'ceremony', title: 'Attend marriage counselling', monthsBefore: 6 },
  { key: 'ceremony-paperwork', categoryId: 'ceremony', title: 'Start your marriage paperwork', monthsBefore: 5 },
  { key: 'ceremony-rita', categoryId: 'ceremony', title: 'Register your notice of marriage', monthsBefore: 3 },
  { key: 'ceremony-order', categoryId: 'ceremony', title: 'Plan the order of service', monthsBefore: 3 },
  { key: 'ceremony-readings', categoryId: 'ceremony', title: 'Choose your readings', monthsBefore: 2 },
  { key: 'ceremony-vows', categoryId: 'ceremony', title: 'Write your vows', monthsBefore: 2 },
  { key: 'ceremony-rings', categoryId: 'ceremony', title: 'Order your rings', monthsBefore: 3 },
  { key: 'ceremony-rings-collect', categoryId: 'ceremony', title: 'Collect your rings', monthsBefore: 1 },
  { key: 'ceremony-witnesses', categoryId: 'ceremony', title: 'Confirm your witnesses', monthsBefore: 2 },
  { key: 'ceremony-rehearse', categoryId: 'ceremony', title: 'Rehearse your ceremony', monthsBefore: 0 },
  { key: 'ceremony-certificate', categoryId: 'ceremony', title: 'Hand off the marriage certificate', monthsBefore: 0 },
  { key: 'ceremony-kitchen-party', categoryId: 'ceremony', title: 'Plan your kitchen party', monthsBefore: 4 },

  // Guests
  { key: 'guests-draft', categoryId: 'guests', title: 'Draft your guest list', monthsBefore: 11 },
  { key: 'guests-families', categoryId: 'guests', title: 'Agree numbers with both families', monthsBefore: 10 },
  { key: 'guests-add', categoryId: 'guests', title: 'Add guests to the app', monthsBefore: 8 },
  { key: 'guests-groups', categoryId: 'guests', title: 'Group guests by family and friends', monthsBefore: 7 },
  { key: 'guests-party', categoryId: 'guests', title: 'Choose your wedding party', monthsBefore: 8 },
  { key: 'guests-contacts', categoryId: 'guests', title: 'Collect missing phone numbers', monthsBefore: 5 },
  { key: 'guests-events', categoryId: 'guests', title: 'Decide who is invited to which event', monthsBefore: 5 },
  { key: 'guests-rsvp-open', categoryId: 'guests', title: 'Open RSVPs', monthsBefore: 4 },
  { key: 'guests-rsvp-chase', categoryId: 'guests', title: 'Chase outstanding RSVPs', monthsBefore: 2 },
  { key: 'guests-headcount', categoryId: 'guests', title: 'Confirm your final headcount', monthsBefore: 1 },
  { key: 'guests-seating', categoryId: 'guests', title: 'Create your seating chart', monthsBefore: 1 },

  // Travel
  { key: 'travel-accom', categoryId: 'travel', title: 'Block rooms for out-of-town guests', monthsBefore: 6 },
  { key: 'travel-share', categoryId: 'travel', title: 'Share accommodation options', monthsBefore: 5 },
  { key: 'travel-cars', categoryId: 'travel', title: 'Book wedding cars', monthsBefore: 4 },
  { key: 'travel-guest-transport', categoryId: 'travel', title: 'Arrange guest transport', monthsBefore: 3 },
  { key: 'travel-honeymoon-idea', categoryId: 'travel', title: 'Decide where to honeymoon', monthsBefore: 6 },
  { key: 'travel-honeymoon-book', categoryId: 'travel', title: 'Book your honeymoon', monthsBefore: 4 },
  { key: 'travel-passports', categoryId: 'travel', title: 'Check passports and visas', monthsBefore: 4 },
  { key: 'travel-pack', categoryId: 'travel', title: 'Pack for your honeymoon', monthsBefore: 0 },
  { key: 'travel-routes', categoryId: 'travel', title: 'Confirm routes and pickup times', monthsBefore: 1 },

  // Details
  { key: 'details-budget-track', categoryId: 'details', title: 'Track your budget as you book', monthsBefore: 11 },
  { key: 'details-planner', categoryId: 'details', title: 'Decide if you want a planner', monthsBefore: 10 },
  { key: 'details-insurance', categoryId: 'details', title: 'Read every vendor contract', monthsBefore: 7 },
  { key: 'details-timeline', categoryId: 'details', title: 'Build your day-of timeline', monthsBefore: 2 },
  { key: 'details-favours', categoryId: 'details', title: 'Choose guest favours', monthsBefore: 2 },
  { key: 'details-payments', categoryId: 'details', title: 'Schedule final vendor payments', monthsBefore: 1 },
  { key: 'details-emergency', categoryId: 'details', title: 'Pack an emergency kit', monthsBefore: 0 },
  { key: 'details-handover', categoryId: 'details', title: 'Hand decor over to your venue', monthsBefore: 0 },
];

export const TOTAL_CHECKLIST_TASKS = CHECKLIST_TASKS.length;

export function categoryById(id: string): ChecklistCategory | undefined {
  return CHECKLIST_CATEGORIES.find((c) => c.id === id);
}
