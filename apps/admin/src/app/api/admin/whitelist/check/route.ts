import { NextRequest, NextResponse } from "next/server";
import { isEmailWhitelisted, getAdminWhitelistEntry } from "@/lib/adminWhitelist";

/**
 * POST /api/admin/whitelist/check
 * Check if an email is whitelisted
 * This is a public endpoint (no auth required) as it's used during login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email is whitelisted
    const isWhitelisted = await isEmailWhitelisted(email);

    if (!isWhitelisted) {
      return NextResponse.json(
        { 
          whitelisted: false,
          message: "This email is not authorized to access the admin portal."
        },
        { status: 200 }
      );
    }

    // Get full entry if whitelisted
    const entry = await getAdminWhitelistEntry(email);

    return NextResponse.json({
      whitelisted: true,
      entry: entry ? {
        id: entry.id,
        email: entry.email,
        full_name: entry.full_name,
        role: entry.role,
      } : null
    });
  } catch (error: any) {
    console.error("Error checking admin whitelist:", error);
    return NextResponse.json(
      { error: "Failed to check admin whitelist", details: error.message },
      { status: 500 }
    );
  }
}
