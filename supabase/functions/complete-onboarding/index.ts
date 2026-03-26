import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLERK_SECRET_KEY = Deno.env.get("CLERK_SECRET_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Extract and verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.slice(7);

    // Create authenticated Supabase client to get user from JWT
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Decode the JWT to get the user ID (Clerk JWT for Supabase includes sub claim)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    // For Clerk JWTs, we may need to decode manually
    // The JWT `sub` claim contains the Clerk user ID
    let clerkUserId: string;
    let supabaseUserId: string | null = null;

    if (user) {
      supabaseUserId = user.id;
      clerkUserId = user.user_metadata?.clerk_id || user.id;
    } else {
      // Decode JWT payload to get Clerk user ID
      const parts = token.split(".");
      if (parts.length !== 3) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const payload = JSON.parse(atob(parts[1]));
      clerkUserId = payload.sub;

      // Look up user in our users table by clerk_id
      const { data: dbUser } = await supabaseAuth
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .maybeSingle();

      if (!dbUser?.id) {
        return new Response(
          JSON.stringify({ error: "Account not yet synced. Please wait a moment and try again." }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      supabaseUserId = dbUser.id;
    }

    const { type, profile } = await req.json();

    if (type === "couple") {
      // Insert couple profile
      const { error: insertError } = await supabaseAuth
        .from("couple_profiles")
        .upsert(
          {
            user_id: supabaseUserId,
            partner1_name: profile.partner1_name,
            partner2_name: profile.partner2_name,
            wedding_date: profile.wedding_date,
            date_undecided: profile.date_undecided ?? false,
            budget_range: profile.budget_range,
            guest_count: profile.guest_count,
            city: profile.city,
            region: profile.region,
            preferred_categories: profile.preferred_categories ?? [],
            preferred_styles: profile.preferred_styles ?? [],
            preferred_designs: profile.preferred_designs ?? [],
            whatsapp_phone: profile.whatsapp_phone,
            avatar_url: profile.avatar_url,
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (insertError) {
        console.error("Failed to insert couple profile:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save profile" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (type === "vendor") {
      // Preserve existing slug — only generate a new one for first-time onboarding
      const { data: existingVendor } = await supabaseAuth
        .from("vendors")
        .select("id, slug")
        .eq("user_id", supabaseUserId)
        .maybeSingle();

      const baseSlug = profile.business_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const vendorSlug = existingVendor?.slug ?? `${baseSlug}-${Date.now().toString(36)}`;

      const { error: vendorError } = await supabaseAuth
        .from("vendors")
        .upsert(
          {
            user_id: supabaseUserId,
            slug: vendorSlug,
            business_name: profile.business_name,
            category: profile.category,
            description: profile.description,
            bio: profile.description,
            price_range: profile.price_range,
            location: {
              city: profile.city,
              address: profile.address,
            },
            contact_info: {
              whatsapp: profile.whatsapp_phone,
              phone: profile.phone,
              email: profile.email,
              instagram: profile.instagram,
            },
            portfolio_images: profile.portfolio_urls ?? [],
            onboarding_status: "active",
            onboarding_started_at: new Date().toISOString(),
            onboarding_completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (vendorError) {
        console.error("Failed to create vendor:", vendorError);
        return new Response(
          JSON.stringify({ error: "Failed to save vendor profile" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid onboarding type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mark onboarding complete and set correct role in users table
    await supabaseAuth
      .from("users")
      .update({
        onboarding_complete: true,
        role: type === "vendor" ? "vendor" : "couple",
      })
      .eq("id", supabaseUserId);

    // Update Clerk publicMetadata
    if (CLERK_SECRET_KEY && clerkUserId) {
      try {
        const clerkRes = await fetch(
          `https://api.clerk.com/v1/users/${clerkUserId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              public_metadata: {
                onboardingComplete: true,
                userType: type,
                supabaseUserId,
              },
            }),
          }
        );

        if (!clerkRes.ok) {
          console.error("Failed to update Clerk metadata:", await clerkRes.text());
        }
      } catch (clerkErr) {
        console.error("Clerk API error:", clerkErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Onboarding error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
