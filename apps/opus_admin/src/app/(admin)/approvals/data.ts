// Approvals module — category catalog + seed requests. In-memory only
// for now; the shape mirrors what a future `approval_requests` table
// would hold, so the swap to Supabase is a queries.ts rewrite away.

import type {
  ApprovalApprover,
  ApprovalCategory,
  ApprovalCategoryKey,
  ApprovalRequest,
  ApprovalStatus,
} from './types'

// Roster of internal approvers. Pinned to the live `workforce_employees`
// rows so the notification pipeline routes to real inboxes. When new
// approvers are onboarded the right move is to wire this to a Supabase
// lookup; until then, refresh by hand whenever an `employee_code` here
// is reissued.
//
// IMPORTANT: the "OpusFesta Owner" entry MUST route to
// `admin@opusfesta.com` — that's the email on the `admin_whitelist`
// owner row and the `workforce_employees` OF-001 record (clerk_user_id
// `user_3DFayJdYqd6LMyEnlM2e5Wm5R39`). Boris's personal Gmail
// (`bmmassesa@gmail.com`) is *not* the owner account and emails routed
// there will be missed.
export const APPROVER_ROSTER: ApprovalApprover[] = [
  {
    id: 'app_owner', // workforce_employees OF-001
    name: 'OpusFesta Owner',
    role: 'OpusFesta Owner',
    email: 'admin@opusfesta.com',
  },
  {
    id: 'app_ulumbi', // workforce_employees OF-002
    name: 'Ulumbi Samwel Dyamo',
    role: 'Finance and Accounts Assistant Manager',
    email: 'udyamo@gmail.com',
  },
  {
    id: 'app_timothy', // workforce_employees OF-003
    name: 'Timothy Mwamoto',
    role: 'Finance and Accounts Manager',
    email: 'timothymwamoto8@gmail.com',
  },
]

export function findApprover(id: string): ApprovalApprover | null {
  return APPROVER_ROSTER.find((a) => a.id === id) ?? null
}

export const APPROVAL_STATUSES: ApprovalStatus[] = [
  'To Submit',
  'Submitted',
  'Approved',
  'Refused',
]

// Shared fields used by most categories.
const SUBJECT_FIELD = {
  id: 'subject',
  label: 'Approval Subject',
  kind: 'text' as const,
  required: true,
  placeholder: 'Short summary, e.g. Q2 vendor visit',
}

const DESCRIPTION_FIELD = {
  id: 'description',
  label: 'Description',
  kind: 'textarea' as const,
  required: true,
  placeholder: 'Provide context, business justification and any links…',
}

