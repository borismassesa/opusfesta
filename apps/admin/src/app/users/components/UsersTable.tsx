"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "vendor":
        return "default";
      default:
        return "secondary";
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            {type === "vendors" && (
              <>
                <TableHead>Business</TableHead>
                <TableHead>Category</TableHead>
              </>
            )}
            {type === "applicants" && (
              <>
                <TableHead>Applications</TableHead>
                <TableHead>Latest Application</TableHead>
              </>
            )}
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name || ""} />
                    <AvatarFallback>
                      {getUserInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || "No name"}</div>
                    {user.name && (
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || "-"}</TableCell>
              {type === "vendors" && (
                <>
                  <TableCell>
                    {user.vendor?.business_name || "-"}
                  </TableCell>
                  <TableCell>
                    {user.vendor?.category ? (
                      <Badge variant="outline">{user.vendor.category}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </>
              )}
              {type === "applicants" && (
                <>
                  <TableCell>
                    <Badge variant="outline">{user.application_count || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.latest_application_date
                      ? formatDate(user.latest_application_date)
                      : "-"}
                  </TableCell>
                </>
              )}
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
