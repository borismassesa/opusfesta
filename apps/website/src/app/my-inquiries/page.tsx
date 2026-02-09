"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Clock, XCircle, Calendar, Mail, Phone, MapPin, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Inquiry {
  id: string;
  vendor_id: string;
  event_type: string;
  event_date: string | null;
  guest_count: number | null;
  budget: string | null;
  location: string | null;
  status: string;
  vendor_response: string | null;
  responded_at: string | null;
  created_at: string;
  vendors: {
    id: string;
    business_name: string;
    category: string;
    slug: string;
    logo: string | null;
    contact_info: any;
  };
}

export default function MyInquiriesPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push(`/login?next=${encodeURIComponent('/my-inquiries')}`);
      return;
    }
    fetchInquiries();
  }, [statusFilter, isLoaded, isSignedIn]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        router.push(`/login?next=${encodeURIComponent('/my-inquiries')}`);
        return;
      }

      const url = statusFilter === "all"
        ? "/api/inquiries"
        : `/api/inquiries?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch inquiries");
      }

      const data = await response.json();
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      console.error("Error fetching inquiries:", err);
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'declined':
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.vendors.business_name.toLowerCase().includes(query) ||
      inquiry.event_type.toLowerCase().includes(query) ||
      inquiry.location?.toLowerCase().includes(query) ||
      inquiry.message?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading your inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Inquiries</h1>
          <p className="text-muted-foreground">
            Track and manage all your vendor inquiries in one place
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No inquiries found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "You haven't submitted any inquiries yet. Start by browsing vendors and sending your first inquiry!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button asChild>
                <Link href="/vendors">Browse Vendors</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/inquiries/${inquiry.id}`}
                className="block bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Vendor Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {inquiry.vendors.logo ? (
                        <img
                          src={inquiry.vendors.logo}
                          alt={inquiry.vendors.business_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {inquiry.vendors.business_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inquiry.status)}`}>
                            {getStatusIcon(inquiry.status)}
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {inquiry.vendors.category}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{inquiry.event_type}</span>
                          </div>
                          {inquiry.event_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(inquiry.event_date), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                          {inquiry.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{inquiry.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Date */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
                    </p>
                    {inquiry.responded_at && (
                      <>
                        <p className="text-xs text-muted-foreground mt-2 mb-1">Responded</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(inquiry.responded_at), "MMM dd, yyyy")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Vendor Response Preview */}
                {inquiry.vendor_response && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-1">Vendor Response:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {inquiry.vendor_response}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
