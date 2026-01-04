"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, XCircle, Flag, AlertTriangle, Search, Filter } from "lucide-react";

interface Review {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  eventType: string | null;
  eventDate: string | null;
  verified: boolean;
  moderationStatus: "pending" | "approved" | "rejected" | "flagged";
  moderationNotes: string | null;
  flaggedReason: string | null;
  moderatedAt: string | null;
  moderatedBy: string | null;
  createdAt: string;
}

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "flagged">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, pagination.page]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get session token (you'll need to implement proper auth)
      const token = localStorage.getItem("admin_token"); // TODO: Get from proper auth
      
      // Call the website app's API (adjust URL based on your setup)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${apiUrl}/api/admin/reviews?status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, action: "approve" | "reject" | "flag") => {
    setActionLoading(reviewId);
    try {
      const token = localStorage.getItem("admin_token"); // TODO: Get from proper auth
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/admin/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          notes: moderationNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to moderate review");
      }

      // Refresh reviews
      await fetchReviews();
      setSelectedReview(null);
      setModerationNotes("");
    } catch (err) {
      console.error("Error moderating review:", err);
      alert(err instanceof Error ? err.message : "Failed to moderate review");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.vendorName?.toLowerCase().includes(query) ||
      review.userName?.toLowerCase().includes(query) ||
      review.content?.toLowerCase().includes(query) ||
      review.title?.toLowerCase().includes(query)
    );
  });

  const statusCounts = {
    pending: reviews.filter((r) => r.moderationStatus === "pending").length,
    approved: reviews.filter((r) => r.moderationStatus === "approved").length,
    rejected: reviews.filter((r) => r.moderationStatus === "rejected").length,
    flagged: reviews.filter((r) => r.moderationStatus === "flagged").length,
  };

  return (
    <main className="page">
      <section className="section">
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
            Review Moderation
          </h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Moderate and approve vendor reviews
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All", count: reviews.length },
            { key: "pending", label: "Pending", count: statusCounts.pending },
            { key: "approved", label: "Approved", count: statusCounts.approved },
            { key: "rejected", label: "Rejected", count: statusCounts.rejected },
            { key: "flagged", label: "Flagged", count: statusCounts.flagged },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: statusFilter === tab.key ? "var(--primary)" : "transparent",
                color: statusFilter === tab.key ? "var(--bg)" : "var(--text)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: "24px", position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              color: "var(--muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search reviews by vendor, user, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
            Loading reviews...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--accent)" }}>
            {error}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
            No reviews found
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "var(--surface-2)",
                }}
              >
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  {/* Rating */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        style={{
                          width: "16px",
                          height: "16px",
                          fill: star <= review.rating ? "#fbbf24" : "transparent",
                          color: star <= review.rating ? "#fbbf24" : "var(--muted)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background:
                        review.moderationStatus === "approved"
                          ? "rgba(34, 197, 94, 0.2)"
                          : review.moderationStatus === "rejected"
                          ? "rgba(239, 68, 68, 0.2)"
                          : review.moderationStatus === "flagged"
                          ? "rgba(251, 191, 36, 0.2)"
                          : "rgba(58, 209, 169, 0.2)",
                      color:
                        review.moderationStatus === "approved"
                          ? "#22c55e"
                          : review.moderationStatus === "rejected"
                          ? "#ef4444"
                          : review.moderationStatus === "flagged"
                          ? "#fbbf24"
                          : "var(--primary)",
                    }}
                  >
                    {review.moderationStatus.toUpperCase()}
                  </div>

                  {review.verified && (
                    <div
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "rgba(34, 197, 94, 0.2)",
                        color: "#22c55e",
                      }}
                    >
                      VERIFIED
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div style={{ marginBottom: "12px" }}>
                  {review.title && (
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                      {review.title}
                    </h3>
                  )}
                  <p style={{ color: "var(--muted)", lineHeight: "1.6", margin: 0 }}>
                    {review.content}
                  </p>
                </div>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {review.images.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Review Metadata */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    fontSize: "12px",
                    color: "var(--muted)",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <strong>Vendor:</strong> {review.vendorName} ({review.vendorCategory})
                  </div>
                  <div>
                    <strong>User:</strong> {review.userName} ({review.userEmail})
                  </div>
                  {review.eventType && (
                    <div>
                      <strong>Event:</strong> {review.eventType}
                    </div>
                  )}
                  {review.eventDate && (
                    <div>
                      <strong>Date:</strong> {new Date(review.eventDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong>Submitted:</strong> {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Moderation Notes */}
                {review.moderationNotes && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(251, 191, 36, 0.1)",
                      border: "1px solid rgba(251, 191, 36, 0.3)",
                      marginBottom: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <strong>Moderation Notes:</strong> {review.moderationNotes}
                  </div>
                )}

                {review.flaggedReason && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      marginBottom: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <strong>Flagged Reason:</strong> {review.flaggedReason}
                  </div>
                )}

                {/* Action Buttons */}
                {review.moderationStatus === "pending" && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleModerate(review.id, "approve")}
                      disabled={actionLoading === review.id}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px",
                        opacity: actionLoading === review.id ? 0.5 : 1,
                      }}
                    >
                      <CheckCircle2 style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px" }} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, "reject")}
                      disabled={actionLoading === review.id}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px",
                        opacity: actionLoading === review.id ? 0.5 : 1,
                      }}
                    >
                      <XCircle style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px" }} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, "flag")}
                      disabled={actionLoading === review.id}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#fbbf24",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px",
                        opacity: actionLoading === review.id ? 0.5 : 1,
                      }}
                    >
                      <Flag style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px" }} />
                      Flag
                    </button>
                    <input
                      type="text"
                      placeholder="Add moderation notes..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: "200px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text)",
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                opacity: pagination.page === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ padding: "8px 16px", color: "var(--muted)" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text)",
                cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
