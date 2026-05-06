export type Vendor = {
  name: string
  category: string
  location: string
  avatarUrl: string | null
}

export type CompletionSection = {
  id: string
  label: string
  done: boolean
}

export type LeadStat = {
  label: string
  value: string
  trend: string
  isPositive: boolean
  sub?: string
}

export type InquiryRow = {
  id: string
  couple: string
  date: string
  budget: string
  location: string
  status: 'new' | 'replied' | 'booked' | 'declined' | 'closed'
  avatarUrl: string
  email?: string
  phone?: string
  message?: string
  guestCount?: number
}

export type InsightPoint = { name: string; value: number }

export type BookingsRevenuePoint = {
  name: string
  bookings: number
  // Revenue in TZS (millions). Charted as Mn for legibility.
  revenue: number
}

export type LeadSource = { name: string; value: number; color: string }

export type Review = {
  id: string
  couple: string
  avatarUrl: string
  rating: number // 1–5
  packageName: string
  eventDate: string // YYYY-MM-DD
  reviewedAt: string // ISO datetime
  body: string
  photos?: string[]
  reply?: { body: string; repliedAt: string }
  isPinned?: boolean
}

export type ReviewInviteCandidate = {
  bookingId: string
  couple: string
  avatarUrl: string
  packageName: string
  eventDate: string
}

export type CalendarBookingStatus = 'pending' | 'confirmed' | 'completed'

export type CalendarBooking = {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM, 24h
  endTime: string
  couple: string
  packageName: string
  location: string
  status: CalendarBookingStatus
}

// Five user-facing stages for the vendor pipeline. The studio app uses the
// fuller canonical state machine (see `internalStatus`); the vendor portal
// rolls those into buckets that match the daily questions a vendor asks
// ("who hasn't paid me?", "whose contract isn't signed?").
export type BookingStage =
  | 'quoted'
  | 'reserved'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type BookingTimelineKind =
  | 'inquiry'
  | 'quote_sent'
  | 'quote_accepted'
  | 'contract_sent'
  | 'contract_signed'
  | 'deposit_paid'
  | 'confirmed'
  | 'message'
  | 'reschedule_requested'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'review_requested'
  | 'review_received'

export type BookingTimelineEntry = {
  at: string // ISO datetime
  kind: BookingTimelineKind
  label: string
}

export type BookingInternalStatus =
  | 'quote_sent'
  | 'quote_accepted'
  | 'contract_sent'
  | 'contract_signed'
  | 'deposit_pending'
  | 'confirmed'
  | 'reschedule_requested'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'

export type Booking = {
  id: string
  date: string // YYYY-MM-DD — event date
  startTime: string
  endTime: string
  couple: string // "Doreen & Mark"
  partnerA: string
  partnerB: string
  phone: string
  whatsapp: string
  email: string
  avatarUrl: string | null
  packageName: string
  location: string
  stage: BookingStage
  internalStatus: BookingInternalStatus
  // Money — TZS, integer shillings
  totalValue: number
  depositPercent: number
  depositPaid: boolean
  balanceDueDate: string | null // YYYY-MM-DD
  // Documents
  contractSentAt: string | null
  contractSigned: boolean
  invoiceIssued: boolean
  briefSubmitted: boolean
  // Reserve-stage hold
  slotHeldUntil: string | null // ISO datetime
  // Activity / messaging — link out to the lead thread
  leadId: string | null
  lastMessageAt: string | null // ISO datetime
  lastMessagePreview: string | null
  // Post-event
  reviewRequested: boolean
  reviewReceived: boolean
  timeline: BookingTimelineEntry[]
}

export const vendor: Vendor = {
  name: 'OpusFesta Photography',
  category: 'Photography',
  location: 'Dar es Salaam, Tanzania',
  avatarUrl: null,
}

