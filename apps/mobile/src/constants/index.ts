import { Dimensions } from 'react-native';

// Screen dimensions
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius constants
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

// Font weights
export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  GRAPHQL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/graphql',
  UPLOAD: process.env.EXPO_PUBLIC_UPLOAD_URL || 'http://localhost:3001/upload',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  LOCATION_PERMISSION: 'location_permission',
  CAMERA_PERMISSION: 'camera_permission',
} as const;

// Event types
export const EVENT_TYPES = {
  WEDDING: 'wedding',
  SENDOFF: 'sendoff',
  KITCHEN_PARTY: 'kitchen_party',
  CORPORATE: 'corporate',
  GRADUATION: 'graduation',
  OTHER: 'other',
} as const;

// Vendor categories
export const VENDOR_CATEGORIES = {
  PHOTOGRAPHERS: 'photographers',
  VENUES: 'venues',
  CATERERS: 'caterers',
  SALONS_MAKEUP: 'salons-makeup',
  DECOR: 'decor',
  DJS_MCS: 'djs-mcs',
  RENTALS: 'rentals',
  DESIGNERS: 'designers',
  TRANSPORT: 'transport',
} as const;

// Booking statuses
export const BOOKING_STATUSES = {
  INQUIRY: 'INQUIRY',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  MPESA: 'MPESA',
  AIRTEL: 'AIRTEL',
  TIGO: 'TIGO',
  CARD: 'CARD',
} as const;

// RSVP statuses
export const RSVP_STATUSES = {
  PENDING: 'PENDING',
  YES: 'YES',
  NO: 'NO',
} as const;

// User roles
export const USER_ROLES = {
  COUPLE: 'COUPLE',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
} as const;

// Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  SWAHILI: 'sw',
} as const;

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_UPDATE: 'booking_update',
  PAYMENT_RECEIVED: 'payment_received',
  NEW_MESSAGE: 'new_message',
  EVENT_REMINDER: 'event_reminder',
  VENDOR_RESPONSE: 'vendor_response',
  RSVP_RECEIVED: 'rsvp_received',
} as const;

// Image picker options
export const IMAGE_PICKER_OPTIONS = {
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  mediaTypes: 'Images' as const,
} as const;

// Camera options
export const CAMERA_OPTIONS = {
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
} as const;

// QR code options
export const QR_CODE_OPTIONS = {
  type: 'qr' as const,
  flashMode: 'auto' as const,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Validation
export const VALIDATION = {
  PHONE_REGEX: /^(\+255|255|0)?[67]\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
} as const;

// Currency
export const CURRENCY = {
  CODE: 'TZS',
  SYMBOL: 'TSh',
  LOCALE: 'en-TZ',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
} as const;

// Deep linking
export const DEEP_LINKS = {
  SCHEME: 'thefesta',
  HOST: 'thefesta.app',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  PAYMENTS_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  LOCATION_ENABLED: true,
  CAMERA_ENABLED: true,
  CHAT_ENABLED: true,
  REVIEWS_ENABLED: true,
  ANALYTICS_ENABLED: true,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please enable required permissions.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully!',
  VENDOR_ADDED: 'Vendor added successfully!',
  BOOKING_CREATED: 'Booking request sent successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  GUEST_ADDED: 'Guest added successfully!',
  RSVP_SUBMITTED: 'RSVP submitted successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
} as const;
