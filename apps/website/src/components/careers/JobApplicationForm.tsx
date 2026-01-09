"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, FileText, CheckCircle2, Loader2, User, Briefcase, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadResume, uploadCoverLetter } from "@/lib/careers/applications";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const applicationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  coverLetter: z.string().max(2000, "Cover letter must be less than 2000 characters").optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  experience: z.string().max(1000, "Experience must be less than 1000 characters").optional(),
  education: z.string().max(1000, "Education must be less than 1000 characters").optional(),
  referenceInfo: z.string().max(500, "References must be less than 500 characters").optional(),
}).refine(
  (data) => {
    // At least one of cover letter text or file must be provided
    // This will be checked in the component state, not in the schema
    return true;
  },
  { message: "Please provide a cover letter (text or file)" }
);

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationFormProps {
  jobPostingId: string;
  jobTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STORAGE_KEY_PREFIX = "job_application_draft_";

export function JobApplicationForm({
  jobPostingId,
  jobTitle,
  onSuccess,
  onCancel,
}: JobApplicationFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);
  const [isUploadingCoverLetter, setIsUploadingCoverLetter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const storageKey = `${STORAGE_KEY_PREFIX}${jobPostingId}`;

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      coverLetter: "",
      portfolioUrl: "",
      linkedinUrl: "",
      experience: "",
      education: "",
      referenceInfo: "",
    },
    mode: "onBlur",
  });

  // Load draft from database first, then localStorage as fallback
  useEffect(() => {
    async function loadDraft() {
      try {
        setIsLoadingDraft(true);
        
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoadingDraft(false);
          return;
        }

        // Try to load draft from database
        const response = await fetch(`/api/careers/applications/my-applications?includeDrafts=true`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const draft = data.applications?.find(
            (app: any) => app.job_posting_id === jobPostingId && app.is_draft === true
          );

          if (draft) {
            setDraftId(draft.id);
            // Load draft data into form
            form.reset({
              fullName: draft.full_name || "",
              email: draft.email || "",
              phone: draft.phone || "",
              coverLetter: draft.cover_letter || "",
              portfolioUrl: draft.portfolio_url || "",
              linkedinUrl: draft.linkedin_url || "",
              experience: draft.experience || "",
              education: draft.education || "",
              referenceInfo: draft.reference_info || "",
            });
            
            // Set file URLs if they exist
            if (draft.resume_url) setResumeUrl(draft.resume_url);
            if (draft.cover_letter_url) setCoverLetterUrl(draft.cover_letter_url);
            
            setIsLoadingDraft(false);
            return;
          }
        }

        // Fallback to localStorage
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const localDraft = JSON.parse(saved);
            form.reset(localDraft);
          }
        } catch (err) {
          console.error("Error loading localStorage draft:", err);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      } finally {
        setIsLoadingDraft(false);
      }
    }

    loadDraft();
  }, [storageKey, form, jobPostingId]);

  // Auto-save to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (err) {
        console.error("Error saving draft:", err);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  // Watch form values for progress calculation
  const watchedValues = form.watch();

  // Calculate form progress
  const formProgress = useMemo(() => {
    const fields = [
      watchedValues.fullName,
      watchedValues.email,
      watchedValues.phone,
      watchedValues.coverLetter || coverLetterUrl,
      resumeUrl,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [watchedValues.fullName, watchedValues.email, watchedValues.phone, watchedValues.coverLetter, coverLetterUrl, resumeUrl]);

  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    setResumeFile(file);
    setError(null);

    // Upload resume immediately
    setIsUploadingResume(true);
    const { url, error: uploadError } = await uploadResume(file);
    setIsUploadingResume(false);

    if (uploadError || !url) {
      setError(uploadError || "Failed to upload resume");
      setResumeFile(null);
      return;
    }

    setResumeUrl(url);
  };

  const handleCoverLetterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    setCoverLetterFile(file);
    setError(null);

    // Upload cover letter immediately
    setIsUploadingCoverLetter(true);
    const { url, error: uploadError } = await uploadCoverLetter(file);
    setIsUploadingCoverLetter(false);

    if (uploadError || !url) {
      setError(uploadError || "Failed to upload cover letter");
      setCoverLetterFile(null);
      return;
    }

    setCoverLetterUrl(url);
    // Clear text cover letter if file is uploaded
    form.setValue("coverLetter", "");
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeUrl(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  const removeCoverLetter = () => {
    setCoverLetterFile(null);
    setCoverLetterUrl(null);
    if (coverLetterInputRef.current) {
      coverLetterInputRef.current.value = "";
    }
  };

  const saveDraft = async (data: ApplicationFormData) => {
    setIsSavingDraft(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to save drafts");
        setIsSavingDraft(false);
        return;
      }

      const url = draftId 
        ? `/api/careers/applications/${draftId}`
        : "/api/careers/applications";
      
      const method = draftId ? "PATCH" : "POST";

      // Build request body, converting empty strings and nulls to undefined
      const requestBody: any = {
        jobPostingId,
        is_draft: true,
      };
      
      // Only include fields that have values (not empty strings or null)
      if (data.fullName && data.fullName.trim()) requestBody.fullName = data.fullName;
      if (data.email && data.email.trim()) requestBody.email = data.email;
      if (data.phone && data.phone.trim()) requestBody.phone = data.phone;
      if (resumeUrl) requestBody.resumeUrl = resumeUrl;
      if (data.coverLetter && data.coverLetter.trim()) requestBody.coverLetter = data.coverLetter;
      if (coverLetterUrl) requestBody.coverLetterUrl = coverLetterUrl;
      if (data.portfolioUrl && data.portfolioUrl.trim()) requestBody.portfolioUrl = data.portfolioUrl;
      if (data.linkedinUrl && data.linkedinUrl.trim()) requestBody.linkedinUrl = data.linkedinUrl;
      if (data.experience && data.experience.trim()) requestBody.experience = data.experience;
      if (data.education && data.education.trim()) requestBody.education = data.education;
      if (data.referenceInfo && data.referenceInfo.trim()) requestBody.referenceInfo = data.referenceInfo;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Try to parse JSON, but handle cases where response might not be JSON
      let result: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          result = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          const text = await response.text();
          console.error("Response text:", text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Show more detailed error message if available
        const errorMsg = result.message || result.error || `Failed to save draft (${response.status})`;
        console.error("Draft save error:", {
          status: response.status,
          statusText: response.statusText,
          result,
        });
        throw new Error(errorMsg);
      }

      if (result.application?.id) {
        setDraftId(result.application.id);
      }

      // Show success message briefly
      const successMsg = document.createElement("div");
      successMsg.className = "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      successMsg.textContent = "Draft saved!";
      document.body.appendChild(successMsg);
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 2000);
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setError(err.message || "Failed to save draft. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!resumeUrl) {
      setError("Please upload your resume/CV");
      return;
    }

    // Check if cover letter (text or file) is provided
    if (!data.coverLetter && !coverLetterUrl) {
      setError("Please provide a cover letter (text or file)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to submit applications");
        setIsSubmitting(false);
        return;
      }

      // If there's a draft, use PATCH to submit it
      const url = draftId 
        ? `/api/careers/applications/${draftId}`
        : "/api/careers/applications";
      
      const method = draftId ? "PATCH" : "POST";

      // Helper function to validate and clean URL fields
      const cleanUrl = (url: string | undefined): string | undefined => {
        if (!url || url.trim() === "") {
          return undefined;
        }
        const trimmed = url.trim();
        // If it's a valid URL, return it; otherwise return undefined
        try {
          new URL(trimmed);
          return trimmed;
        } catch {
          // Invalid URL - return undefined to exclude it
          return undefined;
        }
      };

      // Build request body with proper URL validation
      const requestBody: any = {
        jobPostingId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        is_draft: false, // Submit, not draft
      };

      // Only include optional fields if they have valid values
      if (resumeUrl) requestBody.resumeUrl = resumeUrl;
      if (data.coverLetter && data.coverLetter.trim()) {
        requestBody.coverLetter = data.coverLetter;
      }
      if (coverLetterUrl) requestBody.coverLetterUrl = coverLetterUrl;
      
      // Validate and clean URL fields
      const cleanedPortfolioUrl = cleanUrl(data.portfolioUrl);
      if (cleanedPortfolioUrl) requestBody.portfolioUrl = cleanedPortfolioUrl;
      
      const cleanedLinkedinUrl = cleanUrl(data.linkedinUrl);
      if (cleanedLinkedinUrl) requestBody.linkedinUrl = cleanedLinkedinUrl;
      
      if (data.experience && data.experience.trim()) {
        requestBody.experience = data.experience;
      }
      if (data.education && data.education.trim()) {
        requestBody.education = data.education;
      }
      if (data.referenceInfo && data.referenceInfo.trim()) {
        requestBody.referenceInfo = data.referenceInfo;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show more detailed error message if available
        const errorMsg = result.message || result.error || "Failed to submit application";
        console.error("Application submission error:", {
          status: response.status,
          statusText: response.statusText,
          result,
        });
        throw new Error(errorMsg);
      }

      // Clear draft from localStorage and reset draft ID
      try {
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error("Error clearing draft:", err);
      }

      setDraftId(null);
      setSuccess(true);
      form.reset();
      setResumeFile(null);
      setResumeUrl(null);
      setCoverLetterFile(null);
      setCoverLetterUrl(null);

      // Store application ID for tracking
      if (result.application?.id) {
        setApplicationId(result.application.id);
        try {
          localStorage.setItem(
            `application_${result.application.id}`,
            JSON.stringify({
              id: result.application.id,
              email: data.email,
              timestamp: Date.now(),
            })
          );
        } catch (err) {
          console.error("Error storing application ID:", err);
        }
      }

      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-3xl border border-primary/20">
            <CheckCircle2 className="w-20 h-20 text-primary" />
          </div>
        </div>
        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Application Submitted!
        </h3>
        <p className="text-lg text-secondary max-w-md leading-relaxed">
          Thank you for your interest in joining our team. We'll review your application and get back to you soon.
        </p>
        {applicationId && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-secondary mb-3">
              <strong>Application ID:</strong> <code className="text-primary font-mono text-xs">{applicationId}</code>
            </p>
            <Link
              href="/careers/my-applications"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View your applications
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
        <div className="mt-8 flex items-center gap-2 text-sm text-secondary">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span>We typically respond within 2-3 business days</span>
        </div>
      </div>
    );
  }

  const coverLetterValue = form.watch("coverLetter");
  const experienceValue = form.watch("experience");
  const educationValue = form.watch("education");
  const referenceInfoValue = form.watch("referenceInfo");

  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Form Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">Application Progress</span>
          <span className="text-primary font-medium">{formProgress}%</span>
        </div>
        <div className="w-full bg-surface rounded-full h-2 border border-border">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-primary">Personal Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+255 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section 2: Professional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-primary">Professional Information</h3>
            </div>

            {/* Resume Upload */}
            <div className="space-y-3">
              <Label htmlFor="resume" className="text-base font-semibold">
                Resume/CV <span className="text-destructive">*</span>
              </Label>
              {!resumeFile ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="resume-upload"
                    className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300"></div>
                    <div className="relative flex flex-col items-center justify-center pt-5 pb-6 z-10">
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="w-10 h-10 mb-3 animate-spin text-primary" />
                          <p className="text-sm font-medium text-primary">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-primary/10 rounded-xl mb-3 group-hover:bg-primary/20 transition-colors">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="mb-1 text-sm font-semibold text-primary">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-secondary">
                            PDF, DOC, or DOCX (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeSelect}
                      ref={resumeInputRef}
                      disabled={isUploadingResume}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-primary">{resumeFile.name}</p>
                    <p className="text-xs text-secondary mt-1">
                      {(resumeFile.size / 1024).toFixed(1)} KB • Ready to submit
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeResume}
                    disabled={isUploadingResume}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Cover Letter - Upload or Text */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Cover Letter <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-secondary mb-3">
                You can either upload a file or type your cover letter below.
              </p>

              {/* Cover Letter File Upload */}
              {!coverLetterFile ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="cover-letter-upload"
                    className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300"></div>
                    <div className="relative flex flex-col items-center justify-center pt-4 pb-4 z-10">
                      {isUploadingCoverLetter ? (
                        <>
                          <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
                          <p className="text-xs font-medium text-primary">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-primary/10 rounded-lg mb-2 group-hover:bg-primary/20 transition-colors">
                            <Upload className="w-5 h-5 text-primary" />
                          </div>
                          <p className="mb-1 text-xs font-semibold text-primary">
                            Upload cover letter (optional)
                          </p>
                          <p className="text-xs text-secondary">
                            PDF, DOC, or DOCX (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="cover-letter-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCoverLetterSelect}
                      ref={coverLetterInputRef}
                      disabled={isUploadingCoverLetter}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-primary">{coverLetterFile.name}</p>
                    <p className="text-xs text-secondary mt-1">
                      {(coverLetterFile.size / 1024).toFixed(1)} KB • Ready to submit
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeCoverLetter}
                    disabled={isUploadingCoverLetter}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Cover Letter Text Input (only show if no file uploaded) */}
              {!coverLetterFile && (
                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Or type your cover letter</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us why you're interested in this position..."
                          className="min-h-[120px]"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormDescription className="text-xs">
                          Please explain why you're interested in this position and what makes you a good fit.
                        </FormDescription>
                        <span className="text-xs text-secondary">
                          {coverLetterValue?.length || 0}/2000
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Portfolio URL */}
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://yourportfolio.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LinkedIn URL */}
              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 3: Additional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-primary">Additional Information</h3>
            </div>

            {/* Experience */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of your work experience..."
                      className="min-h-[100px]"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-secondary">
                      {experienceValue?.length || 0}/1000
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your educational background..."
                      className="min-h-[100px]"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-secondary">
                      {educationValue?.length || 0}/1000
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* References */}
            <FormField
              control={form.control}
              name="referenceInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>References (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Professional references (name, title, contact info)..."
                      className="min-h-[100px]"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-end">
                    <span className="text-xs text-secondary">
                      {referenceInfoValue?.length || 0}/500
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {draftId && (
            <div className="p-3 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-400">
                You have a saved draft. Continue editing below or submit when ready.
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveDraft(form.getValues())}
              disabled={isSavingDraft || isSubmitting || isUploadingResume || isUploadingCoverLetter}
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSavingDraft || isUploadingResume || isUploadingCoverLetter || !resumeUrl}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
