import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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

// Validation schema for draft updates
const draftUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional().or(z.literal("")),
  coverLetterUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  experience: z.string().optional(),
  education: z.string().optional(),
  referenceInfo: z.string().optional(),
  is_draft: z.boolean().optional(), // Can be set to false to submit
});

// Validation schema for submitting draft
const submitDraftSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional().or(z.literal("")),
  coverLetterUrl: z.string().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  experience: z.string().optional(),
  education: z.string().optional(),
  referenceInfo: z.string().optional(),
  is_draft: z.literal(false), // Must be false to submit
}).refine(
  (data) => {
    // At least one of cover letter text or file must be provided
    return (data.coverLetter && data.coverLetter.trim() !== "") || (data.coverLetterUrl && data.coverLetterUrl.trim() !== "");
  },
  { message: "Please provide a cover letter (text or file)", path: ["coverLetter"] }
);

// PATCH - Update draft application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const applicationId = resolvedParams.id;
    const supabaseAdmin = getSupabaseAdmin();

    // Verify application exists and belongs to user
    const { data: existingApp, error: fetchError } = await supabaseAdmin
      .from("job_applications")
      .select("id, user_id, is_draft, job_posting_id")
      .eq("id", applicationId)
      .single();

    if (fetchError || !existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingApp.user_id !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own applications" },
        { status: 403 }
      );
    }

    // Verify it's a draft (users can only update drafts)
    if (!existingApp.is_draft) {
      return NextResponse.json(
        { error: "Cannot update submitted application. Only drafts can be updated." },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const isSubmitting = body.is_draft === false;

    // Validate based on whether submitting or just updating draft
    const validationResult = isSubmitting
      ? submitDraftSchema.safeParse(body)
      : draftUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.resumeUrl !== undefined) updateData.resume_url = data.resumeUrl || null;
    if (data.coverLetter !== undefined) updateData.cover_letter = data.coverLetter || null;
    if (data.coverLetterUrl !== undefined) updateData.cover_letter_url = data.coverLetterUrl || null;
    if (data.portfolioUrl !== undefined) updateData.portfolio_url = data.portfolioUrl || null;
    if (data.linkedinUrl !== undefined) updateData.linkedin_url = data.linkedinUrl || null;
    if (data.experience !== undefined) updateData.experience = data.experience || null;
    if (data.education !== undefined) updateData.education = data.education || null;
    if (data.referenceInfo !== undefined) updateData.reference_info = data.referenceInfo || null;

    // If submitting, set is_draft to false
    if (isSubmitting) {
      updateData.is_draft = false;
      updateData.status = "pending";
    }

    // Update application
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("job_applications")
      .update(updateData)
      .eq("id", applicationId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating application:", updateError);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // If submitting, create default tasks and log activity
    if (isSubmitting && updated) {
      const defaultTasks = [
        { task_type: "review_resume", title: "Review Resume" },
        { task_type: "initial_screening", title: "Initial Screening" },
        { task_type: "schedule_interview", title: "Schedule Interview" },
        { task_type: "send_response", title: "Send Response" },
      ];

      try {
        const tasksToInsert = defaultTasks.map((task) => ({
          application_id: updated.id,
          task_type: task.task_type,
          title: task.title,
          completed: false,
        }));

        const { error: tasksError } = await supabaseAdmin
          .from("application_tasks")
          .insert(tasksToInsert);

        if (!tasksError) {
          // Log task creation to activity log
          for (const task of defaultTasks) {
            await supabaseAdmin
              .from("application_activity_log")
              .insert({
                application_id: updated.id,
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

      // Log application submission
      try {
        await supabaseAdmin
          .from("application_activity_log")
          .insert({
            application_id: updated.id,
            action_type: "application_submitted",
            action_details: {
              applicant_name: data.fullName,
              applicant_email: data.email,
            },
            performed_by: user.userId,
          });
      } catch (logError) {
        console.error("Error logging application submission:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      application: updated,
      message: isSubmitting 
        ? "Application submitted successfully" 
        : "Draft updated successfully",
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/careers/applications/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
