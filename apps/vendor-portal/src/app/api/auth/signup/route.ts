import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail } from "@/lib/emails/resend";
import { getVerificationCodeEmailHtml } from "@/lib/emails/templates/verification-code";
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

// Signup request schema
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  userType: z.enum(["couple", "vendor"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Signup request body:", JSON.stringify(body, null, 2));
    
    const validatedData = signupSchema.parse(body);

    const supabase = getSupabaseAdmin();

    // Check if user already exists in auth.users (Supabase Auth)
    // This is the source of truth - users are created here first, before the public.users table
    let existingAuthUser = null;
    
    try {
      // Use listUsers to search for users by email
      // Note: listUsers doesn't support direct email filtering, so we'll get all users and filter
      // For better performance, we'll limit to recent users and check email
      const { data: usersList, error: listError } = await supabase.auth.admin.listUsers();
      
      if (!listError && usersList?.users) {
        // Find user by email (case-insensitive)
        existingAuthUser = usersList.users.find(
          (user) => user.email?.toLowerCase() === validatedData.email.toLowerCase()
        );
      }
    } catch (authCheckError) {
      // If we can't list users, we'll try to create and catch the error
      console.warn("Could not check existing auth users:", authCheckError);
    }

    // If user exists in auth.users, check their verification status
    if (existingAuthUser) {
      // Check if email is confirmed
      if (existingAuthUser.email_confirmed_at) {
        return NextResponse.json(
          { 
            error: "An account with this email already exists",
            verified: true,
            message: "Please sign in instead"
          },
          { status: 400 }
        );
      } else {
        // User exists but email not confirmed - allow resending verification code
        return NextResponse.json(
          { 
            error: "An account with this email already exists but is not verified",
            verified: false,
            message: "Please verify your email or sign in",
            canResend: true
          },
          { status: 400 }
        );
      }
    }

    // Check for recent verification codes (rate limiting - max 3 per hour)
    // Note: If verification_codes table doesn't exist, this will fail gracefully
    let recentCodes = null;
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data, error: codesError } = await supabase
        .from("verification_codes")
        .select("id")
        .eq("email", validatedData.email)
        .eq("purpose", "email_verification")
        .gte("created_at", oneHourAgo.toISOString());
      
      if (codesError) {
        // If table doesn't exist, log warning but continue
        if (codesError.message?.includes("relation") || codesError.message?.includes("does not exist")) {
          console.warn("verification_codes table not found. Please run migration 043_create_verification_codes_table.sql");
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
          error:
            "Too many signup attempts. Please wait an hour before trying again.",
        },
        { status: 429 }
      );
    }

    // Create user in Supabase Auth (with email confirmation disabled)
    // IMPORTANT: Email confirmation must be disabled in Supabase Dashboard:
    // Authentication → Providers → Email → "Enable email confirmations" = OFF
    // This prevents Supabase from sending default confirmation emails
    // Note: We don't set email_confirm in createUser - we'll confirm via code verification later
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      // Don't set email_confirm here - we'll confirm via updateUserById after code verification
      user_metadata: {
        full_name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        user_type: validatedData.userType,
        phone: validatedData.phone || null,
      },
    });

    if (authError || !authData?.user) {
      console.error("Error creating user:", {
        error: authError,
        message: authError?.message,
        status: authError?.status,
        code: authError?.code,
        details: authError?.details,
      });
      
      // Provide more specific error messages
      let errorMessage = authError?.message || "Failed to create user account";
      
      // Check for specific error types
      if (authError?.message?.includes("email_confirm")) {
        errorMessage = "Invalid email confirmation parameter. Please check server configuration.";
      } else if (
        authError?.message?.includes("already registered") || 
        authError?.message?.includes("already exists") ||
        authError?.message?.includes("User already registered") ||
        authError?.status === 422
      ) {
        errorMessage = "An account with this email already exists";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === "development" ? authError?.message : undefined
        },
        { status: 400 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing email verification codes for this email
    await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("email", validatedData.email)
      .eq("purpose", "email_verification")
      .eq("verified", false);

    // Store verification code
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        email: validatedData.email,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
        user_id: authData.user.id,
        verified: false,
        attempts: 0,
        purpose: "email_verification",
      });

    if (codeError) {
      console.error("Error storing verification code:", {
        error: codeError,
        message: codeError.message,
        code: codeError.code,
        details: codeError.details,
      });
      
      // Check if table doesn't exist
      if (codeError.message?.includes("relation") || codeError.message?.includes("does not exist")) {
        // Clean up: delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { 
            error: "Verification system not configured. Please run the database migration: 043_create_verification_codes_table.sql",
            details: process.env.NODE_ENV === "development" ? codeError.message : undefined
          },
          { status: 500 }
        );
      }
      
      // Clean up: delete the auth user if code storage fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { 
          error: "Failed to generate verification code",
          details: process.env.NODE_ENV === "development" ? codeError.message : undefined
        },
        { status: 500 }
      );
    }

    // Send verification code via email
    const emailHtml = getVerificationCodeEmailHtml(code, validatedData.email);
    const emailResult = await sendEmail({
      to: validatedData.email,
      subject: "Verify Your OpusFesta Account",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Error sending email:", emailResult.error);
      // Don't fail the signup - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      email: validatedData.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error type:", typeof error);
    console.error("Error instanceof Error:", error instanceof Error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.errors,
          message: errorMessages
        },
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
