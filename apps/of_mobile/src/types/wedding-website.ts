export type { WebsitePresetId } from '@/types/site-doc';

export type WebsiteTheme = 'garden' | 'classic' | 'modern';

// Mock shape — see src/lib/api/wedding-website.ts's getGuestbook/approveGuestbookEntry.
// No live wedding_guestbook_entries table exists on either app; this is
// placeholder scope until guestbook is prioritized as a real feature.
export interface GuestbookEntry {
  id: string;
  website_id: string;
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
}
