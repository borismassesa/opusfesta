import { z } from 'zod';

// ──────────────────── Couple Onboarding ────────────────────
// Actual flow: names → congrats → planning-stage → date → location →
//              guests → styles → vendors → designs → budget (submit) → complete

export const coupleStep1Schema = z.object({
  partner1Name: z.string().min(2, 'Name must be at least 2 characters'),
  partner2Name: z.string().optional(),
  weddingDate: z.string().nullable(), // ISO date string or null
  dateUndecided: z.boolean(),
});

export const coupleStep2Schema = z.object({
  budgetRange: z.enum([
    'under_5m',
    '5m_15m',
    '15m_30m',
    '30m_50m',
    'over_50m',
    'undisclosed',
  ]),
  guestCount: z.number().int().min(1).max(5000).nullable(),
});

export const coupleStep3Schema = z.object({
  city: z.string(),
  region: z.string().optional(),
});

export const coupleStep4Schema = z.object({
  preferredCategories: z.array(z.string()).min(1, 'Select at least one category'),
});

export const coupleStep5Schema = z.object({
  preferredStyles: z.array(z.string()).min(1, 'Select at least one style'),
});

export const coupleStep6Schema = z.object({
  preferredDesigns: z.array(z.string()).min(1, 'Select at least one design'),
});

export const coupleStep7Schema = z.object({
  budgetRange: z.string().optional(),
});

export type CoupleStep1Data = z.infer<typeof coupleStep1Schema>;
export type CoupleStep2Data = z.infer<typeof coupleStep2Schema>;
export type CoupleStep3Data = z.infer<typeof coupleStep3Schema>;
export type CoupleStep4Data = z.infer<typeof coupleStep4Schema>;
export type CoupleStep5Data = z.infer<typeof coupleStep5Schema>;
export type CoupleStep6Data = z.infer<typeof coupleStep6Schema>;
export type CoupleStep7Data = z.infer<typeof coupleStep7Schema>;

export type CoupleOnboardingData = CoupleStep1Data &
  CoupleStep2Data &
  CoupleStep3Data &
  CoupleStep4Data &
  CoupleStep5Data &
  CoupleStep6Data &
  CoupleStep7Data;

// ──────────────────── Vendor Onboarding ────────────────────

export const vendorStep1Schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1, 'Please select a category'),
  yearsInBusiness: z.number().int().min(0).optional(),
});

export const vendorStep2Schema = z.object({
  description: z.string().min(50, 'Please write at least 50 characters'),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
});

export const vendorStep3Schema = z.object({
  city: z.string().min(1, 'Please select a city'),
  address: z.string().optional(),
  whatsappPhone: z.string().min(9, 'WhatsApp number is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  instagram: z.string().optional(),
});

export const vendorStep4Schema = z.object({
  portfolioUris: z.array(z.string()).min(3, 'Upload at least 3 photos'),
});

export const vendorStep5Schema = z.object({
  confirmed: z.literal(true),
});

export type VendorStep1Data = z.infer<typeof vendorStep1Schema>;
export type VendorStep2Data = z.infer<typeof vendorStep2Schema>;
export type VendorStep3Data = z.infer<typeof vendorStep3Schema>;
export type VendorStep4Data = z.infer<typeof vendorStep4Schema>;
export type VendorStep5Data = z.infer<typeof vendorStep5Schema>;

export type VendorOnboardingData = VendorStep1Data &
  VendorStep2Data &
  VendorStep3Data &
  VendorStep4Data;
