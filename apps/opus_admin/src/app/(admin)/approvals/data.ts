// Approvals module — category catalog + approver roster. Requests
// themselves are persisted in Supabase (see queries.ts / actions.ts); this
// file holds only the static configuration the UI renders from.

import type {
  ApprovalApprover,
  ApprovalCategory,
  ApprovalCategoryKey,
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