export const completion: CompletionSection[] = [
  { id: 'overview', label: 'Business overview', done: true },
  { id: 'pricing', label: 'Pricing & packages', done: true },
  { id: 'photos', label: 'Photo gallery', done: true },
  { id: 'services', label: 'Services offered', done: false },
  { id: 'availability', label: 'Availability calendar', done: false },
  { id: 'faq', label: 'FAQ', done: false },
  { id: 'team', label: 'Team members', done: false },
  { id: 'reviews', label: 'Review requests', done: false },
]

export const leadStats: LeadStat[] = [
  { label: 'New inquiries', value: '12', trend: '+18%', isPositive: true, sub: 'This week' },
  { label: 'Conversion rate', value: '11.3%', trend: '+1.2pp', isPositive: true, sub: 'vs last month' },
  { label: 'Avg response time', value: '2h 14m', trend: '−22m', isPositive: true, sub: 'vs last month' },
  { label: 'Booked leads', value: '2', trend: '+1', isPositive: true, sub: 'This month' },
]

export const performanceStats: LeadStat[] = [
  { label: 'Profile views', value: '1,284', trend: '+18%', isPositive: true, sub: 'vs last month' },
  { label: 'Inquiry rate', value: '3.4%', trend: '+0.6%', isPositive: true, sub: 'vs last month' },
  { label: 'Response time', value: '2h 14m', trend: '-22m', isPositive: true, sub: 'vs last month' },
]

export const insights: InsightPoint[] = [
  { name: 'Jan', value: 420 },
  { name: 'Feb', value: 380 },
  { name: 'Mar', value: 610 },
  { name: 'Apr', value: 740 },
  { name: 'May', value: 820 },
  { name: 'Jun', value: 960 },
  { name: 'Jul', value: 1100 },
  { name: 'Aug', value: 840 },
  { name: 'Sep', value: 1240 },
  { name: 'Oct', value: 1080 },
  { name: 'Nov', value: 1160 },
  { name: 'Dec', value: 1284 },
]

export type ProfileViewsRange = 'day' | 'week' | 'month'

// Profile views by granularity. Day series = last 14 days; Week = last 12
// weeks; Month = last 12 months. Numbers are seasonal (Tanzania wedding
// season peaks Sep–Dec) and trend up on the longer windows.
export const profileViews: Record<ProfileViewsRange, InsightPoint[]> = {
  day: [
    { name: 'Mon 15', value: 38 },
    { name: 'Tue 16', value: 42 },
    { name: 'Wed 17', value: 55 },
    { name: 'Thu 18', value: 51 },
    { name: 'Fri 19', value: 67 },
    { name: 'Sat 20', value: 89 },
    { name: 'Sun 21', value: 76 },
    { name: 'Mon 22', value: 44 },
    { name: 'Tue 23', value: 49 },
    { name: 'Wed 24', value: 61 },
    { name: 'Thu 25', value: 58 },
    { name: 'Fri 26', value: 72 },
    { name: 'Sat 27', value: 95 },
    { name: 'Sun 28', value: 88 },
  ],
  week: [
    { name: 'W1', value: 280 },
    { name: 'W2', value: 305 },
    { name: 'W3', value: 290 },
    { name: 'W4', value: 340 },
    { name: 'W5', value: 360 },
    { name: 'W6', value: 410 },
    { name: 'W7', value: 395 },
    { name: 'W8', value: 430 },
    { name: 'W9', value: 470 },
    { name: 'W10', value: 460 },
    { name: 'W11', value: 510 },
    { name: 'W12', value: 545 },
  ],
  month: [
    { name: 'Jan', value: 420 },
    { name: 'Feb', value: 380 },
    { name: 'Mar', value: 610 },
    { name: 'Apr', value: 740 },
    { name: 'May', value: 820 },
    { name: 'Jun', value: 960 },
    { name: 'Jul', value: 1100 },
    { name: 'Aug', value: 840 },
    { name: 'Sep', value: 1240 },
    { name: 'Oct', value: 1080 },
    { name: 'Nov', value: 1160 },
    { name: 'Dec', value: 1284 },
  ],
}

