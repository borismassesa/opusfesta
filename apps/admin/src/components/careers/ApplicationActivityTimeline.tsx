"use client";

import React, { useState, useEffect } from "react";
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
      if (action_details?.has_notes) {
        const notePreview = action_details?.new_notes 
          ? (action_details.new_notes.length > 100 
              ? action_details.new_notes.substring(0, 100) + "..." 
              : action_details.new_notes)
          : "";
        return notePreview 
          ? `Note added: "${notePreview}"`
          : "Note added or updated";
      }
      return "Note cleared";
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

function formatActionDetails(activity: ActivityLog): React.ReactNode | null {
  const { action_type, action_details } = activity;

  // Don't show raw JSON for most actions - the description is enough
  if (!action_details || Object.keys(action_details).length === 0) {
    return null;
  }

  // Only show formatted details for specific action types that need extra context
  switch (action_type) {
    case "note_added":
      // Show full note content if it's longer than what's in the description
      if (action_details?.has_notes && action_details?.new_notes && action_details.new_notes.length > 100) {
        return (
          <div className="mt-2 p-3 bg-muted/50 rounded border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Note Content:</p>
            <p className="text-sm whitespace-pre-wrap">{action_details.new_notes}</p>
          </div>
        );
      }
      return null;
    
    case "status_changed":
      // Status changes are already well-described, no need for extra details
      return null;
    
    default:
      // For other actions, don't show raw JSON unless it's really needed
      return null;
  }
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim().length > 0) {
    // Remove extra spaces and split
    const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
    
    // If we have multiple words (first and last name), use first letter of each
    if (parts.length >= 2) {
      const first = parts[0][0]?.toUpperCase() || '';
      const last = parts[parts.length - 1][0]?.toUpperCase() || '';
      if (first && last) {
        return `${first}${last}`;
      }
    }
    
    // If single word or initials are too short, use first 2 letters of the name
    // But skip if it's already 2 characters (likely already initials)
    if (name.length === 2 && name === name.toUpperCase()) {
      // This might already be initials, try to get better from email
      if (email) {
        const emailParts = email.split('@')[0].split(/[._-]/);
        if (emailParts.length >= 2) {
          return `${emailParts[0][0]?.toUpperCase() || ''}${emailParts[emailParts.length - 1][0]?.toUpperCase() || ''}`;
        }
      }
      return name.toUpperCase();
    }
    
    // Use first 2 meaningful characters
    const meaningful = name.replace(/[^a-zA-Z]/g, '').substring(0, 2);
    if (meaningful.length >= 2) {
      return meaningful.toUpperCase();
    }
  }
  
  // Fallback to email
  if (email) {
    const emailLocal = email.split('@')[0];
    // Try to split email by common separators
    const emailParts = emailLocal.split(/[._-]/);
    if (emailParts.length >= 2) {
      return `${emailParts[0][0]?.toUpperCase() || ''}${emailParts[emailParts.length - 1][0]?.toUpperCase() || ''}`;
    }
    return emailLocal.substring(0, 2).toUpperCase();
  }
  
  return "??";
}

export function ApplicationActivityTimeline({ applicationId }: ApplicationActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchActivities();
  }, [applicationId, refreshKey]);

  // Expose refresh function via window event for external triggers
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('refresh-activity-timeline', handleRefresh);
    return () => {
      window.removeEventListener('refresh-activity-timeline', handleRefresh);
    };
  }, []);

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setActivities(data.activities || []);
      // Clear any previous errors on successful fetch
      setError(null);
    } catch (err) {
      console.error("Error fetching activities:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load activity log";
      setError(errorMessage);
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
                        {formatActionDetails(activity)}
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
                          ) : activity.performed_by ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {activity.performed_by.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                Admin User
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Legacy Entry</span>
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
