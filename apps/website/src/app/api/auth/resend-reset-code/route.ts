import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail } from "@/lib/emails/resend";
import { getPasswordResetCodeEmailHtml } from "@/lib/emails/templates/password-reset-code";
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

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash verification code using SHA-256
function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Resend reset code request schema
const resendResetCodeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resendResetCodeSchema.parse(body);

    const supabase = getSupabaseAdmin();

    // Check if user exists by looking up verification codes or users table
    // First check verification_codes table for this email
    const { data: codeData } = await supabase
      .from("verification_codes")
      .select("user_id")
      .eq("email", validatedData.email)
      .eq("purpose", "password_reset")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let userDataToUse = null;

    if (!codeData?.user_id) {
      // Try checking users table
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", validatedData.email)
        .single();

      if (!userData) {
        // Return success to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: "If an account exists, a password reset code has been sent to your email.",
        });
      }

      // Get user from auth using the ID
      const { data: authUserData, error: authError } = await supabase.auth.admin.getUserById(
        userData.id
      );

      if (authError || !authUserData.user) {
        // Return success to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: "If an account exists, a password reset code has been sent to your email.",
        });
      }

      userDataToUse = authUserData.user;
    } else {
      // Get user from auth using the user_id from verification code
      const { data: authUserData, error: authError } = await supabase.auth.admin.getUserById(
        codeData.user_id
      );

      if (authError || !authUserData.user) {
        // Return success to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: "If an account exists, a password reset code has been sent to your email.",
        });
      }

      userDataToUse = authUserData.user;
    }

    // Check cooldown - must wait 60 seconds between resends
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const { data: recentCodes } = await supabase
      .from("verification_codes")
      .select("created_at")
      .eq("email", validatedData.email)
      .eq("purpose", "password_reset")
      .gte("created_at", oneMinuteAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentCodes && recentCodes.length > 0) {
      const secondsRemaining = Math.ceil(
        (60 * 1000 - (Date.now() - new Date(recentCodes[0].created_at).getTime())) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${secondsRemaining} seconds before requesting a new code`,
        },
        { status: 429 }
      );
    }

    // Generate new verification code
    const code = generateVerificationCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing unverified password reset codes for this email
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("email", validatedData.email)
      .eq("purpose", "password_reset")
      .eq("verified", false);

    // Store new verification code
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        email: validatedData.email,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
        user_id: userDataToUse.id,
        verified: false,
        attempts: 0,
        purpose: "password_reset",
      });

    if (codeError) {
      console.error("Error storing verification code:", codeError);
      return NextResponse.json(
        { error: "Failed to generate reset code" },
        { status: 500 }
      );
    }

    // Send verification code via email
    const emailHtml = getPasswordResetCodeEmailHtml(code, validatedData.email);
    const emailResult = await sendEmail({
      to: validatedData.email,
      subject: "Reset Your OpusFesta Password",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Error sending email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset code email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.error("Resend reset code error:", error);

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
