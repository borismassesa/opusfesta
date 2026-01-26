"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: "user" | "vendor" | "admin";
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    business_name: string;
    category: string;
    slug: string;
  };
  application_count?: number;
  latest_application_date?: string | null;
}

interface UsersTableProps {
  users: User[];
  type: "vendors" | "couples" | "applicants";
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({ users, type, onEdit, onDelete }: UsersTableProps) {
  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; color: string; darkColor: string }> = {
      admin: { label: "Admin", color: "bg-red-500 text-white", darkColor: "dark:bg-red-600 dark:text-white" },
      vendor: { label: "Vendor", color: "bg-blue-500 text-white", darkColor: "dark:bg-blue-600 dark:text-white" },
      user: { label: "User", color: "bg-gray-500 text-white", darkColor: "dark:bg-gray-600 dark:text-white" },
    };
    const config = roleConfig[role] || { label: role, color: "bg-gray-500 text-white", darkColor: "dark:bg-gray-600 dark:text-white" };
    return (
      <Badge className={cn("font-medium border-0", config.color, config.darkColor)}>
        {config.label}
      </Badge>
    );
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="border border-border dark:border-border rounded-lg overflow-hidden bg-white dark:bg-card w-full">
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table className="min-w-[900px] sm:min-w-0">
            <TableHeader>
              <TableRow className="border-b border-border dark:border-border">
                <TableHead className="w-12">
                  <Checkbox aria-label="Select all" />
                </TableHead>
                <TableHead className="min-w-[200px] sm:min-w-0">User</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                {type === "vendors" && (
                  <>
                    <TableHead className="hidden lg:table-cell">Business</TableHead>
                    <TableHead className="hidden xl:table-cell">Category</TableHead>
                  </>
                )}
                {type === "applicants" && (
                  <>
                    <TableHead className="hidden lg:table-cell">Applications</TableHead>
                    <TableHead className="hidden xl:table-cell">Latest Application</TableHead>
                  </>
                )}
                <TableHead className="whitespace-nowrap">Role</TableHead>
                <TableHead className="hidden md:table-cell whitespace-nowrap">Created</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  className="border-b border-border dark:border-border bg-white dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox aria-label={`Select ${user.name || user.email}`} />
                  </TableCell>
                  <TableCell className="min-w-[200px] sm:min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={user.avatar || undefined} alt={user.name || ""} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {getUserInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-foreground dark:text-foreground truncate">
                          {user.name || "No name"}
                        </span>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground dark:text-muted-foreground sm:hidden mt-1">
                          <span className="truncate">{user.email}</span>
                          {user.phone && (
                            <>
                              <span>•</span>
                              <span>{user.phone}</span>
                            </>
                          )}
                          {type === "vendors" && user.vendor?.business_name && (
                            <>
                              <span>•</span>
                              <span className="truncate">{user.vendor.business_name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-foreground dark:text-foreground break-all">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-foreground dark:text-foreground whitespace-nowrap">{user.phone || "-"}</TableCell>
                  {type === "vendors" && (
                    <>
                      <TableCell className="hidden lg:table-cell text-foreground dark:text-foreground break-words min-w-[150px]">
                        {user.vendor?.business_name || "-"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell whitespace-nowrap">
                        {user.vendor?.category ? (
                          <span className="text-sm text-foreground dark:text-foreground">
                            {user.vendor.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground dark:text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </>
                  )}
                  {type === "applicants" && (
                    <>
                      <TableCell className="hidden lg:table-cell whitespace-nowrap">
                        <span className="text-sm text-foreground dark:text-foreground">
                          {user.application_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                        {user.latest_application_date
                          ? formatDate(user.latest_application_date)
                          : "-"}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground dark:text-muted-foreground whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                        onClick={() => onDelete(user)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                        onClick={() => onEdit(user)}
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 dark:hover:bg-muted/50"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-popover dark:border-border">
                          <DropdownMenuItem 
                            onClick={() => onEdit(user)} 
                            className="dark:hover:bg-accent dark:text-foreground"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
