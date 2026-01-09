"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Mail, Phone, Link as LinkIcon, FileText, ExternalLink, Calendar, User, Briefcase, GraduationCap, Users } from "lucide-react";
import { ApplicationTaskChecklist } from "@/components/careers/ApplicationTaskChecklist";
import { ApplicationActivityTimeline } from "@/components/careers/ApplicationActivityTimeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JobApplication {
  id: string;
  job_posting_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  cover_letter_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  experience: string | null;
  education: string | null;
  reference_info: string | null;
  status:
    | "pending"
    | "reviewing"
    | "phone_screen"
    | "technical_interview"
    | "final_interview"
    | "interviewed"
    | "offer_extended"
    | "offer_accepted"
    | "offer_declined"
    | "rejected"
    | "hired";
  notes: string | null;
  created_at: string;
  updated_at: string;
  job_postings: {
    id: string;
    title: string;
    department: string;
  } | null;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications`), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }

      const data = await response.json();
      const app = data.applications.find((a: JobApplication) => a.id === applicationId);

      if (!app) {
        throw new Error("Application not found");
      }

      setApplication(app);
      setStatus(app.status);
      setNotes(app.notes || "");
    } catch (err: any) {
      console.error("Error fetching application:", err);
      setError(err.message || "Failed to load application");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (saveStatus?: boolean, saveNotes?: boolean) => {
    if (!application) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Build update payload - only include what needs to be saved
      const updatePayload: any = { id: applicationId };
      if (saveStatus !== false) updatePayload.status = status;
      if (saveNotes !== false) updatePayload.notes = notes;

      // Use absolute URL with basePath to call admin app's own API
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update application");
      }

      const responseData = await response.json();
      
      // Update application state immediately from response
      if (responseData.application) {
        const updatedApp = responseData.application;
        setApplication(updatedApp);
        // Sync status and notes with the updated application
        setStatus(updatedApp.status);
        setNotes(updatedApp.notes || "");
      } else {
        // Fallback: refetch if response doesn't have application
        await fetchApplication();
      }
      
      // Trigger activity timeline refresh
      window.dispatchEvent(new Event('refresh-activity-timeline'));
      
      // Show success feedback
      if (saveNotes && !saveStatus) {
        // Only show feedback for notes-only saves
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        successMsg.textContent = 'Notes saved successfully';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
      }
    } catch (err: any) {
      console.error("Error updating application:", err);
      alert(err.message || "Failed to update application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStatus = () => handleSave(true, false);
  const handleSaveNotes = () => handleSave(false, true);

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.storage
        .from("careers")
        .createSignedUrl(filePath, 3600);

      if (error || !data) {
        throw new Error("Failed to generate download link");
      }

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error(`Error downloading ${fileName}:`, err);
      alert(`Failed to download ${fileName}`);
    }
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.storage
        .from("careers")
        .createSignedUrl(filePath, 3600);

      if (error || !data) {
        console.error("Error generating signed URL:", error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error("Error getting signed URL:", err);
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300",
      reviewing: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300",
      phone_screen: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/20 dark:text-cyan-300",
      technical_interview: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-300",
      final_interview: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/20 dark:text-violet-300",
      interviewed: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300",
      offer_extended: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300",
      offer_accepted: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300",
      offer_declined: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300",
      hired: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      reviewing: "Reviewing",
      phone_screen: "Phone Screen",
      technical_interview: "Technical Interview",
      final_interview: "Final Interview",
      interviewed: "Interviewed",
      offer_extended: "Offer Extended",
      offer_accepted: "Offer Accepted",
      offer_declined: "Offer Declined",
      rejected: "Rejected",
      hired: "Hired",
    };
    return (
      <Badge variant="outline" className={cn("font-medium", colors[status] || colors.pending)}>
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive text-lg font-semibold mb-2">{error || "Application not found"}</p>
            <Link href="/careers/applications">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/careers/applications">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => handleSave(true, true)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Applicant Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{application.full_name}</CardTitle>
              <CardDescription className="text-base">
                Application for {application.job_postings?.title || "N/A"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a
                  href={`mailto:${application.email}`}
                  className="text-sm hover:underline flex items-center gap-2"
                >
                  {application.email}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a
                  href={`tel:${application.phone}`}
                  className="text-sm hover:underline"
                >
                  {application.phone}
                </a>
              </div>
              {application.linkedin_url && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline flex items-center gap-2"
                  >
                    LinkedIn Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {application.portfolio_url && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={application.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline flex items-center gap-2"
                  >
                    Portfolio
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.cover_letter && !application.cover_letter_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">
                  {application.cover_letter}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {application.experience && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">
                  {application.experience}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {application.education && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">
                  {application.education}
                </div>
              </CardContent>
            </Card>
          )}

          {/* References */}
          {application.reference_info && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">
                  {application.reference_info}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Application Status</Label>
                  <Button
                    onClick={handleSaveStatus}
                    disabled={isSaving}
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    title="Save status change"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="phone_screen">Phone Screen</SelectItem>
                    <SelectItem value="technical_interview">Technical Interview</SelectItem>
                    <SelectItem value="final_interview">Final Interview</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="offer_extended">Offer Extended</SelectItem>
                    <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                    <SelectItem value="offer_declined">Offer Declined</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${application.email}?subject=Re: Application for ${application.job_postings?.title || "Position"}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Applied:</span>
                  <span className="font-medium">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(application.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <ApplicationTaskChecklist applicationId={applicationId} />

          {/* Job Information */}
          {application.job_postings && (
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Position</Label>
                  <p className="font-medium">{application.job_postings.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="font-medium">{application.job_postings.department}</p>
                </div>
                <Link href={`/careers/jobs/${application.job_postings.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Job Posting
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>
                Add private notes about this application. These notes are only visible to admins.
              </CardDescription>
            </div>
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this application..."
            className="min-h-[120px]"
            onKeyDown={(e) => {
              // Save on Ctrl/Cmd + Enter
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSaveNotes();
              }
            }}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter (or Cmd+Enter on Mac) to save quickly
          </p>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <ApplicationActivityTimeline applicationId={applicationId} />
    </div>
  );
}
