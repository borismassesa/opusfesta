// Which of the user's vendor businesses the portal is currently acting as.
// A user may run several vendor profiles (one per category); this cookie
// holds the selected vendor id. Lives in its own module (no 'server-only',
// no Clerk imports) so both server actions and route modules can share it
// without dragging in the whole vendor resolver.
export const ACTIVE_VENDOR_COOKIE = 'of-active-vendor'