export const CATEGORIES: ApprovalCategory[] = [
  {
    key: 'business-trip',
    label: 'Business Trip',
    blurb: 'Travel auth, itinerary, location & dates.',
    accent: '#7E5896',
    tint: '#F0DFF6',
    iconKey: 'Plane',
    fields: [
      SUBJECT_FIELD,
      { id: 'period', label: 'Period', kind: 'date-range', required: true },
      { id: 'location', label: 'Location', kind: 'text', placeholder: 'e.g. Brussels', required: true },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'borrow-items',
    label: 'Borrow Items',
    blurb: 'Equipment or asset loans with return dates.',
    accent: '#1F5D8C',
    tint: '#E5F2FB',
    iconKey: 'PackageOpen',
    fields: [
      SUBJECT_FIELD,
      { id: 'period', label: 'Period', kind: 'date-range', required: true },
      { id: 'products', label: 'Products', kind: 'list', placeholder: 'Item, qty', required: true },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'general-approval',
    label: 'General Approval',
    blurb: 'Anything that doesn’t fit a dedicated workflow.',
    accent: '#5B7F5B',
    tint: '#E6F1E6',
    iconKey: 'FileCheck2',
    fields: [
      SUBJECT_FIELD,
      { id: 'date', label: 'Date', kind: 'date' },
      { id: 'period', label: 'Period', kind: 'date-range' },
      { id: 'location', label: 'Location', kind: 'text', placeholder: 'e.g. Dar es Salaam HQ' },
      { id: 'contact', label: 'Contact', kind: 'text', placeholder: 'Counterparty or contact person' },
      { id: 'amount', label: 'Amount', kind: 'amount' },
      { id: 'reference', label: 'Reference', kind: 'text', placeholder: 'PO #, contract ref, etc.' },
      { id: 'products', label: 'Products', kind: 'list', placeholder: 'Item, qty' },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'contract-approval',
    label: 'Contract Approval',
    blurb: 'Vendor / partner / service contracts.',
    accent: '#8A5A09',
    tint: '#FEF3DB',
    iconKey: 'FileSignature',
    fields: [
      SUBJECT_FIELD,
      { id: 'contact', label: 'Contact', kind: 'text', placeholder: 'Counterparty', required: true },
      { id: 'amount', label: 'Amount', kind: 'amount', required: true },
      { id: 'reference', label: 'Reference', kind: 'text', placeholder: 'Contract ref' },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'payment-application',
    label: 'Payment Application',
    blurb: 'Request a payment to vendor, partner or staff.',
    accent: '#9B1D4C',
    tint: '#FCE4EC',
    iconKey: 'Wallet',
    fields: [
      SUBJECT_FIELD,
      { id: 'payee', label: 'Payee', kind: 'text', placeholder: 'Beneficiary name', required: true },
      { id: 'amount', label: 'Amount', kind: 'amount', required: true },
      { id: 'due-date', label: 'Due date', kind: 'date' },
      { id: 'reference', label: 'Reference', kind: 'text', placeholder: 'Invoice #, PO #' },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'car-rental',
    label: 'Bolt Service',
    blurb: 'Bolt rides for client visits, events or staff travel.',
    accent: '#205A9E',
    tint: '#E1ECF9',
    iconKey: 'Car',
    fields: [
      SUBJECT_FIELD,
      { id: 'period', label: 'Period', kind: 'date-range', required: true },
      { id: 'pickup', label: 'Pickup location', kind: 'text', placeholder: 'e.g. JNIA Airport' },
      { id: 'dropoff', label: 'Dropoff location', kind: 'text', placeholder: 'e.g. Serena Hotel' },
      { id: 'vehicle-type', label: 'Bolt category', kind: 'text', placeholder: 'e.g. Bolt, Bolt XL, Bolt Lite' },
      { id: 'amount', label: 'Estimated amount', kind: 'amount' },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'job-referral-award',
    label: 'Job Referral Award',
    blurb: 'Bonus payout when a referred hire passes probation.',
    accent: '#7E5896',
    tint: '#F0DFF6',
    iconKey: 'UserPlus',
    fields: [
      SUBJECT_FIELD,
      { id: 'referrer', label: 'Referrer (employee)', kind: 'text', required: true },
      { id: 'candidate', label: 'Hired candidate', kind: 'text', required: true },
      { id: 'role', label: 'Hired role', kind: 'text' },
      { id: 'hire-date', label: 'Hire date', kind: 'date' },
      { id: 'amount', label: 'Award amount', kind: 'amount', required: true },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'procurement',
    label: 'Procurement',
    blurb: 'Purchase request — goods or services.',
    accent: '#5B2D8E',
    tint: '#EFE3F8',
    iconKey: 'ShoppingCart',
    fields: [
      SUBJECT_FIELD,
      { id: 'vendor', label: 'Preferred vendor', kind: 'text', placeholder: 'Supplier name' },
      { id: 'products', label: 'Products / services', kind: 'list', required: true },
      { id: 'amount', label: 'Estimated amount', kind: 'amount', required: true },
      { id: 'needed-by', label: 'Needed by', kind: 'date' },
      DESCRIPTION_FIELD,
    ],
  },
  {
    key: 'rfq',
    label: 'Create RFQ',
    blurb: 'Issue a request for quotation to vendors.',
    accent: '#1F5D8C',
    tint: '#E5F2FB',
    iconKey: 'FileText',
    fields: [
      SUBJECT_FIELD,
      { id: 'category-tag', label: 'RFQ category', kind: 'text', placeholder: 'e.g. Catering, AV, Print' },
      { id: 'products', label: 'Line items', kind: 'list', required: true },
      { id: 'closing-date', label: 'Quote closing date', kind: 'date', required: true },
      { id: 'amount', label: 'Budget ceiling', kind: 'amount' },
      DESCRIPTION_FIELD,
    ],
  },
]

export function findCategory(key: ApprovalCategoryKey): ApprovalCategory {
  const match = CATEGORIES.find((c) => c.key === key)
  if (!match) throw new Error(`Unknown approval category: ${key}`)
  return match
}

// Seed data — covers each status bucket and several categories so the
// UI looks realistic on first load.
function sys(at: string, body: string): import('./types').ApprovalActivity {
  return {
    id: `act_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'system',
    at,
    author: 'System',
    authorInitials: 'SY',
    authorColor: '#94A3B8',
    body,
  }
}

function note(
  at: string,
  author: string,
  initials: string,
  color: string,
  body: string,
): import('./types').ApprovalActivity {
  return {
    id: `act_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'note',
    at,
    author,
    authorInitials: initials,
    authorColor: color,
    body,
  }
}

// Convenience pointers into APPROVER_ROSTER — keeps the seed data
// readable and ensures every seed approver has a real email so the
// notification pipeline can be exercised end-to-end.
const BORIS = APPROVER_ROSTER[0]
const ULUMBI = APPROVER_ROSTER[1]
const TIMOTHY = APPROVER_ROSTER[2]

export const SEED_REQUESTS: ApprovalRequest[] = [
  {
    id: 'apr_001',
    category: 'business-trip',
    subject: 'Nairobi vendor showcase — May 2026',
    owner: 'Boris Masesa',
    ownerEmail: 'bmmassesa@gmail.com',
    ownerInitials: 'BM',
    fields: {
      period: '2026-05-22/2026-05-25',
      location: 'Nairobi, Kenya',
      description: 'Site visit with two boutique caterers shortlisted for the Q3 launch.',
    },
    approvers: [ULUMBI, TIMOTHY],
    status: 'Submitted',
    updatedAt: '2026-05-12T08:00:00Z',
    createdAt: '2026-05-10T14:21:00Z',
    activity: [
      sys('2026-05-10T14:21:00Z', 'Boris Masesa created this request.'),
      sys('2026-05-12T08:00:00Z', `Submitted for approval — waiting on ${ULUMBI.name} and ${TIMOTHY.name}.`),
    ],
  },
  {
    id: 'apr_002',
    category: 'contract-approval',
    subject: 'Photographer retainer — Studio Lwiza',
    owner: 'Boris Masesa',
    ownerEmail: 'bmmassesa@gmail.com',
    ownerInitials: 'BM',
    fields: {
      contact: 'Mwajuma Lwiza',
      amount: 'TZS 4,200,000',
      reference: 'CT-2026-0042',
      description: '6-month exclusive retainer for high-end weddings, two days/week.',
    },
    approvers: [ULUMBI],
    status: 'Approved',
    updatedAt: '2026-05-09T11:30:00Z',
    createdAt: '2026-05-05T09:00:00Z',
    activity: [
      sys('2026-05-05T09:00:00Z', 'Boris Masesa created this request.'),
      sys('2026-05-06T10:15:00Z', 'Submitted for approval.'),
      note('2026-05-08T14:30:00Z', ULUMBI.name, 'UL', '#1F5D8C', 'Confirmed scope with Studio Lwiza — exclusivity clause covers wedding bookings only.'),
      sys('2026-05-09T11:30:00Z', `${ULUMBI.name} approved this request.`),
    ],
  },
  {
    id: 'apr_003',
    category: 'procurement',
    subject: 'Office printer + toner stock',
    owner: 'Tamara Adokeme',
    ownerEmail: 'tamara@opusfesta.com',
    ownerInitials: 'TA',
    fields: {
      vendor: 'OfficeDirect TZ',
      products: 'HP LaserJet M404dn × 1\nToner cartridge 59A × 4',
      amount: 'TZS 2,150,000',
      'needed-by': '2026-05-25',
      description: 'Replacement for the printer that died last week. Toner is consumable, ~6mo cover.',
    },
    approvers: [TIMOTHY],
    status: 'To Submit',
    updatedAt: '2026-05-14T16:05:00Z',
    createdAt: '2026-05-14T16:05:00Z',
    activity: [sys('2026-05-14T16:05:00Z', 'Tamara Adokeme created this request.')],
  },
  {
    id: 'apr_004',
    category: 'borrow-items',
    subject: 'Lighting rig for Mwanza shoot',
    owner: 'Daniel Hassan',
    ownerEmail: 'daniel@opusfesta.com',
    ownerInitials: 'DH',
    fields: {
      period: '2026-05-18/2026-05-21',
      products: 'Aputure 300d MkII × 2\nManfrotto C-stand × 3',
      description: 'Returning Friday evening after the shoot wrap.',
    },
    approvers: [BORIS],
    status: 'Submitted',
    updatedAt: '2026-05-13T10:12:00Z',
    createdAt: '2026-05-13T10:12:00Z',
    activity: [
      sys('2026-05-13T10:12:00Z', 'Daniel Hassan created this request.'),
      sys('2026-05-13T10:12:00Z', 'Submitted for approval.'),
    ],
  },
  {
    id: 'apr_005',
    category: 'payment-application',
    subject: 'Pay venue deposit — Slipway Hall',
    owner: 'Aisha Mwanga',
    ownerEmail: 'aisha@opusfesta.com',
    ownerInitials: 'AM',
    fields: {
      payee: 'Slipway Events Ltd',
      amount: 'TZS 1,500,000',
      'due-date': '2026-05-20',
      reference: 'INV-2026-0188',
      description: '30% deposit to hold the venue for the OpusFesta vendor showcase.',
    },
    approvers: [ULUMBI, TIMOTHY],
    status: 'Refused',
    updatedAt: '2026-05-11T15:40:00Z',
    createdAt: '2026-05-10T11:00:00Z',
    activity: [
      sys('2026-05-10T11:00:00Z', 'Aisha Mwanga created this request.'),
      sys('2026-05-10T11:30:00Z', 'Submitted for approval.'),
      note('2026-05-11T15:35:00Z', TIMOTHY.name, 'TM', '#1F5D8C', 'Hold off — venue contract still under negotiation, no payment until terms confirmed.'),
      sys('2026-05-11T15:40:00Z', `${TIMOTHY.name} refused this request.`),
    ],
  },
  {
    id: 'apr_006',
    category: 'car-rental',
    subject: 'Driver + SUV for client tour',
    owner: 'Boris Masesa',
    ownerEmail: 'bmmassesa@gmail.com',
    ownerInitials: 'BM',
    fields: {
      period: '2026-05-19/2026-05-19',
      pickup: 'OpusFesta HQ',
      dropoff: 'OpusFesta HQ',
      'vehicle-type': 'SUV — Toyota RAV4 or similar',
      amount: 'TZS 220,000',
      description: 'Driving two prospective enterprise clients between three venue scouts.',
    },
    approvers: [TIMOTHY],
    status: 'Approved',
    updatedAt: '2026-05-08T09:15:00Z',
    createdAt: '2026-05-07T17:30:00Z',
    activity: [
      sys('2026-05-07T17:30:00Z', 'Boris Masesa created this request.'),
      sys('2026-05-07T17:31:00Z', 'Submitted for approval.'),
      sys('2026-05-08T09:15:00Z', `${TIMOTHY.name} approved this request.`),
    ],
  },
  {
    id: 'apr_007',
    category: 'rfq',
    subject: 'RFQ — bespoke invitation print run',
    owner: 'Tamara Adokeme',
    ownerEmail: 'tamara@opusfesta.com',
    ownerInitials: 'TA',
    fields: {
      'category-tag': 'Print & Stationery',
      products: '200 × A5 foiled invitations\n200 × bespoke envelopes\n50 × menu cards',
      'closing-date': '2026-05-27',
      amount: 'TZS 3,000,000',
      description: 'Three quotes minimum. Brand-aligned vendors preferred.',
    },
    approvers: [BORIS, ULUMBI],
    status: 'To Submit',
    updatedAt: '2026-05-14T12:00:00Z',
    createdAt: '2026-05-14T12:00:00Z',
    activity: [sys('2026-05-14T12:00:00Z', 'Tamara Adokeme created this request.')],
  },
  {
    id: 'apr_008',
    category: 'job-referral-award',
    subject: 'Referral bonus — Diana Mwakasege',
    owner: 'Daniel Hassan',
    ownerEmail: 'daniel@opusfesta.com',
    ownerInitials: 'DH',
    fields: {
      referrer: 'Daniel Hassan',
      candidate: 'Diana Mwakasege',
      role: 'Senior Booking Coordinator',
      'hire-date': '2026-02-03',
      amount: 'TZS 600,000',
      description: 'Diana cleared probation on 2026-05-03 with strong performance review.',
    },
    approvers: [ULUMBI],
    status: 'Submitted',
    updatedAt: '2026-05-10T13:45:00Z',
    createdAt: '2026-05-10T13:45:00Z',
    activity: [
      sys('2026-05-10T13:45:00Z', 'Daniel Hassan created this request.'),
      sys('2026-05-10T13:45:00Z', 'Submitted for approval.'),
    ],
  },
]
