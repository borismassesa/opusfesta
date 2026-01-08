import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

// Task schema
const taskSchema = z.object({
  application_id: z.string().uuid(),
  task_type: z.string().min(1, "Task type is required"),
  title: z.string().min(1, "Title is required"),
});

const updateTaskSchema = z.object({
  id: z.string().uuid(),
  completed: z.boolean().optional(),
  title: z.string().optional(),
  task_type: z.string().optional(),
});

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

    const { data: tasks, error } = await supabaseAdmin
      .from("application_tasks")
      .select(`
        *,
        completed_by_user:users!application_tasks_completed_by_fkey (
          id,
          email,
          full_name
        )
      `)
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
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

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(token || "");

    const body = await request.json();
    const validationResult = taskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { data: task, error } = await supabaseAdmin
      .from("application_tasks")
      .insert(validationResult.data)
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
        application_id: validationResult.data.application_id,
        action_type: "task_created",
        action_details: {
          task_id: task.id,
          task_type: task.task_type,
          title: task.title,
        },
        performed_by: user?.id || null,
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

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabaseAdmin.auth.getUser(token || "");

    const body = await request.json();
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validationResult.data;

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
        update.completed_by = user?.id || null;
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
          performed_by: user?.id || null,
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
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");
      const { data: { user } } = await supabaseAdmin.auth.getUser(token || "");

      await supabaseAdmin
        .from("application_activity_log")
        .insert({
          application_id: task.application_id,
          action_type: "task_deleted",
          action_details: {
            task_type: task.task_type,
            title: task.title,
          },
          performed_by: user?.id || null,
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
