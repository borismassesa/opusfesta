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

// GET - Get activity log for an application
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    // Try to fetch activities - start with simple query to avoid foreign key issues
    let { data: activities, error } = await supabaseAdmin
      .from("application_activity_log")
      .select("*")
      .eq("application_id", applicationId)
      .order("performed_at", { ascending: false });

    // If there's an error, check if it's a table/relation issue
    if (error) {
      // Check if the error is about the table not existing
      if (error.message?.includes("relation") || error.message?.includes("does not exist") || error.code === "42P01") {
        console.warn("application_activity_log table may not exist or have issues:", error.message);
        // Return empty array if table doesn't exist - this allows the feature to work
        // even if the table hasn't been created yet
        return NextResponse.json({ activities: [] });
      }
      
      console.error("Error fetching activity log:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity log", details: error.message },
        { status: 500 }
      );
    }

    // Deduplicate activities - filter out entries that are duplicates
    // Prefer entries with performed_by (user ID) over those without
    if (activities && activities.length > 0) {
      // Group activities by a key that includes application_id, action_type, and normalized action_details
      const activityGroups = new Map<string, typeof activities>();
      
      for (const activity of activities) {
        // Normalize action_details for comparison (sort keys and stringify)
        const normalizedDetails = activity.action_details 
          ? JSON.stringify(activity.action_details, Object.keys(activity.action_details).sort())
          : '';

        // Create a key without timestamp to group similar activities
        const groupKey = `${activity.application_id}|${activity.action_type}|${normalizedDetails}`;
        
        if (!activityGroups.has(groupKey)) {
          activityGroups.set(groupKey, []);
        }
        activityGroups.get(groupKey)!.push(activity);
      }

      // For each group, keep only the best entry (prefer entries with performed_by, then most recent)
      const deduplicatedActivities: typeof activities = [];
      
      for (const [, groupActivities] of activityGroups.entries()) {
        // If only one entry in group, keep it
        if (groupActivities.length === 1) {
          deduplicatedActivities.push(groupActivities[0]);
          continue;
        }

        // Sort: entries with performed_by first, then by timestamp (most recent first)
        groupActivities.sort((a, b) => {
          const aHasUser = a.performed_by ? 1 : 0;
          const bHasUser = b.performed_by ? 1 : 0;
          
          // If one has user and other doesn't, prefer the one with user
          if (aHasUser !== bHasUser) {
            return bHasUser - aHasUser;
          }
          
          // If both have user or both don't, prefer most recent
          return new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime();
        });

        // Check if entries are within 5 seconds of each other (likely duplicates)
        const bestEntry = groupActivities[0];
        const bestTime = new Date(bestEntry.performed_at).getTime();
        const hasNearbyDuplicate = groupActivities.some((activity, index) => {
          if (index === 0) return false; // Skip the first one (best entry)
          const activityTime = new Date(activity.performed_at).getTime();
          const timeDiff = Math.abs(bestTime - activityTime);
          return timeDiff <= 5000; // 5 seconds
        });

        // If there are nearby duplicates, only keep the best one
        // Otherwise, keep all entries (they're not duplicates)
        if (hasNearbyDuplicate) {
          deduplicatedActivities.push(bestEntry);
        } else {
          // No nearby duplicates, keep all entries
          deduplicatedActivities.push(...groupActivities);
        }
      }

      // Sort all activities by performed_at (most recent first)
      deduplicatedActivities.sort((a, b) => 
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
      );

      // Filter out entries without performed_by (legacy duplicates)
      // These are old entries created before we fixed user context tracking
      activities = deduplicatedActivities.filter(activity => activity.performed_by !== null);
    }

    // If we have activities, try to fetch user data for performed_by
    if (activities && activities.length > 0) {
      const performedByUserIds = activities
        .filter(a => a.performed_by)
        .map(a => a.performed_by)
        .filter((id, index, self) => self.indexOf(id) === index); // unique IDs
      
      if (performedByUserIds.length > 0) {
        // First try to get user data from public.users table
        const { data: users, error: usersError } = await supabaseAdmin
          .from("users")
          .select("id, email, full_name, name")
          .in("id", performedByUserIds);
        
        if (usersError) {
          console.error("Error fetching users for activity log:", usersError);
        }
        
        // Also try to get user metadata from auth.users for better name data
        const userMap = new Map();
        
        if (users && users.length > 0) {
          // Process users from public.users table
          for (const user of users) {
            // Prefer full_name, fallback to name, then email
            const displayName = user.full_name || user.name || user.email?.split('@')[0] || 'Unknown';
            const displayEmail = user.email || 'unknown@example.com';
            
            userMap.set(user.id, {
              id: user.id,
              email: displayEmail,
              full_name: displayName !== 'Unknown' && displayName !== displayEmail?.split('@')[0] 
                ? displayName 
                : null
            });
          }
        }
        
        // Try to get additional user data from auth.users for any missing users
        for (const userId of performedByUserIds) {
          if (!userMap.has(userId)) {
            try {
              const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
              if (authUser?.user) {
                const metadata = authUser.user.user_metadata || {};
                const appMetadata = authUser.user.app_metadata || {};
                const displayName = metadata.full_name || metadata.name || authUser.user.email?.split('@')[0] || 'Unknown';
                const displayEmail = authUser.user.email || 'unknown@example.com';
                
                userMap.set(userId, {
                  id: userId,
                  email: displayEmail,
                  full_name: displayName !== 'Unknown' && displayName !== displayEmail?.split('@')[0]
                    ? displayName
                    : null
                });
              }
            } catch (err) {
              // If we can't get auth user data, that's okay - we'll use what we have
              console.warn(`Could not fetch auth user data for ${userId}:`, err);
            }
          }
        }
        
        // Map users to activities
        if (userMap.size > 0) {
          activities = activities.map(activity => ({
            ...activity,
            performed_by_user: activity.performed_by ? userMap.get(activity.performed_by) || null : null
          }));
        } else {
          // If user lookup failed, at least keep the performed_by ID
          activities = activities.map(activity => ({
            ...activity,
            performed_by_user: null
          }));
        }
      } else {
        // No performed_by values - these are old entries or system-generated
        // Log a warning for entries without performed_by
        const activitiesWithoutUser = activities.filter(a => !a.performed_by);
        if (activitiesWithoutUser.length > 0) {
          console.warn(`Found ${activitiesWithoutUser.length} activities without performed_by user ID`);
        }
        activities = activities.map(activity => ({
          ...activity,
          performed_by_user: null
        }));
      }
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error: any) {
    console.error("Error in GET /api/admin/careers/applications/activity:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
