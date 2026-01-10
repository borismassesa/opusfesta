import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail } from "@/lib/emails/resend";
import { JobApplicationNotification } from "@/lib/emails/templates/job-application-notification";

// Get Supabase admin client
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Get authenticated user from request
async function getAuthenticatedUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || "",
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

// Helper function to validate and clean URL fields
const cleanUrlForSubmission = (val: any): string | undefined => {
  if (val === "" || val === null || val === undefined) {
    return undefined;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") {
      return undefined;
    }
    // Try to validate as URL - if invalid, exclude it
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      // Invalid URL - exclude it rather than failing validation
      return undefined;
    }
  }
  return undefined;
};

// Validation schema for submitted applications
const applicationSchema = z.object({
  jobPostingId: z.string().uuid(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional().or(z.literal("")),
  coverLetterUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.preprocess(
    cleanUrlForSubmission,
    z.string().url("Invalid portfolio URL").optional()
  ),
  linkedinUrl: z.preprocess(
    cleanUrlForSubmission,
    z.string().url("Invalid LinkedIn URL").optional()
  ),
  experience: z.string().optional(),
  education: z.string().optional(),
  referenceInfo: z.string().optional(),
  is_draft: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // For submitted applications (not drafts), require cover letter
    if (!data.is_draft) {
      return (data.coverLetter && data.coverLetter.trim() !== "") || (data.coverLetterUrl && data.coverLetterUrl.trim() !== "");
    }
    return true; // Drafts don't need cover letter
  },
  { message: "Please provide a cover letter (text or file)", path: ["coverLetter"] }
);

// Validation schema for drafts (more lenient)
// For drafts, we allow empty strings, null, and undefined for all optional fields
// Simple email regex for basic validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const draftSchema = z.object({
  jobPostingId: z.string().uuid(),
  fullName: z.string().optional().nullable(),
  email: z.preprocess(
    (val) => {
      // Convert empty strings and null to undefined
      if (val === "" || val === null || val === undefined) {
        return undefined;
      }
      // If value is a string, check if it's a valid email format
      if (typeof val === "string") {
        const trimmed = val.trim();
        // If empty after trimming, return undefined
        if (trimmed === "") {
          return undefined;
        }
        // If not a valid email format, return undefined (don't fail validation)
        if (!emailRegex.test(trimmed)) {
          return undefined;
        }
        return trimmed;
      }
      return val;
    },
    z.string().email("Invalid email address").optional()
  ),
  phone: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
  coverLetterUrl: z.string().optional().nullable(),
  portfolioUrl: z.preprocess(
    (val) => val === "" || val === null ? undefined : val,
    z.string().url("Invalid portfolio URL").optional()
  ),
  linkedinUrl: z.preprocess(
    (val) => val === "" || val === null ? undefined : val,
    z.string().url("Invalid LinkedIn URL").optional()
  ),
  experience: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  referenceInfo: z.string().optional().nullable(),
  is_draft: z.boolean().optional().default(true),
});

