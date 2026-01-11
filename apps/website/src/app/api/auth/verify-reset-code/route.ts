import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

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

// Verify reset code request schema
const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyResetCodeSchema.parse(body);

    const supabase = getSupabaseAdmin();
    const codeHash = hashCode(validatedData.code);

    // Find unverified, non-expired password reset code for this email
    const { data: codeRecord, error: codeError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", validatedData.email)
      .eq("code_hash", codeHash)
      .eq("purpose", "password_reset")
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
        .eq("purpose", "password_reset");

      return NextResponse.json(
        { error: "Invalid or expired reset code" },
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
        { error: "Reset code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Mark code as verified
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("id", codeRecord.id);

    // Get the user from auth to verify they exist
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      codeRecord.user_id
    );

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate a recovery link to create a temporary session for password reset
    // This allows the user to update their password without being fully logged in
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3001'}/reset-password`;
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: validatedData.email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError || !linkData) {
      console.error("Error generating recovery link:", linkError);
      return NextResponse.json(
        { error: "Failed to create reset session" },
        { status: 500 }
      );
    }

    // Extract tokens from the recovery link
    // The recovery link format is: https://...?token=...&type=recovery&redirect_to=...
    // We need to extract the token and use it to create a session
    const recoveryLink = linkData.properties.action_link;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    try {
      const url = new URL(recoveryLink);
      
      // Try to get tokens from hash (Supabase often puts them in the hash)
      if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        accessToken = hashParams.get("access_token");
        refreshToken = hashParams.get("refresh_token");
      }
      
      // If not in hash, try query params
      if (!accessToken || !refreshToken) {
        accessToken = url.searchParams.get("access_token");
        refreshToken = url.searchParams.get("refresh_token");
      }
      
      // If still not found, try to parse the token from the recovery link
      // Recovery links have format: ...?token=...&type=recovery
      // We can use the token to create a session via the client
      if (!accessToken || !refreshToken) {
        const token = url.searchParams.get("token");
        if (token) {
          // Return the recovery link - client will handle it
          return NextResponse.json({
            success: true,
            message: "Reset code verified successfully",
            recoveryLink: recoveryLink,
            user: {
              id: userData.user.id,
              email: userData.user.email,
            },
          });
        }
      }
    } catch (urlError) {
      console.error("Error parsing recovery link:", urlError);
      // Return the link anyway - client can handle it
      return NextResponse.json({
        success: true,
        message: "Reset code verified successfully",
        recoveryLink: recoveryLink,
        user: {
          id: userData.user.id,
          email: userData.user.email,
        },
      });
    }

    if (!accessToken || !refreshToken) {
      // Return the recovery link - client will extract tokens from it
      return NextResponse.json({
        success: true,
        message: "Reset code verified successfully",
        recoveryLink: recoveryLink,
        user: {
          id: userData.user.id,
          email: userData.user.email,
        },
      });
    }

    // Return success with tokens - user can now reset password
    return NextResponse.json({
      success: true,
      message: "Reset code verified successfully",
      accessToken,
      refreshToken,
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    });
  } catch (error) {
    console.error("Verify reset code error:", error);

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
