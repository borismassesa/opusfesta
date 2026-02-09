import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return false;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("clerk_id", clerkUserId)
    .single();

  return userData?.role === "admin";
}

// Job posting schema
const jobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  salary_range: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  is_archived: z.boolean().default(false).optional(),
  // New template fields
  about_thefesta: z.string().nullable().optional(),
  benefits: z.array(z.string()).default([]),
  growth_description: z.string().nullable().optional(),
  hiring_process: z.array(z.string()).default([]),
  how_to_apply: z.string().nullable().optional(),
  equal_opportunity_statement: z.string().nullable().optional(),
});

// GET - List all job postings (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Use RPC function or subquery to get application counts
    // First, get all jobs
    let query = supabaseAdmin.from("job_postings").select("*");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    // By default, exclude archived jobs unless explicitly requested
    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data: jobs, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job postings:", error);
      return NextResponse.json(
        { error: "Failed to fetch job postings" },
        { status: 500 }
      );
    }

    // Get application counts for each job
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map((job) => job.id);
      const { data: counts, error: countError } = await supabaseAdmin
        .from("job_applications")
        .select("job_posting_id")
        .in("job_posting_id", jobIds);

      if (!countError && counts) {
        // Count applications per job
        const countMap = new Map<string, number>();
        counts.forEach((app) => {
          const currentCount = countMap.get(app.job_posting_id) || 0;
          countMap.set(app.job_posting_id, currentCount + 1);
        });

        // Add application_count to each job
        const jobsWithCounts = jobs.map((job) => ({
          ...job,
          application_count: countMap.get(job.id) || 0,
        }));

        return NextResponse.json({ jobs: jobsWithCounts });
      }
    }

    // If counting fails, return jobs without counts
    const jobsWithCounts = (jobs || []).map((job) => ({
      ...job,
      application_count: 0,
    }));

    return NextResponse.json({ jobs: jobsWithCounts });
  } catch (error: any) {
    console.error("Error in GET /api/admin/careers/jobs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new job posting (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = jobPostingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: job, error } = await supabaseAdmin
      .from("job_postings")
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      console.error("Error creating job posting:", error);
      return NextResponse.json(
        { error: "Failed to create job posting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/careers/jobs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update job posting (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Job posting ID is required" }, { status: 400 });
    }

    const validationResult = jobPostingSchema.partial().safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: job, error } = await supabaseAdmin
      .from("job_postings")
      .update(validationResult.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job posting:", error);
      return NextResponse.json(
        { error: "Failed to update job posting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/careers/jobs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete job posting (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job posting ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("job_postings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job posting:", error);
      return NextResponse.json(
        { error: "Failed to delete job posting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/careers/jobs:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
