import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";
import { ensureUserRecord, getRedirectPath, getUserTypeFromSession } from "@/lib/auth";

export const runtime = "nodejs";

// Get Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Hash verification code using SHA-256
function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Verify code request schema
const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyCodeSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const codeHash = hashCode(validatedData.code);

    // Find unverified, non-expired email verification code for this email
    // Filter by purpose='email_verification' to distinguish from password reset codes
    const { data: codeRecord, error: codeError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", validatedData.email)
      .eq("code_hash", codeHash)
      .eq("purpose", "email_verification")
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (codeError || !codeRecord) {
      // Increment attempts for any matching code (even if expired)
      await supabase
        .from("verification_codes")
        .update({ attempts: supabase.raw("attempts + 1") })
        .eq("email", validatedData.email)
        .eq("code_hash", codeHash)
        .eq("purpose", "email_verification");

      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Check if code has exceeded max attempts
    if (codeRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (new Date(codeRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Mark code as verified
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("id", codeRecord.id);

    // Get the user from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      codeRecord.user_id
    );

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Confirm email in Supabase Auth
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      codeRecord.user_id,
      {
        email_confirm: true,
      }
    );

    if (confirmError) {
      console.error("Error confirming email:", confirmError);
      return NextResponse.json(
        { error: "Failed to confirm email" },
        { status: 500 }
      );
    }

    // Create or update user record in database (idempotent using upsert)
    const userType = userData.user.user_metadata?.user_type || "couple";
    const fullName = userData.user.user_metadata?.full_name || null;
    const phone = userData.user.user_metadata?.phone || null;

    // Use upsert to handle both insert and update in one operation
    // This prevents 409 conflicts and handles duplicates gracefully
    const { error: upsertError } = await supabase
      .from("users")
      .upsert({
        id: codeRecord.user_id,
        email: validatedData.email,
        password: "$2a$10$placeholder_password_not_used_with_supabase_auth",
        name: fullName,
        phone: phone,
        avatar: null,
        role: userType === "vendor" ? "vendor" : "user",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id", // Use id as the conflict target
        ignoreDuplicates: false, // Update if exists
      });

    if (upsertError) {
      // Handle RLS errors gracefully (406) - these are expected if RLS policies block the operation
      const isRLSError = upsertError.code === "PGRST301" || 
                        upsertError.status === 406 ||
                        upsertError.message?.toLowerCase().includes("row-level security");
      
      // Handle duplicate key errors (409) - user already exists, that's okay
      const isDuplicateError = upsertError.code === "23505" || 
                              upsertError.status === 409 ||
                              upsertError.message?.toLowerCase().includes("duplicate");
      
      if (isRLSError || isDuplicateError) {
        // These are expected - user might exist or RLS might block, but verification can still succeed
        // Don't log as error to avoid console noise
      } else {
        // Only log unexpected errors
        console.error("Error upserting user record:", upsertError);
      }
      // Continue anyway - verification can still succeed even if user record upsert fails
    }

    // Generate a session using admin API
    // We'll create a temporary password reset token and use it to generate a session
    // Or better: use generateLink with type "recovery" and extract tokens, or use signInWithPassword
    
    // Since we have the user's password from signup, we can't use signInWithPassword here
    // Instead, we'll generate a recovery link and extract tokens, or use a different approach
    
    // Option: Generate a recovery link and extract the token, then use it to create a session
    // But the simplest is to return success and let the client sign in with password
    
    // Actually, we can use admin API to create a session directly
    // But Supabase admin API doesn't have a direct "createSession" method
    
    // Best approach: Generate a magic link for sign-in (not recovery)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Use generateLink with type "recovery" to get a token we can use
    // Or better: return success and let user sign in with their password
    // The email is now confirmed, so they can sign in normally
    
    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      requiresSignIn: true, // User needs to sign in with their password
      user: {
        id: userData.user.id,
        email: userData.user.email,
        userType: userType,
      },
    });
  } catch (error) {
    console.error("Verify code error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