// POST - Submit job application (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to apply." },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Parse form data (could be JSON or FormData)
    const contentType = request.headers.get("content-type");
    let body: any;

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      body = {
        jobPostingId: formData.get("jobPostingId"),
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        resumeUrl: formData.get("resumeUrl"),
        coverLetter: formData.get("coverLetter"),
        coverLetterUrl: formData.get("coverLetterUrl"),
        portfolioUrl: formData.get("portfolioUrl"),
        linkedinUrl: formData.get("linkedinUrl"),
        experience: formData.get("experience"),
        education: formData.get("education"),
        referenceInfo: formData.get("referenceInfo"),
        is_draft: formData.get("is_draft") === "true" || formData.get("is_draft") === true,
      };
    } else {
      // Handle JSON
      body = await request.json();
    }

    const isDraft = body.is_draft === true || body.is_draft === "true";

    // Validate input based on whether it's a draft
    const validationResult = isDraft 
      ? draftSchema.safeParse(body)
      : applicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      const errorMessages = validationResult.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      ).join(", ");
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors,
          message: errorMessages
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify job posting exists and is active
    const { data: jobPosting, error: jobError } = await supabaseAdmin
      .from("job_postings")
      .select("id, title")
      .eq("id", data.jobPostingId)
      .eq("is_active", true)
      .single();

    if (jobError || !jobPosting) {
      return NextResponse.json(
        { error: "Job posting not found or not active" },
        { status: 404 }
      );
    }

    // Check if there's an existing draft for this user and job posting
    let application;
    if (isDraft) {
      const { data: existingDraft } = await supabaseAdmin
        .from("job_applications")
        .select("id")
        .eq("job_posting_id", data.jobPostingId)
        .eq("user_id", user.userId)
        .eq("is_draft", true)
        .single();

      if (existingDraft) {
        // Update existing draft
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("job_applications")
          .update({
            full_name: data.fullName || null,
            email: data.email || user.email,
            phone: data.phone || null,
            resume_url: data.resumeUrl || null,
            cover_letter: data.coverLetter || null,
            cover_letter_url: data.coverLetterUrl || null,
            portfolio_url: data.portfolioUrl || null,
            linkedin_url: data.linkedinUrl || null,
            experience: data.experience || null,
            education: data.education || null,
            reference_info: data.referenceInfo || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDraft.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating draft:", updateError);
          return NextResponse.json(
            { error: "Failed to save draft" },
            { status: 500 }
          );
        }

        application = updated;
      } else {
        // Create new draft
        const { data: newDraft, error: insertError } = await supabaseAdmin
          .from("job_applications")
          .insert({
            job_posting_id: data.jobPostingId,
            user_id: user.userId,
            full_name: data.fullName || null,
            email: data.email || user.email,
            phone: data.phone || null,
            resume_url: data.resumeUrl || null,
            cover_letter: data.coverLetter || null,
            cover_letter_url: data.coverLetterUrl || null,
            portfolio_url: data.portfolioUrl || null,
            linkedin_url: data.linkedinUrl || null,
            experience: data.experience || null,
            education: data.education || null,
            reference_info: data.referenceInfo || null,
            is_draft: true,
            status: "pending",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting draft:", insertError);
          return NextResponse.json(
            { error: "Failed to save draft" },
            { status: 500 }
          );
        }

        application = newDraft;
      }
    } else {
      // Submit application (not a draft)
      // Check if there's an existing draft to update
      const { data: existingDraft } = await supabaseAdmin
        .from("job_applications")
        .select("id")
        .eq("job_posting_id", data.jobPostingId)
        .eq("user_id", user.userId)
        .eq("is_draft", true)
        .single();

      if (existingDraft) {
        // Update draft to submitted
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("job_applications")
          .update({
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            resume_url: data.resumeUrl || null,
            cover_letter: data.coverLetter || null,
            cover_letter_url: data.coverLetterUrl || null,
            portfolio_url: data.portfolioUrl || null,
            linkedin_url: data.linkedinUrl || null,
            experience: data.experience || null,
            education: data.education || null,
            reference_info: data.referenceInfo || null,
            is_draft: false,
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDraft.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error submitting application:", updateError);
          return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
          );
        }

        application = updated;
      } else {
        // Create new submitted application
        const { data: newApp, error: insertError } = await supabaseAdmin
          .from("job_applications")
          .insert({
            job_posting_id: data.jobPostingId,
            user_id: user.userId,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            resume_url: data.resumeUrl || null,
            cover_letter: data.coverLetter || null,
            cover_letter_url: data.coverLetterUrl || null,
            portfolio_url: data.portfolioUrl || null,
            linkedin_url: data.linkedinUrl || null,
            experience: data.experience || null,
            education: data.education || null,
            reference_info: data.referenceInfo || null,
            is_draft: false,
            status: "pending",
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting application:", insertError);
          return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
          );
        }

        application = newApp;
      }
    }

    if (!application) {
      return NextResponse.json(
        { error: "Failed to process application" },
        { status: 500 }
      );
    }

    // Only create tasks, log activity, and send email for submitted applications (not drafts)
    if (!isDraft) {
      // Create default tasks for the new application
      const defaultTasks = [
        { task_type: "review_resume", title: "Review Resume" },
        { task_type: "initial_screening", title: "Initial Screening" },
        { task_type: "schedule_interview", title: "Schedule Interview" },
        { task_type: "send_response", title: "Send Response" },
      ];

      try {
        const tasksToInsert = defaultTasks.map((task) => ({
          application_id: application.id,
          task_type: task.task_type,
          title: task.title,
          completed: false,
        }));

        const { error: tasksError } = await supabaseAdmin
          .from("application_tasks")
          .insert(tasksToInsert);

        if (tasksError) {
          console.error("Error creating default tasks:", tasksError);
          // Don't fail the request if tasks creation fails
        } else {
          // Log task creation to activity log
          for (const task of defaultTasks) {
            await supabaseAdmin
              .from("application_activity_log")
              .insert({
                application_id: application.id,
                action_type: "task_created",
                action_details: {
                  task_type: task.task_type,
                  title: task.title,
                  is_default: true,
                },
                performed_by: user.userId,
              });
          }
        }
      } catch (tasksError) {
        console.error("Error creating default tasks:", tasksError);
        // Don't fail the request if tasks creation fails
      }

      // Log application creation to activity log
      try {
        await supabaseAdmin
          .from("application_activity_log")
          .insert({
            application_id: application.id,
            action_type: "application_created",
            action_details: {
              applicant_name: data.fullName,
              applicant_email: data.email,
              job_title: jobPosting.title,
            },
            performed_by: user.userId,
          });
      } catch (logError) {
        console.error("Error logging application creation:", logError);
        // Don't fail the request if logging fails
      }

      // Send email notification to admin
      try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@opusfesta.com";
        await sendEmail({
          to: adminEmail,
          subject: `New Job Application: ${data.fullName} - ${jobPosting.title}`,
          html: JobApplicationNotification({
            applicantName: data.fullName,
            applicantEmail: data.email,
            applicantPhone: data.phone,
            jobTitle: jobPosting.title,
            applicationId: application.id,
          }),
        });
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        is_draft: application.is_draft,
        message: isDraft 
          ? "Draft saved successfully" 
          : "Application submitted successfully",
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/careers/applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
