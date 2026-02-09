// Types
export type { UserType, UserRole, OpusFestaUser } from "./types";

// Role utilities
export {
  mapUserTypeToRole,
  mapRoleToUserType,
  getRedirectPath,
} from "./roles";

// Clerk Provider
export { OpusFestaClerkProvider } from "./clerk/provider";

// Clerk hooks
export { useOpusFestaAuth } from "./clerk/hooks";

// Supabase client factories (client-side)
export {
  useClerkSupabaseClient,
  createPublicSupabaseClient,
} from "./clerk/supabase-client";
