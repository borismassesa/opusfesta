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

// Request reset code schema
const requestResetCodeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestResetCodeSchema.parse(body);

    const supabase = getSupabaseAdmin();

    // Check if user exists in auth.users
    let existingAuthUser = null;
    try {
      const { data: usersList } = await supabase.auth.admin.listUsers();
      if (usersList?.users) {
        existingAuthUser = usersList.users.find(
          (user) => user.email?.toLowerCase() === validatedData.email.toLowerCase()
        );
      }
    } catch (authCheckError) {
      console.warn("Could not check existing auth users:", authCheckError);
    }

    // Don't reveal if user exists or not (security best practice)
    // Always return success, but only send code if user exists
    if (!existingAuthUser) {
      // Return success to prevent email enumeration
      // But don't actually send email
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset code has been sent to your email.",
      });
    }

    // Check for recent reset codes (rate limiting - max 3 per hour)
    let recentCodes = null;
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data, error: codesError } = await supabase
        .from("verification_codes")
        .select("id")
        .eq("email", validatedData.email)
        .eq("purpose", "password_reset")
        .gte("created_at", oneHourAgo.toISOString());
      
      if (codesError) {
        if (codesError.message?.includes("relation") || codesError.message?.includes("does not exist")) {
          console.warn("verification_codes table not found or purpose column missing. Please run migration 044_add_purpose_to_verification_codes.sql");
        } else {
          console.error("Error checking verification codes:", codesError);
        }
      } else {
        recentCodes = data;
      }
    } catch (codesCheckError) {
      console.warn("Error checking verification codes (table may not exist):", codesCheckError);
    }

    if (recentCodes && recentCodes.length >= 3) {
      return NextResponse.json(
        {
          error: "Too many password reset attempts. Please wait an hour before trying again.",
        },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing password reset codes for this email
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("email", validatedData.email)
      .eq("purpose", "password_reset")
      .eq("verified", false);

    // Store verification code
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        email: validatedData.email,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
        user_id: existingAuthUser.id,
        verified: false,
        attempts: 0,
        purpose: "password_reset",
      });

    if (codeError) {
      console.error("Error storing verification code:", {
        error: codeError,
        message: codeError.message,
        code: codeError.code,
        details: codeError.details,
      });
      
      // Check if table doesn't exist or purpose column is missing
      if (codeError.message?.includes("relation") || codeError.message?.includes("does not exist") || codeError.message?.includes("column") && codeError.message?.includes("purpose")) {
        return NextResponse.json(
          { 
            error: "Password reset system not configured. Please run the database migration: 044_add_purpose_to_verification_codes.sql",
            details: process.env.NODE_ENV === "development" ? codeError.message : undefined
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to generate reset code",
          details: process.env.NODE_ENV === "development" ? codeError.message : undefined
        },
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
      // Don't fail the request - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset code has been sent to your email.",
      email: validatedData.email,
    });
  } catch (error) {
    console.error("Request reset code error:", error);
    console.error("Error type:", typeof error);
    console.error("Error instanceof Error:", error instanceof Error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    // Check for missing environment variables
    if (error instanceof Error && error.message?.includes("Missing required Supabase")) {
      return NextResponse.json(
        { 
          error: "Server configuration error. Please contact support.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }

    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}