export const bookingsRevenue: BookingsRevenuePoint[] = [
  { name: 'Jul', bookings: 2, revenue: 14 },
  { name: 'Aug', bookings: 3, revenue: 22 },
  { name: 'Sep', bookings: 5, revenue: 38 },
  { name: 'Oct', bookings: 4, revenue: 31 },
  { name: 'Nov', bookings: 6, revenue: 47 },
  { name: 'Dec', bookings: 7, revenue: 56 },
]

export const leadSources: LeadSource[] = [
  { name: 'Search', value: 58, color: '#7E5896' }, // lavender deep — anchor
  { name: 'Featured', value: 22, color: '#9FE870' }, // brand sage — pop
  { name: 'Direct', value: 14, color: '#F5C77E' }, // champagne — warm
  { name: 'Referral', value: 6, color: '#7BA7BC' }, // periwinkle — cool
]

export type FunnelStage = { name: string; value: number; color: string }

export const conversionFunnel: FunnelStage[] = [
  { name: 'Inquiries', value: 142, color: '#7E5896' },
  { name: 'Replied', value: 111, color: '#C9A0DC' },
  { name: 'Quoted', value: 48, color: '#F5C77E' },
  { name: 'Booked', value: 16, color: '#9FE870' },
]

export type ActionItem = {
  id: string
  type: 'overdue' | 'expiring' | 'event' | 'success'
  title: string
  sub: string
  href: string
}

export const actionItems: ActionItem[] = [
  {
    id: 'a1',
    type: 'overdue',
    title: 'Reply to Amani & Zuri',
    sub: 'Inquiry sat 28h — response time hurts ranking',
    href: '/leads/inq_001',
  },
  {
    id: 'a2',
    type: 'overdue',
    title: 'Reply to Kwame & Amina',
    sub: 'Inquiry sat 22h',
    href: '/leads/inq_002',
  },
  {
    id: 'a3',
    type: 'expiring',
    title: 'Quote expires for Neema & Joseph',
    sub: 'Hold released in 6h if not signed',
    href: '/leads/inq_003',
  },
  {
    id: 'a4',
    type: 'event',
    title: 'Wedding tomorrow: Doreen & Mark',
    sub: 'Saturday 27 Apr · Mlimani Park · 14:00',
    href: '/bookings/bk_004',
  },
  {
    id: 'a5',
    type: 'success',
    title: 'Deposit confirmed: Halima & Said',
    sub: 'TSh 1.5M via M-Pesa · payout Friday',
    href: '/bookings/bk_005',
  },
]

// Anchored relative to "today" so the bookings stay in the visible window when
// running the portal mock. Replace with real data once the Bookings module is
// wired to a backend.
function dateOffsetFromToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const sampleReviews: Review[] = [
  {
    id: 'rv_001',
    couple: 'Doreen & Mark',
    avatarUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=160&h=160&fit=crop',
    rating: 5,
    packageName: 'Signature',
    eventDate: '2026-03-14',
    reviewedAt: '2026-03-22T09:14:00.000Z',
    body:
      'Absolutely flawless. They captured the dance floor energy perfectly and the same-day teaser had our families crying. Communication leading up to the wedding was clear and warm — felt like working with friends.',
    photos: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
    ],
    reply: {
      body:
        'Thank you Doreen! Mlimani Park was magical — your guests brought the energy and you trusted us to chase the moments. Wishing you a lifetime of that joy.',
      repliedAt: '2026-03-23T11:00:00.000Z',
    },
    isPinned: true,
  },
  {
    id: 'rv_002',
    couple: 'Halima & Said',
    avatarUrl:
      'https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=160&h=160&fit=crop',
    rating: 5,
    packageName: 'Full Day',
    eventDate: '2026-02-08',
    reviewedAt: '2026-02-15T16:42:00.000Z',
    body:
      'Worth every shilling. The team arrived early, blended in with our guests, and delivered the full gallery in just over a week. The drone shots over the beach are unreal.',
    photos: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    ],
  },
  {
    id: 'rv_003',
    couple: 'Joseph & Neema',
    avatarUrl:
      'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=160&h=160&fit=crop',
    rating: 4,
    packageName: 'Essential',
    eventDate: '2026-01-21',
    reviewedAt: '2026-01-30T10:11:00.000Z',
    body:
      'Beautiful photos and we got our gallery within the promised window. One thing to mention — we wished there were a few more candid shots of guests during dinner, but the ceremony coverage was perfect.',
  },
  {
    id: 'rv_004',
    couple: 'Faraja & Idd',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop',
    rating: 5,
    packageName: 'Signature',
    eventDate: '2025-12-12',
    reviewedAt: '2025-12-20T08:30:00.000Z',
    body:
      'Asante sana! The henna ceremony coverage was tender — they understood the cultural beats and were never intrusive. Highly recommend to anyone planning a Tanzanian wedding.',
  },
  {
    id: 'rv_005',
    couple: 'Anna & Peter',
    avatarUrl:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=160&h=160&fit=crop',
    rating: 3,
    packageName: 'Essential',
    eventDate: '2025-11-02',
    reviewedAt: '2025-11-09T19:00:00.000Z',
    body:
      'The photos are nice but turnaround took a bit longer than the package promised — about three weeks instead of two. Otherwise the day-of crew was friendly and unobtrusive.',
  },
]

