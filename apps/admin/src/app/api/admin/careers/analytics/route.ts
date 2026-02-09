import { NextRequest, NextResponse } from "next/server";
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

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam === "all" ? null : parseInt(daysParam || "30", 10);

    // Calculate date filter
    const dateFilter = days
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Get job statistics
    const { data: allJobs, error: jobsError } = await supabaseAdmin
      .from("job_postings")
      .select("id, is_active");

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
    }

    const totalJobs = allJobs?.length || 0;
    const activeJobs = allJobs?.filter((j) => j.is_active).length || 0;
    const inactiveJobs = totalJobs - activeJobs;

    // Get application statistics
    let applicationsQuery = supabaseAdmin
      .from("job_applications")
      .select("id, status, created_at, job_posting_id, job_postings!inner(department)");

    if (dateFilter) {
      applicationsQuery = applicationsQuery.gte("created_at", dateFilter);
    }

    const { data: applications, error: applicationsError } = await applicationsQuery;

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    const totalApplications = applications?.length || 0;

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
    const timeSeries: Record<string, number> = {};
    applications?.forEach((app) => {
      const date = new Date(app.created_at).toISOString().split("T")[0];
      timeSeries[date] = (timeSeries[date] || 0) + 1;
    });

    const applicationsOverTime = Object.entries(timeSeries)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Applications per job
    const jobCounts: Record<string, number> = {};
    const jobTitles: Record<string, string> = {};

    applications?.forEach((app) => {
      const jobId = app.job_posting_id;
      jobCounts[jobId] = (jobCounts[jobId] || 0) + 1;
    });

    // Get job titles
    if (Object.keys(jobCounts).length > 0) {
      const { data: jobs } = await supabaseAdmin
        .from("job_postings")
        .select("id, title")
        .in("id", Object.keys(jobCounts));

      jobs?.forEach((job) => {
        jobTitles[job.id] = job.title;
      });
    }

    const applicationsPerJob = Object.entries(jobCounts)
      .map(([jobId, count]) => ({
        job: jobTitles[jobId] || `Job ${jobId.substring(0, 8)}`,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Top departments
    const departmentCounts: Record<string, number> = {};
    applications?.forEach((app) => {
      const dept = (app.job_postings as any)?.department || "Unknown";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const topDepartments = Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalJobs,
      activeJobs,
      inactiveJobs,
      totalApplications,
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
