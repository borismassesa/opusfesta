"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  application_id: string;
  action_type: string;
  action_details: any;
  performed_by: string | null;
  performed_at: string;
  metadata: any;
  performed_by_user?: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

interface ApplicationActivityTimelineProps {
  applicationId: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  status_changed: <UserCheck className="h-4 w-4" />,
  note_added: <MessageSquare className="h-4 w-4" />,
  task_completed: <CheckCircle2 className="h-4 w-4" />,
  task_created: <Plus className="h-4 w-4" />,
  task_uncompleted: <XCircle className="h-4 w-4" />,
  task_deleted: <Trash2 className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  status_changed: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  note_added: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  task_completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  task_created: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
  task_uncompleted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  task_deleted: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
};

function formatActionDescription(activity: ActivityLog): string {
  const { action_type, action_details } = activity;

  switch (action_type) {
    case "status_changed":
      return `Status changed from "${action_details?.old_status || "N/A"}" to "${action_details?.new_status || "N/A"}"`;
    case "note_added":
      return action_details?.has_notes
        ? "Note added or updated"
        : "Note removed";
    case "task_completed":
      return `Task completed: "${action_details?.title || "Unknown task"}"`;
    case "task_created":
      return `Task created: "${action_details?.title || "Unknown task"}"`;
    case "task_uncompleted":
      return `Task marked as incomplete: "${action_details?.title || "Unknown task"}"`;
    case "task_deleted":
      return `Task deleted: "${action_details?.title || "Unknown task"}"`;
    default:
      return "Activity performed";
  }
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "??";
}

export function ApplicationActivityTimeline({ applicationId }: ApplicationActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [applicationId]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/careers/applications/activity?applicationId=${applicationId}`),
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity log");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err instanceof Error ? err.message : "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Complete history of all actions taken on this application</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
            {error}
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {/* Activities */}
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 border-background",
                        actionColors[activity.action_type] || "bg-gray-100 text-gray-800"
                      )}
                    >
                      {actionIcons[activity.action_type] || <Clock className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              actionColors[activity.action_type] || "bg-gray-100 text-gray-800"
                            )}
                          >
                            {activity.action_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {formatActionDescription(activity)}
                        </p>
                        {activity.action_details && Object.keys(activity.action_details).length > 0 && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground font-mono">
                            {JSON.stringify(activity.action_details, null, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {activity.performed_by_user ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(
                                    activity.performed_by_user.full_name,
                                    activity.performed_by_user.email
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {activity.performed_by_user.full_name || activity.performed_by_user.email}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">System</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.performed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
