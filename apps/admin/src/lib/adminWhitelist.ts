/**
 * Admin Whitelist Utility Functions
 * 
 * These functions interact with the admin_whitelist table in the database
 * to check if users are authorized to access the admin portal.
 */

import { getSupabaseAdmin } from "./supabaseAdmin";

export interface AdminWhitelistEntry {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  added_by: string | null;
  added_at: string;
  last_login: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check if an email is whitelisted and active
 * @param email - Email address to check
 * @returns Promise<boolean> - True if email is whitelisted and active
 */
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("admin_whitelist")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking admin whitelist:", error);
    return false;
  }
}

/**
 * Get admin whitelist entry by email
 * @param email - Email address to lookup
 * @returns Promise<AdminWhitelistEntry | null>
 */
export async function getAdminWhitelistEntry(email: string): Promise<AdminWhitelistEntry | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("admin_whitelist")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as AdminWhitelistEntry;
  } catch (error) {
    console.error("Error fetching admin whitelist entry:", error);
    return null;
  }
}

/**
 * Update last login timestamp for an admin
 * @param email - Email address of the admin
 * @returns Promise<boolean> - True if update was successful
 */
export async function updateAdminLastLogin(email: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabaseAdmin
      .from("admin_whitelist")
      .update({ last_login: new Date().toISOString() })
      .eq("email", normalizedEmail);

    if (error) {
      console.error("Error updating admin last login:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating admin last login:", error);
    return false;
  }
}

/**
 * Get all active admin whitelist entries
 * @returns Promise<AdminWhitelistEntry[]>
 */
export async function getAllActiveAdmins(): Promise<AdminWhitelistEntry[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("admin_whitelist")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching admin whitelist:", error);
      return [];
    }

    return (data || []) as AdminWhitelistEntry[];
  } catch (error) {
    console.error("Error fetching admin whitelist:", error);
    return [];
  }
}

/**
 * Fallback: Check environment variable whitelist (for backward compatibility)
 * @param email - Email address to check
 * @returns boolean - True if email is in env var whitelist
 */
export function isEmailInEnvWhitelist(email: string): boolean {
  const whitelistEnv = process.env.NEXT_PUBLIC_ADMIN_WHITELIST;
  if (!whitelistEnv || whitelistEnv.trim().length === 0) {
    return false;
  }

  const adminWhitelist = whitelistEnv
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0);

  return adminWhitelist.includes(email.trim().toLowerCase());
}
