"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ApplicationTask {
  id: string;
  application_id: string;
  task_type: string;
  title: string;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  completed_by_user?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface ApplicationTaskChecklistProps {
  applicationId: string;
}

export function ApplicationTaskChecklist({ applicationId }: ApplicationTaskChecklistProps) {
  const [tasks, setTasks] = useState<ApplicationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("custom");

  useEffect(() => {
    fetchTasks();
  }, [applicationId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/careers/applications/tasks?applicationId=${applicationId}`),
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications/tasks`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: taskId,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      alert(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setIsAddingTask(true);
      const response = await fetch(getAdminApiUrl(`/api/admin/careers/applications/tasks`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          application_id: applicationId,
          task_type: newTaskType,
          title: newTaskTitle.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      setNewTaskTitle("");
      setNewTaskType("custom");
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      alert(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        getAdminApiUrl(`/api/admin/careers/applications/tasks?id=${taskId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {completedCount} of {totalCount} completed
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks yet. Add a task to get started.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  task.completed
                    ? "bg-muted/50 border-muted"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                <button
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </div>
                  {task.completed && task.completed_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed{" "}
                      {task.completed_by_user
                        ? `by ${task.completed_by_user.full_name || task.completed_by_user.email}`
                        : ""}{" "}
                      on {new Date(task.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add Task Form */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAddingTask) {
                  handleAddTask();
                }
              }}
              disabled={isAddingTask}
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || isAddingTask}
              size="icon"
            >
              {isAddingTask ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
