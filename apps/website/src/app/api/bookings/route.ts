import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/emails/resend";
import { InquiryCustomerEmail } from "@/lib/emails/templates/inquiry-customer";
import { InquiryVendorEmail } from "@/lib/emails/templates/inquiry-vendor";
import { InquiryPlatformEmail } from "@/lib/emails/templates/inquiry-platform";

interface BookingRequest {
  vendorId: string;
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate?: string; // ISO date string
  guestCount?: number;
  budget?: string;
  location?: string;
  message: string;
  // Payment fields removed - payment will happen after vendor confirms inquiry
  // paymentPreference?: 'full' | 'partial' | 'installments';
  // preferredPaymentMethod?: 'card' | 'mpesa' | 'tigopesa' | 'airtelmoney' | 'halopesa';
  // paymentMetadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase URL" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase service role key" },
        { status: 500 }
      );
    }

    // Create Supabase admin client inside the function
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.trim() === '') {
      console.error('[ERROR] SUPABASE_SERVICE_ROLE_KEY is empty or not set');
      return NextResponse.json(
        { error: "Server configuration error: Supabase service role key is empty or invalid" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // #region agent log
    console.log('[DEBUG] HYP-D: SupabaseAdmin client created', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || 'N/A',
      clientCreated: !!supabaseAdmin
    });
    // #endregion

    const body: BookingRequest = await request.json();

    // Validate required fields
    if (!body.vendorId || !body.name || !body.email || !body.eventType || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields: vendorId, name, email, eventType, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get authenticated user (optional - inquiries can be created by anyone)
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // #region agent log
    console.log('[DEBUG] HYP-A: Supabase clients', {
      hasSupabaseAdmin: !!supabaseAdmin,
      hasSupabase: !!supabase,
      userId,
      vendorId: body.vendorId,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
    });
    // #endregion

    // Check if vendor exists and get details for emails
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, business_name, slug, contact_info, user_id")
      .eq("id", body.vendorId)
      .single();

    // #region agent log
    console.log('[DEBUG] HYP-A: Vendor check result', {
      vendorFound: !!vendor,
      vendorError: vendorError?.message,
      vendorErrorCode: vendorError?.code,
      vendorErrorDetails: vendorError?.details
    });
    // #endregion

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Parse event date if provided
    let eventDate: Date | null = null;
    if (body.eventDate) {
      eventDate = new Date(body.eventDate);
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid event date format" },
          { status: 400 }
        );
      }
    }

    // #region agent log
    console.log('[DEBUG] HYP-B: Before inquiry insert', {
      usingSupabaseAdmin: true,
      inquiryData: {
        vendor_id: body.vendorId,
        user_id: userId,
        name: body.name,
        email: body.email,
        event_type: body.eventType,
        hasEventDate: !!eventDate
      }
    });
    // #endregion

    // Create inquiry - USE supabaseAdmin to bypass RLS
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("inquiries")
      .insert({
        vendor_id: body.vendorId,
        user_id: userId,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        event_type: body.eventType,
        event_date: eventDate ? eventDate.toISOString().split("T")[0] : null,
        guest_count: body.guestCount || null,
        budget: body.budget || null,
        location: body.location || null,
        message: body.message,
        status: "pending",
        // Payment fields removed - payment will happen after vendor confirms inquiry
        payment_preference: null,
        preferred_payment_method: null,
        payment_metadata: {},
      })
      .select()
      .single();

    // #region agent log
    console.log('[DEBUG] HYP-B: Inquiry insert result', {
      inquiryCreated: !!inquiry,
      inquiryId: inquiry?.id,
      inquiryError: inquiryError ? {
        message: inquiryError.message,
        code: inquiryError.code,
        details: inquiryError.details,
        hint: inquiryError.hint
      } : null
    });
    // #endregion

    if (inquiryError) {
      // #region agent log
      console.error('[DEBUG] HYP-B: Inquiry insert failed with error', {
        error: inquiryError,
        code: inquiryError.code,
        message: inquiryError.message,
        details: inquiryError.details,
        hint: inquiryError.hint,
        usingSupabaseAdmin: true,
        serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      // #endregion
      
      // Check for specific database errors
      if (inquiryError.code === '42P01') {
        return NextResponse.json(
          { error: "Database table not found", details: "The inquiries table does not exist. Please run the migration." },
          { status: 500 }
        );
      }
      
      if (inquiryError.code === '42501') {
        // #region agent log
        console.error('[DEBUG] HYP-E: Permission denied error - RLS might be blocking', {
          errorCode: '42501',
          usingServiceRole: true,
          serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'NOT_SET',
          possibleCauses: [
            'Service role key not set correctly',
            'RLS policy blocking insert',
            'Service role key doesn\'t have bypass_rls permission'
          ]
        });
        // #endregion
        
        return NextResponse.json(
          { 
            error: "Permission denied", 
            details: inquiryError.message || "You don't have permission to create inquiries. Please check your authentication.",
            code: inquiryError.code,
            hint: inquiryError.hint
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create inquiry", 
          details: inquiryError.message,
          code: inquiryError.code || "UNKNOWN_ERROR",
          hint: inquiryError.hint
        },
        { status: 500 }
      );
    }

    // If event date is provided, mark it as tentatively unavailable
    // (The trigger will handle it when status changes to 'accepted')
    if (eventDate) {
      // #region agent log
      console.log('[DEBUG] HYP-C: Updating vendor availability', {
        eventDate: eventDate.toISOString().split("T")[0],
        vendorId: body.vendorId
      });
      // #endregion
      await supabaseAdmin
        .from("vendor_availability")
        .upsert({
          vendor_id: body.vendorId,
          date: eventDate.toISOString().split("T")[0],
          is_available: false,
          reason: "Pending inquiry",
        }, {
          onConflict: "vendor_id,date",
        });
    }

    // The trigger will automatically increment the vendor's inquiry count
    // No need to manually update stats

    // Send emails asynchronously (don't block the response)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || 'https://thefesta.com';
    const vendorContactInfo = (vendor.contact_info as any) || {};
    const vendorEmail = vendorContactInfo.email;
    const platformEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@thefesta.com';
    
    // Calculate if inquiry is urgent (event date within 7 days)
    const isUrgent = eventDate && (new Date(eventDate).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;

    // Log email sending attempt
    console.log('[EMAIL] Starting email sending process', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      customerEmail: body.email,
      vendorEmail: vendorEmail || 'NOT_SET',
      platformEmail: platformEmail,
      inquiryId: inquiry.id,
    });

    // Send emails in parallel (fire and forget)
    Promise.all([
      // Customer email
      sendEmail({
        to: body.email,
        subject: `Inquiry Confirmation - ${vendor.business_name}`,
        html: InquiryCustomerEmail({
          inquiryId: inquiry.id,
          customerName: body.name,
          vendorName: vendor.business_name,
          vendorSlug: vendor.slug,
          eventType: body.eventType,
          eventDate: inquiry.event_date || undefined,
          message: body.message,
          baseUrl,
        }),
      }).then((result) => {
        if (result.success) {
          console.log('[EMAIL] Customer email sent successfully to:', body.email);
        } else {
          console.error('[EMAIL] Failed to send customer email:', result.error);
        }
        return result;
      }).catch((err) => {
        console.error('[EMAIL] Error sending customer email:', err);
        return { success: false, error: err.message };
      }),

      // Vendor email (if vendor has email)
      vendorEmail ? sendEmail({
        to: vendorEmail,
        subject: `New Inquiry from ${body.name} - ${body.eventType}`,
        html: InquiryVendorEmail({
          inquiryId: inquiry.id,
          vendorName: vendor.business_name,
          customerName: body.name,
          customerEmail: body.email,
          customerPhone: body.phone,
          eventType: body.eventType,
          eventDate: inquiry.event_date || undefined,
          guestCount: inquiry.guest_count || undefined,
          budget: inquiry.budget || undefined,
          location: inquiry.location || undefined,
          message: body.message,
          baseUrl,
          isUrgent: !!isUrgent,
        }),
      }).then((result) => {
        if (result.success) {
          console.log('[EMAIL] Vendor email sent successfully to:', vendorEmail);
        } else {
          console.error('[EMAIL] Failed to send vendor email:', result.error);
        }
        return result;
      }).catch((err) => {
        console.error('[EMAIL] Error sending vendor email:', err);
        return { success: false, error: err.message };
      }) : Promise.resolve({ success: true, skipped: true }),

      // Platform admin email
      sendEmail({
        to: platformEmail,
        subject: `New Inquiry: ${body.name} → ${vendor.business_name}`,
        html: InquiryPlatformEmail({
          inquiryId: inquiry.id,
          vendorName: vendor.business_name,
          vendorId: vendor.id,
          customerName: body.name,
          customerEmail: body.email,
          eventType: body.eventType,
          eventDate: inquiry.event_date || undefined,
          baseUrl,
        }),
      }).then((result) => {
        if (result.success) {
          console.log('[EMAIL] Platform email sent successfully to:', platformEmail);
        } else {
          console.error('[EMAIL] Failed to send platform email:', result.error);
        }
        return result;
      }).catch((err) => {
        console.error('[EMAIL] Error sending platform email:', err);
        return { success: false, error: err.message };
      }),
    ]).then((results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success && !r.skipped).length;
      console.log('[EMAIL] Email sending completed', {
        total: results.length,
        successful: successCount,
        failed: failCount,
        skipped: results.filter(r => r.skipped).length,
      });
    }).catch((err) => {
      // Log but don't fail the request
      console.error('[EMAIL] Unexpected error in email sending process:', err);
    });

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        vendorId: inquiry.vendor_id,
        status: inquiry.status,
        createdAt: inquiry.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected error creating inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
