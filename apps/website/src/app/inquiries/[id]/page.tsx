import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { InvoiceList } from "@/components/payments/InvoiceList";
import { InquiryPageClient } from "@/components/inquiries/InquiryPageClient";
import { FileText, Calendar, Mail, Phone, MapPin, User, CheckCircle2, Clock, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";

// Mark page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

// Lazy initialization of Supabase admin client
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryPage({ params }: PageProps) {
  const supabaseAdmin = getSupabaseAdmin();
  const { id: inquiryId } = await params;

  // Get inquiry with vendor and user info
  const { data: inquiry, error: inquiryError } = await supabaseAdmin
    .from("inquiries")
    .select(`
      id,
      vendor_id,
      user_id,
      name,
      email,
      phone,
      event_type,
      event_date,
      guest_count,
      budget,
      location,
      message,
      status,
      vendor_response,
      responded_at,
      created_at,
      updated_at,
      vendors!inner(
        id,
        business_name,
        category,
        slug,
        user_id
      )
    `)
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    notFound();
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'declined':
      case 'closed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'declined':
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Inquiry Details</h1>
          <p className="text-muted-foreground">
            Inquiry for {inquiry.vendors.business_name}
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
            {getStatusIcon(inquiry.status)}
            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
          </div>
        </div>

        {/* Inquiry Information */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Inquiry Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{inquiry.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{inquiry.email}</p>
              </div>
            </div>

            {inquiry.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{inquiry.phone}</p>
                </div>
              </div>
            )}

            {inquiry.event_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Date</p>
                  <p className="font-medium">
                    {format(new Date(inquiry.event_date), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            )}

            {inquiry.event_type && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium capitalize">{inquiry.event_type}</p>
                </div>
              </div>
            )}

            {inquiry.guest_count && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Guest Count</p>
                  <p className="font-medium">{inquiry.guest_count} guests</p>
                </div>
              </div>
            )}

            {inquiry.budget && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{inquiry.budget}</p>
                </div>
              </div>
            )}

            {inquiry.location && (
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{inquiry.location}</p>
                </div>
              </div>
            )}
          </div>

          {inquiry.message && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Message</p>
              <p className="text-foreground whitespace-pre-wrap">{inquiry.message}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
            <p>Submitted on {format(new Date(inquiry.created_at), "MMMM dd, yyyy 'at' h:mm a")}</p>
          </div>
        </div>

        {/* Vendor Response */}
        {inquiry.vendor_response && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Vendor Response
            </h2>
            <div className="space-y-2">
              <p className="text-foreground whitespace-pre-wrap">{inquiry.vendor_response}</p>
              {inquiry.responded_at && (
                <p className="text-sm text-muted-foreground">
                  Responded on {format(new Date(inquiry.responded_at), "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Vendor Actions (client-side check) */}
        <InquiryPageClient 
          inquiryId={inquiryId}
          status={inquiry.status}
          vendorUserId={inquiry.vendors.user_id}
        />

        {/* Invoices Section */}
        {inquiry.status === 'accepted' && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Invoices & Payments</h2>
            <InvoiceList inquiryId={inquiryId} />
          </div>
        )}

        {/* Vendor Link */}
        <div className="mt-6">
          <a
            href={inquiry.vendors?.slug ? `/vendors/${inquiry.vendors.slug}` : "/vendors/all"}
            className="text-primary hover:underline text-sm"
          >
            ← Back to {inquiry.vendors.business_name}
          </a>
        </div>
      </div>
    </div>
  );
}