export const reviewInviteCandidates: ReviewInviteCandidate[] = [
  {
    bookingId: 'bk_completed_a',
    couple: 'Mariam & Tito',
    avatarUrl:
      'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=160&h=160&fit=crop',
    packageName: 'Full Day',
    eventDate: '2026-04-04',
  },
  {
    bookingId: 'bk_completed_b',
    couple: 'Lulu & Ben',
    avatarUrl:
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=160&h=160&fit=crop',
    packageName: 'Signature',
    eventDate: '2026-03-29',
  },
]

function isoOffsetFromNow(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

// Anchored to today so the pipeline always has live data. The 8 bookings
// span every stage so designers + reviewers can eyeball every variant.
export const bookings: Booking[] = [
  {
    id: 'bk_001',
    date: dateOffsetFromToday(4),
    startTime: '14:00',
    endTime: '20:00',
    couple: 'Doreen & Mark',
    partnerA: 'Doreen Mwakalindile',
    partnerB: 'Mark Otieno',
    phone: '+255 712 345 678',
    whatsapp: '+255 712 345 678',
    email: 'doreen.m@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=160&h=160&fit=crop',
    packageName: 'Signature',
    location: 'Mlimani Park, Dar es Salaam',
    stage: 'confirmed',
    internalStatus: 'confirmed',
    totalValue: 4_200_000,
    depositPercent: 50,
    depositPaid: true,
    balanceDueDate: dateOffsetFromToday(-3),
    contractSentAt: isoOffsetFromNow(-24 * 30),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: false,
    slotHeldUntil: null,
    leadId: 'inq_doreen',
    lastMessageAt: isoOffsetFromNow(-20),
    lastMessagePreview: 'Just confirming the venue lighting setup for the ceremony.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 60), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 55), kind: 'quote_sent', label: 'Quote sent · TZS 4.2M' },
      { at: isoOffsetFromNow(-24 * 50), kind: 'quote_accepted', label: 'Quote accepted' },
      { at: isoOffsetFromNow(-24 * 30), kind: 'contract_sent', label: 'Contract sent' },
      { at: isoOffsetFromNow(-24 * 28), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-24 * 27), kind: 'deposit_paid', label: 'Deposit received · TZS 2.1M' },
      { at: isoOffsetFromNow(-24 * 27 + 1), kind: 'confirmed', label: 'Booking confirmed' },
      { at: isoOffsetFromNow(-20), kind: 'message', label: 'Couple replied: lighting setup' },
    ],
  },
  {
    id: 'bk_002',
    date: dateOffsetFromToday(11),
    startTime: '11:00',
    endTime: '17:00',
    couple: 'Halima & Said',
    partnerA: 'Halima Juma',
    partnerB: 'Said Hassan',
    phone: '+255 754 998 211',
    whatsapp: '+255 754 998 211',
    email: 'halima.j@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=160&h=160&fit=crop',
    packageName: 'Full Day',
    location: 'Dar es Salaam',
    stage: 'confirmed',
    internalStatus: 'confirmed',
    totalValue: 6_800_000,
    depositPercent: 50,
    depositPaid: true,
    balanceDueDate: dateOffsetFromToday(4),
    contractSentAt: isoOffsetFromNow(-24 * 45),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: true,
    slotHeldUntil: null,
    leadId: 'inq_halima',
    lastMessageAt: isoOffsetFromNow(-72),
    lastMessagePreview: 'Sent over the venue map and parking notes.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 90), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 87), kind: 'quote_sent', label: 'Quote sent · TZS 6.8M' },
      { at: isoOffsetFromNow(-24 * 80), kind: 'quote_accepted', label: 'Quote accepted' },
      { at: isoOffsetFromNow(-24 * 45), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-24 * 44), kind: 'deposit_paid', label: 'Deposit received · TZS 3.4M' },
      { at: isoOffsetFromNow(-24 * 44 + 1), kind: 'confirmed', label: 'Booking confirmed' },
    ],
  },
  {
    id: 'bk_003',
    date: dateOffsetFromToday(11),
    startTime: '18:00',
    endTime: '23:00',
    couple: 'Joseph & Neema',
    partnerA: 'Joseph Mushi',
    partnerB: 'Neema Lema',
    phone: '+255 765 224 901',
    whatsapp: '+255 765 224 901',
    email: 'joseph.m@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=160&h=160&fit=crop',
    packageName: 'Essential',
    location: 'Dar es Salaam',
    stage: 'reserved',
    internalStatus: 'contract_signed',
    totalValue: 2_900_000,
    depositPercent: 50,
    depositPaid: false,
    balanceDueDate: dateOffsetFromToday(4),
    contractSentAt: isoOffsetFromNow(-24 * 4),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: false,
    slotHeldUntil: isoOffsetFromNow(18),
    leadId: 'inq_joseph',
    lastMessageAt: isoOffsetFromNow(-50),
    lastMessagePreview: 'Bank transfer should land tomorrow morning.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 14), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 12), kind: 'quote_sent', label: 'Quote sent · TZS 2.9M' },
      { at: isoOffsetFromNow(-24 * 8), kind: 'quote_accepted', label: 'Quote accepted' },
      { at: isoOffsetFromNow(-24 * 4), kind: 'contract_sent', label: 'Contract sent' },
      { at: isoOffsetFromNow(-24 * 2), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-50), kind: 'message', label: 'Couple: bank transfer pending' },
    ],
  },
  {
    id: 'bk_004',
    date: dateOffsetFromToday(18),
    startTime: '13:00',
    endTime: '19:00',
    couple: 'Amani & Zuri',
    partnerA: 'Amani Mollel',
    partnerB: 'Zuri Said',
    phone: '+255 783 401 776',
    whatsapp: '+255 783 401 776',
    email: 'amani.m@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop',
    packageName: 'Signature',
    location: 'Zanzibar · Nungwi',
    stage: 'confirmed',
    internalStatus: 'confirmed',
    totalValue: 5_500_000,
    depositPercent: 50,
    depositPaid: true,
    balanceDueDate: dateOffsetFromToday(11),
    contractSentAt: isoOffsetFromNow(-24 * 60),
    contractSigned: false,
    invoiceIssued: true,
    briefSubmitted: false,
    slotHeldUntil: null,
    leadId: 'inq_001',
    lastMessageAt: isoOffsetFromNow(-12),
    lastMessagePreview: 'Should we book the boat transfer for the bridal party?',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 70), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 67), kind: 'quote_sent', label: 'Quote sent · TZS 5.5M' },
      { at: isoOffsetFromNow(-24 * 65), kind: 'quote_accepted', label: 'Quote accepted' },
      { at: isoOffsetFromNow(-24 * 60), kind: 'contract_sent', label: 'Contract sent' },
      { at: isoOffsetFromNow(-24 * 60 + 6), kind: 'deposit_paid', label: 'Deposit received · TZS 2.75M' },
      { at: isoOffsetFromNow(-24 * 60 + 7), kind: 'confirmed', label: 'Booking confirmed' },
      { at: isoOffsetFromNow(-12), kind: 'message', label: 'Couple: boat transfer question' },
    ],
  },
  {
    id: 'bk_005',
    date: dateOffsetFromToday(32),
    startTime: '15:00',
    endTime: '21:00',
    couple: 'Kwame & Amina',
    partnerA: 'Kwame Mensah',
    partnerB: 'Amina Suleiman',
    phone: '+255 718 553 020',
    whatsapp: '+255 718 553 020',
    email: 'kwame.m@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=160&h=160&fit=crop',
    packageName: 'Full Day',
    location: 'Arusha',
    stage: 'reserved',
    internalStatus: 'deposit_pending',
    totalValue: 7_200_000,
    depositPercent: 50,
    depositPaid: false,
    balanceDueDate: dateOffsetFromToday(25),
    contractSentAt: isoOffsetFromNow(-24 * 2),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: false,
    slotHeldUntil: isoOffsetFromNow(48),
    leadId: 'inq_002',
    lastMessageAt: isoOffsetFromNow(-6),
    lastMessagePreview: 'Sending the deposit by Tigo Pesa today, asante.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 7), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 5), kind: 'quote_sent', label: 'Quote sent · TZS 7.2M' },
      { at: isoOffsetFromNow(-24 * 3), kind: 'quote_accepted', label: 'Quote accepted' },
      { at: isoOffsetFromNow(-24 * 2), kind: 'contract_sent', label: 'Contract sent' },
      { at: isoOffsetFromNow(-24), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-6), kind: 'message', label: 'Couple: deposit by Tigo Pesa today' },
    ],
  },
  {
    id: 'bk_006',
    date: dateOffsetFromToday(60),
    startTime: '14:00',
    endTime: '20:00',
    couple: 'Sarah & Idris',
    partnerA: 'Sarah Karume',
    partnerB: 'Idris Mwita',
    phone: '+255 758 110 422',
    whatsapp: '+255 758 110 422',
    email: 'sarah.k@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=160&h=160&fit=crop',
    packageName: 'Signature',
    location: 'Bagamoyo',
    stage: 'quoted',
    internalStatus: 'quote_sent',
    totalValue: 5_000_000,
    depositPercent: 50,
    depositPaid: false,
    balanceDueDate: null,
    contractSentAt: null,
    contractSigned: false,
    invoiceIssued: false,
    briefSubmitted: false,
    slotHeldUntil: null,
    leadId: 'inq_neema',
    lastMessageAt: isoOffsetFromNow(-24 * 1.5),
    lastMessagePreview: 'Reviewing the quote with my fiancé, will reply this week.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 5), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 3), kind: 'quote_sent', label: 'Quote sent · TZS 5.0M' },
      { at: isoOffsetFromNow(-24 * 1.5), kind: 'message', label: 'Couple: reviewing the quote' },
    ],
  },
  {
    id: 'bk_007',
    date: dateOffsetFromToday(-14),
    startTime: '13:00',
    endTime: '19:00',
    couple: 'Mariam & Tito',
    partnerA: 'Mariam Athumani',
    partnerB: 'Tito Banda',
    phone: '+255 717 322 904',
    whatsapp: '+255 717 322 904',
    email: 'mariam.a@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1521252659862-eec69941b071?w=160&h=160&fit=crop',
    packageName: 'Full Day',
    location: 'Dar es Salaam',
    stage: 'completed',
    internalStatus: 'completed',
    totalValue: 5_400_000,
    depositPercent: 50,
    depositPaid: true,
    balanceDueDate: dateOffsetFromToday(-21),
    contractSentAt: isoOffsetFromNow(-24 * 90),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: true,
    slotHeldUntil: null,
    leadId: null,
    lastMessageAt: isoOffsetFromNow(-24 * 12),
    lastMessagePreview: 'Asante sana for an unforgettable day.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 120), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 115), kind: 'quote_sent', label: 'Quote sent · TZS 5.4M' },
      { at: isoOffsetFromNow(-24 * 110), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-24 * 110 + 5), kind: 'deposit_paid', label: 'Deposit received · TZS 2.7M' },
      { at: isoOffsetFromNow(-24 * 14), kind: 'completed', label: 'Event completed' },
      { at: isoOffsetFromNow(-24 * 12), kind: 'message', label: 'Couple: thank you note' },
    ],
  },
  {
    id: 'bk_008',
    date: dateOffsetFromToday(45),
    startTime: '15:00',
    endTime: '22:00',
    couple: 'Lulu & Ben',
    partnerA: 'Lulu Mwakipesile',
    partnerB: 'Ben Kalinga',
    phone: '+255 786 998 110',
    whatsapp: '+255 786 998 110',
    email: 'lulu.m@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=160&h=160&fit=crop',
    packageName: 'Signature',
    location: 'Dar es Salaam',
    stage: 'cancelled',
    internalStatus: 'cancelled',
    totalValue: 4_800_000,
    depositPercent: 50,
    depositPaid: true,
    balanceDueDate: null,
    contractSentAt: isoOffsetFromNow(-24 * 30),
    contractSigned: true,
    invoiceIssued: true,
    briefSubmitted: false,
    slotHeldUntil: null,
    leadId: null,
    lastMessageAt: isoOffsetFromNow(-24 * 3),
    lastMessagePreview: 'Family situation has come up, we have to postpone indefinitely.',
    reviewRequested: false,
    reviewReceived: false,
    timeline: [
      { at: isoOffsetFromNow(-24 * 60), kind: 'inquiry', label: 'Inquiry received' },
      { at: isoOffsetFromNow(-24 * 55), kind: 'quote_sent', label: 'Quote sent · TZS 4.8M' },
      { at: isoOffsetFromNow(-24 * 30), kind: 'contract_signed', label: 'Contract signed' },
      { at: isoOffsetFromNow(-24 * 30 + 4), kind: 'deposit_paid', label: 'Deposit received · TZS 2.4M' },
      { at: isoOffsetFromNow(-24 * 3), kind: 'cancelled', label: 'Cancelled by couple' },
    ],
  },
]

