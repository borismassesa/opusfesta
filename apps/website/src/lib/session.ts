import { supabase } from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { ensureUserRecord } from "./auth";

/**
 * Session expiry buffer (in milliseconds)
 * Refresh session if it expires within this time
 */
const SESSION_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes

/**
 * Get current session with error handling
 * @returns Promise<Session | null> - Current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Exception getting session:", error);
    return null;
  }
}

/**
 * Refresh session token
 * @returns Promise<Session | null> - Refreshed session or null if refresh failed
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Exception refreshing session:", error);
    return null;
  }
}

/**
 * Check if session is expired or will expire soon
 * @param session - Session to check (optional, will fetch if not provided)
 * @returns Promise<boolean> - true if session is expired or expiring soon
 */
export async function checkSessionExpiry(session?: Session | null): Promise<boolean> {
  try {
    const currentSession = session || await getSession();
    
    if (!currentSession?.expires_at) {
      return true; // No expiry info means expired
    }
    
    const expiresAt = currentSession.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const expiryTime = expiresAt - SESSION_EXPIRY_BUFFER;
    
    return now >= expiryTime;
  } catch (error) {
    console.error("Error checking session expiry:", error);
    return true; // Assume expired on error
  }
}

/**
 * Handle expired session - clear session and optionally redirect
 * @param redirectTo - Optional redirect path after clearing session
 * @returns Promise<void>
 */
export async function handleExpiredSession(redirectTo?: string): Promise<void> {
  try {
    await clearSession();
    
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error("Error handling expired session:", error);
  }
}

/**
 * Clear session and sign out
 * @returns Promise<void>
 */
export async function clearSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: "local" });
    
    // Clear any auth-related sessionStorage items
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_redirect");
      sessionStorage.removeItem("auth_login_pending");
      sessionStorage.removeItem("auth_redirect_guard");
    }
  } catch (error) {
    console.error("Error clearing session:", error);
  }
}

/**
 * Ensure session is valid and refresh if needed
 * @returns Promise<Session | null> - Valid session or null if invalid
 */
export async function ensureValidSession(): Promise<Session | null> {
  try {
    let session = await getSession();
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired or expiring soon
    const isExpired = await checkSessionExpiry(session);
    
    if (isExpired) {
      // Try to refresh
      const refreshedSession = await refreshSession();
      
      if (!refreshedSession) {
        // Refresh failed, clear session
        await clearSession();
        return null;
      }
      
      session = refreshedSession;
    }
    
    // Ensure user record exists
    const ensureResult = await ensureUserRecord(session);
    
    if (!ensureResult.success) {
      console.error("Failed to ensure user record:", ensureResult.error);
      // Don't clear session here - let the app handle it
      return session;
    }
    
    return session;
  } catch (error) {
    console.error("Error ensuring valid session:", error);
    return null;
  }
}

/**
 * Get session with automatic refresh if needed
 * @returns Promise<Session | null> - Valid session or null if invalid
 */
export async function getSessionWithRefresh(): Promise<Session | null> {
  return ensureValidSession();
}

/**
 * Check if "Remember me" is enabled
 * @returns boolean - true if remember me is enabled
 */
export function isRememberMeEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    return localStorage.getItem("remember_me") === "true";
  } catch {
    return false;
  }
}

/**
 * Set "Remember me" preference
 * @param enabled - Whether to enable remember me
 */
export function setRememberMe(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    if (enabled) {
      localStorage.setItem("remember_me", "true");
    } else {
      localStorage.removeItem("remember_me");
    }
  } catch (error) {
    console.error("Error setting remember me:", error);
  }
}

/**
 * Setup session refresh interval
 * Automatically refreshes session before it expires
 * @param intervalMs - Refresh check interval in milliseconds (default: 1 minute)
 * @returns Function to clear the interval
 */
export function setupSessionRefresh(intervalMs: number = 60 * 1000): () => void {
  if (typeof window === "undefined") {
    return () => {}; // No-op on server
  }
  
  const intervalId = setInterval(async () => {
    try {
      const session = await getSession();
      
      if (!session) {
        return; // No session, nothing to refresh
      }
      
      const isExpired = await checkSessionExpiry(session);
      
      if (isExpired) {
        await refreshSession();
      }
    } catch (error) {
      console.error("Error in session refresh interval:", error);
    }
  }, intervalMs);
  
  return () => clearInterval(intervalId);
}
