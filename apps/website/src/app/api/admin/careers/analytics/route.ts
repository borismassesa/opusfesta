import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "30";

    // Calculate date filter
    let dateFilter: Date | null = null;
    if (days !== "all") {
      const daysNum = parseInt(days, 10);
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - daysNum);
    }

    // Get job postings stats
    let jobsQuery = supabaseAdmin.from("job_postings").select("id, is_active", { count: "exact" });
    if (dateFilter) {
      jobsQuery = jobsQuery.gte("created_at", dateFilter.toISOString());
    }
    const { data: jobs, count: totalJobs } = await jobsQuery;

    const activeJobs = jobs?.filter((j) => j.is_active).length || 0;
    const inactiveJobs = (totalJobs || 0) - activeJobs;

    // Get applications stats
    let applicationsQuery = supabaseAdmin
      .from("job_applications")
      .select("id, status, created_at, job_posting_id", { count: "exact" });
    if (dateFilter) {
      applicationsQuery = applicationsQuery.gte("created_at", dateFilter.toISOString());
    }
    const { data: applications, count: totalApplications } = await applicationsQuery;

    // Applications by status
    const statusCounts: Record<string, number> = {};
    applications?.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // Applications over time
    const timeCounts: Record<string, number> = {};
    applications?.forEach((app) => {
      const date = new Date(app.created_at).toISOString().split("T")[0];
      timeCounts[date] = (timeCounts[date] || 0) + 1;
    });
    const applicationsOverTime = Object.entries(timeCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Applications per job
    const jobCounts: Record<string, number> = {};
    const jobTitles: Record<string, string> = {};

    // Get job titles
    if (applications && applications.length > 0) {
      const jobIds = [...new Set(applications.map((app) => app.job_posting_id))];
      const { data: jobPostings } = await supabaseAdmin
        .from("job_postings")
        .select("id, title")
        .in("id", jobIds);

      jobPostings?.forEach((job) => {
        jobTitles[job.id] = job.title;
      });
    }

    applications?.forEach((app) => {
      const jobTitle = jobTitles[app.job_posting_id] || "Unknown";
      jobCounts[jobTitle] = (jobCounts[jobTitle] || 0) + 1;
    });
    const applicationsPerJob = Object.entries(jobCounts)
      .map(([job, count]) => ({ job, count }))
      .sort((a, b) => b.count - a.count);

    // Top departments
    const { data: allJobs } = await supabaseAdmin
      .from("job_postings")
      .select("id, department");
    
    const departmentCounts: Record<string, number> = {};
    applications?.forEach((app) => {
      const job = allJobs?.find((j) => j.id === app.job_posting_id);
      if (job) {
        departmentCounts[job.department] = (departmentCounts[job.department] || 0) + 1;
      }
    });
    const topDepartments = Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalJobs: totalJobs || 0,
      activeJobs,
      inactiveJobs,
      totalApplications: totalApplications || 0,
      applicationsByStatus,
      applicationsOverTime,
      applicationsPerJob,
      topDepartments,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/careers/analytics:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
