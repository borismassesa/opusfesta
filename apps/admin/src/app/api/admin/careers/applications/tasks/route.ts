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

// Get authenticated user ID - since isAdmin() already verified the user, we can trust the token
async function getAuthenticatedUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("No authorization header - user should be authenticated");
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token in authorization header");
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || !user.id) {
    throw new Error("Failed to get user from token - user should be authenticated");
  }

  // Return the user ID - since isAdmin() already verified they exist in users table
  return user.id;
}

// Validation helpers
function validateTask(body: any): { valid: boolean; data?: any; error?: string } {
  const errors: string[] = [];
  
  if (!body.application_id || typeof body.application_id !== "string") {
    errors.push("Application ID is required");
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.application_id)) {
      errors.push("Invalid application ID format");
    }
  }
  
  if (!body.task_type || typeof body.task_type !== "string" || body.task_type.trim().length === 0) {
    errors.push("Task type is required");
  }
  
  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (errors.length > 0) {
    return { valid: false, error: errors.join(", ") };
  }
  
  return {
    valid: true,
    data: {
      application_id: body.application_id,
      task_type: body.task_type.trim(),
      title: body.title.trim(),
    },
  };
}

function validateUpdateTask(body: any): { valid: boolean; data?: any; error?: string } {
  if (!body.id || typeof body.id !== "string") {
    return { valid: false, error: "Task ID is required" };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(body.id)) {
    return { valid: false, error: "Invalid task ID format" };
  }
  
  const update: any = { id: body.id };
  
  if (body.completed !== undefined) {
    update.completed = Boolean(body.completed);
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return { valid: false, error: "Title cannot be empty" };
    }
    update.title = body.title.trim();
  }
  if (body.task_type !== undefined) {
    if (typeof body.task_type !== "string" || body.task_type.trim().length === 0) {
      return { valid: false, error: "Task type cannot be empty" };
    }
    update.task_type = body.task_type.trim();
  }
  
  return { valid: true, data: update };
}

// GET - Get all tasks for an application
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

    // Try to fetch tasks - start with simple query to avoid foreign key issues
    let { data: tasks, error } = await supabaseAdmin
      .from("application_tasks")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    // If there's an error, check if it's a table/relation issue
    if (error) {
      // Check if the error is about the table not existing
      if (error.message?.includes("relation") || error.message?.includes("does not exist") || error.code === "42P01") {
        console.warn("application_tasks table may not exist or have issues:", error.message);
        // Return empty array if table doesn't exist - this allows the feature to work
        // even if the table hasn't been created yet
        return NextResponse.json({ tasks: [] });
      }
      
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks", details: error.message },
        { status: 500 }
      );
    }

    // If we have tasks, try to fetch user data for completed_by
    if (tasks && tasks.length > 0) {
      const completedByUserIds = tasks
        .filter(t => t.completed_by)
        .map(t => t.completed_by)
        .filter((id, index, self) => self.indexOf(id) === index); // unique IDs
      
      if (completedByUserIds.length > 0) {
        const { data: users } = await supabaseAdmin
          .from("users")
          .select("id, email, full_name")
          .in("id", completedByUserIds);
        
        // Map users to tasks
        if (users) {
          const userMap = new Map(users.map(u => [u.id, u]));
          tasks = tasks.map(task => ({
            ...task,
            completed_by_user: task.completed_by ? userMap.get(task.completed_by) || null : null
          }));
        }
      } else {
        // Add null completed_by_user to all tasks if no completed_by values
        tasks = tasks.map(task => ({
          ...task,
          completed_by_user: null
        }));
      }
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error("Error in GET /api/admin/careers/applications/tasks:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    // Get authenticated user ID - since isAdmin() passed, user is guaranteed to be authenticated
    const userId = await getAuthenticatedUserId(request);

    const body = await request.json();
    const validation = validateTask(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { data: task, error } = await supabaseAdmin
      .from("application_tasks")
      .insert(validation.data!)
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    // Log task creation to activity log
    await supabaseAdmin
      .from("application_activity_log")
      .insert({
        application_id: validation.data!.application_id,
        action_type: "task_created",
        action_details: {
          task_id: task.id,
          task_type: task.task_type,
          title: task.title,
        },
        performed_by: userId,
      });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/careers/applications/tasks:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a task (mark complete/incomplete or update fields)
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    // Get authenticated user ID - since isAdmin() passed, user is guaranteed to be authenticated
    const userId = await getAuthenticatedUserId(request);

    const body = await request.json();
    const validation = validateUpdateTask(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data!;

    // Get current task to check if completion status changed
    const { data: currentTask } = await supabaseAdmin
      .from("application_tasks")
      .select("application_id, completed")
      .eq("id", id)
      .single();

    // Build update object
    const update: any = { ...updateData };
    if (updateData.completed !== undefined) {
      if (updateData.completed) {
        update.completed_by = userId;
        update.completed_at = new Date().toISOString();
      } else {
        update.completed_by = null;
        update.completed_at = null;
      }
    }

    const { data: task, error } = await supabaseAdmin
      .from("application_tasks")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Log task completion/change to activity log
    if (currentTask && updateData.completed !== undefined && currentTask.completed !== updateData.completed) {
      await supabaseAdmin
        .from("application_activity_log")
        .insert({
          application_id: currentTask.application_id,
          action_type: updateData.completed ? "task_completed" : "task_uncompleted",
          action_details: {
            task_id: task.id,
            task_type: task.task_type,
            title: task.title,
          },
          performed_by: userId,
        });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/careers/applications/tasks:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get task before deleting to log it
    const { data: task } = await supabaseAdmin
      .from("application_tasks")
      .select("application_id, task_type, title")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("application_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    // Log task deletion to activity log
    if (task) {
      // Get authenticated user ID - since isAdmin() passed, user is guaranteed to be authenticated
      const userId = await getAuthenticatedUserId(request);

      await supabaseAdmin
        .from("application_activity_log")
        .insert({
          application_id: task.application_id,
          action_type: "task_deleted",
          action_details: {
            task_type: task.task_type,
            title: task.title,
          },
          performed_by: userId,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/careers/applications/tasks:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
