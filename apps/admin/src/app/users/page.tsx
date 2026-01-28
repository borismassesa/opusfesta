"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { UsersTable } from "./components/UsersTable";
import { UserDialog } from "./components/UserDialog";
import { UsersSidebar } from "@/components/users/UsersSidebar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: "user" | "vendor" | "admin";
  created_at: string;
  updated_at: string;
  // Vendor-specific
  vendor?: {
    id: string;
    business_name: string;
    category: string;
    slug: string;
  };
  // Applicant-specific
  application_count?: number;
  latest_application_date?: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"vendors" | "couples" | "applicants" | "admins">("vendors");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userCounts, setUserCounts] = useState({
    vendors: 0,
    couples: 0,
    applicants: 0,
    admins: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchAllCounts();
  }, [activeTab, searchQuery]);

  const fetchAllCounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch counts for all types in parallel
      const [vendorsRes, couplesRes, applicantsRes, adminsRes] = await Promise.all([
        fetch(getAdminApiUrl("/api/admin/users?type=vendors"), {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(getAdminApiUrl("/api/admin/users?type=couples"), {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(getAdminApiUrl("/api/admin/users?type=applicants"), {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(getAdminApiUrl("/api/admin/users?type=admins"), {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const vendorsData = vendorsRes.ok ? await vendorsRes.json() : { users: [] };
      const couplesData = couplesRes.ok ? await couplesRes.json() : { users: [] };
      const applicantsData = applicantsRes.ok ? await applicantsRes.json() : { users: [] };
      const adminsData = adminsRes.ok ? await adminsRes.json() : { users: [] };

      setUserCounts({
        vendors: vendorsData.users?.length || 0,
        couples: couplesData.users?.length || 0,
        applicants: applicantsData.users?.length || 0,
        admins: adminsData.users?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching user counts:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      params.append("type", activeTab);
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/users?${params.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        getAdminApiUrl(`/api/admin/users?id=${user.id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh after edit
  };

  return (
    <div className="flex h-full overflow-hidden bg-background relative w-full">
      <UsersSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={userCounts}
        loading={loading}
      />
      <main className="flex-1 min-w-0 overflow-auto bg-background">
        <div className="p-3 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  className="pl-10 h-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="gap-2 shrink-0">
                <UserPlus className="w-4 h-4" />
                Create User
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/50 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Users Table */}
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="pt-0 p-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <UsersTable
                  users={users}
                  type={activeTab}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <UserDialog
        user={selectedUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