// Calendar view consumes a lighter-weight projection. Cancelled bookings drop
// off; quoted/reserved show as "pending" so the calendar's color semantics
// stay simple.
function calendarStatusForStage(stage: BookingStage): CalendarBookingStatus | null {
  if (stage === 'cancelled') return null
  if (stage === 'completed') return 'completed'
  if (stage === 'confirmed') return 'confirmed'
  return 'pending'
}

export const calendarBookings: CalendarBooking[] = bookings.flatMap((b) => {
  const status = calendarStatusForStage(b.stage)
  if (!status) return []
  return [
    {
      id: b.id,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      couple: b.couple,
      packageName: b.packageName,
      location: b.location,
      status,
    },
  ]
})

export const recentInquiries: InquiryRow[] = [
  {
    id: 'inq_001',
    couple: 'Amani & Zuri',
    date: 'Sat, 12 Dec 2026',
    budget: 'TSh 8M – 10M',
    location: 'Zanzibar, Nungwi',
    status: 'new',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop',
  },
  {
    id: 'inq_002',
    couple: 'Kwame & Amina',
    date: 'Sun, 08 Mar 2027',
    budget: 'TSh 5M – 7M',
    location: 'Arusha',
    status: 'replied',
    avatarUrl:
      'https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=120&h=120&fit=crop',
  },
  {
    id: 'inq_003',
    couple: 'Neema & Joseph',
    date: 'Fri, 22 May 2027',
    budget: 'TSh 12M – 15M',
    location: 'Dar es Salaam',
    status: 'booked',
    avatarUrl:
      'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=120&h=120&fit=crop',
  },
]
