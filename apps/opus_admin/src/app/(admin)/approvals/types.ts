// Public type surface for the Approvals module. The shape of each
// request varies by category (Business Trip vs Contract Approval vs
// Procurement etc.), so the dynamic fields live under `fields` with
// string values keyed by field id. The category catalog in `data.ts`
// declares what each form should render.

export type ApprovalStatus = 'To Submit' | 'Submitted' | 'Approved' | 'Refused'

export type ApprovalCategoryKey =
  | 'business-trip'
  | 'borrow-items'
  | 'general-approval'
  | 'contract-approval'
  | 'payment-application'
  | 'car-rental'
  | 'job-referral-award'
  | 'procurement'
  | 'rfq'

export type ApprovalFieldKind =
  | 'text'
  | 'textarea'
  | 'date'
  | 'date-range'
  | 'number'
  | 'amount'
  | 'list'

export type ApprovalField = {
  id: string
  label: string
  kind: ApprovalFieldKind
  placeholder?: string
  required?: boolean
  // Optional helper rendered under the label.
  hint?: string
}

export type ApprovalCategory = {
  key: ApprovalCategoryKey
  label: string
  // Short description for the picker / sidebar.
  blurb: string
  // Hex used in pills, status chips and the icon tile.
  accent: string
  // Soft tint for icon backgrounds.
  tint: string
  // Lucide icon name (resolved on the client to avoid bundling the
  // whole icon map).
  iconKey:
    | 'Plane'
    | 'PackageOpen'
    | 'FileCheck2'
    | 'FileSignature'
    | 'Wallet'
    | 'Car'
    | 'UserPlus'
    | 'ShoppingCart'
    | 'FileText'
  // Form field schema for this category. Order is preserved.
  fields: ApprovalField[]
}

export type ApprovalApprover = {
  id: string
  name: string
  role?: string
  email: string
}

export type ApprovalActivityKind = 'system' | 'note' | 'message'

export type ApprovalActivity = {
  id: string
  kind: ApprovalActivityKind
  at: string
  author: string
  authorInitials: string
  // Tailwind-color or hex used for the author's avatar tile.
  authorColor: string
  body: string
}

// The logged-in admin acting on a request — used for activity entries,
// owner default when creating a new request, and as the `actor` party
// on outbound emails.
export type ApprovalActor = {
  name: string
  email: string
  initials: string
  // Hex color for the avatar tile.
  color: string
  // Optional role/title for email footer presentation.
  role?: string
}

export type ApprovalRequest = {
  id: string
  category: ApprovalCategoryKey
  subject: string
  owner: string
  ownerEmail: string
  ownerInitials: string
  // Free-form key/value map keyed by field id. Values are always
  // strings (amounts come pre-formatted, date ranges as "YYYY-MM-DD/YYYY-MM-DD").
  fields: Record<string, string>
  approvers: ApprovalApprover[]
  status: ApprovalStatus
  // ISO date for whichever transition matters most for sort order.
  // `Submitted` => submission date, otherwise creation date.
  updatedAt: string
  createdAt: string
  // Discussion / system log shown in the right rail on the request form.
  activity: ApprovalActivity[]
}
