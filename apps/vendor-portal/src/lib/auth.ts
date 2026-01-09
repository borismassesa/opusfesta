import { supabase } from "./supabase/client";
import type { Session } from "@supabase/supabase-js";

/**
 * Ensure user record exists in database
 * Creates it if it doesn't exist
 */
export async function ensureUserRecord(session: Session): Promise<{ success: boolean; error?: string }> {
  try {
    const user = session.user;
    if (!user) {
      return { success: false, error: "No user in session" };
    }

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single();

    // If fetch error is not "not found", log it
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[auth] Error fetching user record:", fetchError);
      // If it's an RLS error, we might still want to try creating the user
      if (fetchError.code !== "42501") {
        return { success: false, error: fetchError.message || "Failed to check user record" };
      }
    }

    if (existingUser) {
      // User exists, all good
      return { success: true };
    }

    // User doesn't exist, create record
    // Get user_type from metadata or default to 'vendor' for vendor portal
    const userType = (user.user_metadata?.user_type as string) || "vendor";
    const role = userType === "vendor" ? "vendor" : userType === "admin" ? "admin" : "user";

    // Extract metadata from OAuth providers
    const fullName = 
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      user.user_metadata?.display_name ||
      (user.user_metadata?.first_name && user.user_metadata?.last_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : null);
    
    const avatar = 
      user.user_metadata?.avatar_url || 
      user.user_metadata?.picture || 
      user.user_metadata?.photo_url ||
      null;

    // Create user record
    const { error: createError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email || "",
      password: "$2a$10$placeholder_password_not_used_with_supabase_auth",
      name: fullName || null,
      phone: user.user_metadata?.phone || null,
      avatar: avatar || null,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (createError) {
      // If user already exists (idempotent), that's okay
      if (createError.code === "23505") {
        return { success: true };
      }
      
      // Check for RLS policy violations
      const isRLSError = 
        createError.message?.toLowerCase().includes("row-level security") ||
        createError.message?.toLowerCase().includes("violates row-level security policy") ||
        createError.message?.toLowerCase().includes("policy") ||
        createError.code === "42501";
      
      if (isRLSError) {
        console.error("[auth] RLS policy error creating user record:", createError);
        return {
          success: false,
          error: "Unable to complete account setup. Please contact support if this issue persists.",
        };
      }
      
      console.error("[auth] Error creating user record:", createError);
      return {
        success: false,
        error: createError.message || "Unable to create user account",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[auth] Error ensuring user record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
