"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getAdminApiUrl } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Loader2, Upload, Image as ImageIcon, User, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

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

interface UserDialogProps {
  user: User | null; // null for creating new user
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function UserDialog({ user, open, onOpenChange, onClose }: UserDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isCreating = !user;
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    role: (user?.role || "user") as "user" | "vendor" | "admin",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "",
        role: user.role,
        password: "",
        confirmPassword: "",
      });
    } else {
      // Reset form for new user
      setFormData({
        name: "",
        email: "",
        phone: "",
        avatar: "",
        role: "user",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      if (isCreating) {
        // Validate password for new users
        if (!formData.password || formData.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        // Create new user
        const response = await fetch(getAdminApiUrl(`/api/admin/users`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone || null,
            avatar: formData.avatar || null,
            role: formData.role,
            userType: formData.role === "vendor" ? "vendor" : "couple",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to create user");
        }

        toast.success("User created successfully!");
      } else {
        // Update existing user
        const response = await fetch(getAdminApiUrl(`/api/admin/users`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: user!.id,
            ...formData,
            phone: formData.phone || null,
            avatar: formData.avatar || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update user");
        }

        toast.success("User updated successfully!");
      }

      onClose();
    } catch (err) {
      console.error(`Error ${isCreating ? "creating" : "updating"} user:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${isCreating ? "create" : "update"} user`);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? "Create New User" : "User Details"}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Create a new user account. The user will be able to log in immediately."
              : "View and edit user information. Changes will be saved immediately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Avatar - Show for both creating and editing */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={formData.avatar || undefined} 
                alt={formData.name || ""}
                key={formData.avatar} // Force re-render when avatar changes
              />
              <AvatarFallback className="text-lg">
                {getUserInitials(formData.name, formData.email)}
              </AvatarFallback>
            </Avatar>
            {!isCreating && (
              <div>
                <p className="font-semibold">{formData.name || "No name"}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <Badge variant={user!.role === "admin" ? "destructive" : user!.role === "vendor" ? "default" : "secondary"} className="mt-1">
                  {user!.role}
                </Badge>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "user" | "vendor" | "admin") =>
                  setFormData({ ...formData, role: value })
                }
                disabled={!isCreating && user!.role === "admin"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Couple)</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="admin" disabled={!isCreating}>
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
              {!isCreating && user!.role === "admin" && (
                <p className="text-xs text-muted-foreground">
                  Admin role cannot be changed
                </p>
              )}
            </div>
          </div>

          {/* Password fields for new users */}
          {isCreating && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  required={isCreating}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Avatar</Label>
            <AvatarUpload
              value={formData.avatar || ""}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
              userId={user?.id || "new"}
            />
          </div>

          {/* Type-specific Information */}
          {!isCreating && user!.vendor && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold">Vendor Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Business Name:</span>
                  <p className="font-medium">{user!.vendor.business_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{user!.vendor.category}</p>
                </div>
              </div>
              <Link
                href={`/marketplace/vendors/${user!.vendor.slug}`}
                target="_blank"
                className="text-sm text-primary hover:underline"
              >
                View Vendor Profile →
              </Link>
            </div>
          )}

          {!isCreating && user!.application_count !== undefined && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold">Job Application Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Applications:</span>
                  <p className="font-medium">{user!.application_count}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Latest Application:</span>
                  <p className="font-medium">
                    {user!.latest_application_date
                      ? formatDate(user!.latest_application_date)
                      : "N/A"}
                  </p>
                </div>
              </div>
              <Link
                href={`/careers/applications?userId=${user!.id}`}
                className="text-sm text-primary hover:underline"
              >
                View Applications →
              </Link>
            </div>
          )}

          {/* Metadata */}
          {!isCreating && (
            <div className="rounded-lg border p-4 space-y-2">
              <h3 className="font-semibold">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{formatDate(user!.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{formatDate(user!.updated_at || user!.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AvatarUpload({
  value,
  onChange,
  userId,
}: {
  value: string;
  onChange: (url: string) => void;
  userId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only images for avatar
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("File must be an image (JPG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (5MB for avatar)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null);
    
    // Create immediate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      // Update parent immediately with preview URL so avatar updates in real-time
      onChange(previewUrl);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop() || "jpg";
      // Use "temp" folder for new users, actual user ID for existing
      const folderId = userId === "new" ? `temp-${timestamp}` : userId;
      const fileName = `${folderId}/avatar/${timestamp}-${randomStr}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("cms")
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload avatar");
      }

      if (!data) {
        throw new Error("Upload failed: No data returned");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("cms")
        .getPublicUrl(data.path);

      // Update with final URL and clear preview
      setPreview(null);
      onChange(urlData.publicUrl);
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar");
      // Clear preview on error
      setPreview(null);
      // Revert to original value on error
      onChange(value);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasAvatar = !!value || !!preview;
  const displayUrl = preview || value;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={displayUrl || undefined} alt="Avatar" />
          <AvatarFallback>
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {hasAvatar ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Change Avatar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Avatar
                  </>
                )}
              </Button>
            )}
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, or GIF. Max 5MB.
          </p>
        </div>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif"
      />
    </div>
  );
}
