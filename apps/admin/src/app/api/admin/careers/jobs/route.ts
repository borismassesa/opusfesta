import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");
  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return false;

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return userData?.role === "admin";
}

// Validation helper
function validateJobPosting(body: any): { valid: boolean; data?: any; error?: string } {
  const errors: string[] = [];
  
  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!body.department || typeof body.department !== "string" || body.department.trim().length === 0) {
    errors.push("Department is required");
  }
  if (!body.location || typeof body.location !== "string" || body.location.trim().length === 0) {
    errors.push("Location is required");
  }
  if (!body.employment_type || typeof body.employment_type !== "string" || body.employment_type.trim().length === 0) {
    errors.push("Employment type is required");
  }
  if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
    errors.push("Description is required");
  }
  
  if (errors.length > 0) {
    return { valid: false, error: errors.join(", ") };
  }
  
  // Prepare data with defaults
  const data = {
    title: body.title?.trim(),
    department: body.department?.trim(),
    location: body.location?.trim(),
    employment_type: body.employment_type?.trim(),
    description: body.description?.trim(),
    requirements: Array.isArray(body.requirements) ? body.requirements : [],
    responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : [],
    salary_range: body.salary_range || null,
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    about_thefesta: body.about_thefesta || null,
    benefits: Array.isArray(body.benefits) ? body.benefits : [],
    growth_description: body.growth_description || null,
    hiring_process: Array.isArray(body.hiring_process) ? body.hiring_process : [],
    how_to_apply: body.how_to_apply || null,
    equal_opportunity_statement: body.equal_opportunity_statement || null,
  };
  
  return { valid: true, data };
}

// GET - List all job postings (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Use RPC function or subquery to get application counts
    // First, get all jobs
    let query = supabaseAdmin.from("job_postings").select("*");

    if (!includeInactive) {
      query = query.eq("is_active", true);
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
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateJobPosting(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: job, error } = await supabaseAdmin
      .from("job_postings")
      .insert(validation.data!)
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
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Job posting ID is required" }, { status: 400 });
    }

    // For updates, we allow partial data - just validate what's provided
    const update: any = {};
    if (updateData.title !== undefined) {
      if (typeof updateData.title !== "string" || updateData.title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      update.title = updateData.title.trim();
    }
    if (updateData.department !== undefined) {
      if (typeof updateData.department !== "string" || updateData.department.trim().length === 0) {
        return NextResponse.json({ error: "Department cannot be empty" }, { status: 400 });
      }
      update.department = updateData.department.trim();
    }
    if (updateData.location !== undefined) {
      if (typeof updateData.location !== "string" || updateData.location.trim().length === 0) {
        return NextResponse.json({ error: "Location cannot be empty" }, { status: 400 });
      }
      update.location = updateData.location.trim();
    }
    if (updateData.employment_type !== undefined) {
      if (typeof updateData.employment_type !== "string" || updateData.employment_type.trim().length === 0) {
        return NextResponse.json({ error: "Employment type cannot be empty" }, { status: 400 });
      }
      update.employment_type = updateData.employment_type.trim();
    }
    if (updateData.description !== undefined) {
      if (typeof updateData.description !== "string" || updateData.description.trim().length === 0) {
        return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
      }
      update.description = updateData.description.trim();
    }
    if (updateData.requirements !== undefined) {
      update.requirements = Array.isArray(updateData.requirements) ? updateData.requirements : [];
    }
    if (updateData.responsibilities !== undefined) {
      update.responsibilities = Array.isArray(updateData.responsibilities) ? updateData.responsibilities : [];
    }
    if (updateData.salary_range !== undefined) {
      update.salary_range = updateData.salary_range || null;
    }
    if (updateData.is_active !== undefined) {
      update.is_active = Boolean(updateData.is_active);
    }
    if (updateData.about_thefesta !== undefined) {
      update.about_thefesta = updateData.about_thefesta || null;
    }
    if (updateData.benefits !== undefined) {
      update.benefits = Array.isArray(updateData.benefits) ? updateData.benefits : [];
    }
    if (updateData.growth_description !== undefined) {
      update.growth_description = updateData.growth_description || null;
    }
    if (updateData.hiring_process !== undefined) {
      update.hiring_process = Array.isArray(updateData.hiring_process) ? updateData.hiring_process : [];
    }
    if (updateData.how_to_apply !== undefined) {
      update.how_to_apply = updateData.how_to_apply || null;
    }
    if (updateData.equal_opportunity_statement !== undefined) {
      update.equal_opportunity_statement = updateData.equal_opportunity_statement || null;
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: job, error } = await supabaseAdmin
      .from("job_postings")
      .update(update)
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
    if (!(await isAdmin(request))) {
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
