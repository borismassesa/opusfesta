'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser, useClerk } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { updateVendorSlug } from '@/lib/supabase/vendor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import {
  User,
  Building2,
  Bell,
  AlertTriangle,
  ExternalLink,
  Check,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const supabase = useClerkSupabaseClient();
  const {
    vendorId,
    vendorSlug,
    vendorName,
    isAccessLoading,
  } = useVendorPortalAccess();

  const [newSlug, setNewSlug] = useState('');
  const [slugInitialized, setSlugInitialized] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize slug input once vendorSlug is available
  if (vendorSlug && !slugInitialized) {
    setNewSlug(vendorSlug);
    setSlugInitialized(true);
  }

  // Slug uniqueness check
  const {
    data: isSlugAvailable,
    isFetching: isCheckingSlug,
  } = useQuery({
    queryKey: ['slug-check', newSlug],
    queryFn: async () => {
      if (!newSlug || newSlug === vendorSlug) return true;
      const { data } = await supabase
        .from('vendors')
        .select('id')
        .eq('slug', newSlug)
        .maybeSingle();
      return !data;
    },
    enabled: !!newSlug && newSlug !== vendorSlug && newSlug.length >= 2,
    staleTime: 5000,
  });

  // Save slug mutation
  const slugMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) throw new Error('No vendor profile found');
      const success = await updateVendorSlug(vendorId, newSlug);
      if (!success) throw new Error('Failed to update slug');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      toast.success('Vendor slug updated successfully.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update slug');
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) throw new Error('No vendor profile found');
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      toast.success('Vendor profile deleted.');
      router.push('/onboarding');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete vendor profile');
    },
  });

  const slugChanged = newSlug !== vendorSlug;
  const canSaveSlug = slugChanged && isSlugAvailable && !isCheckingSlug && newSlug.length >= 2;

  if (!isUserLoaded || isAccessLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:px-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, business profile, and preferences.
        </p>
      </div>

      {/* Account Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your personal account information managed by Clerk.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-1">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium mt-1">
                {user?.primaryEmailAddress?.emailAddress || 'Not set'}
              </p>
            </div>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openUserProfile()}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Account
          </Button>
        </CardContent>
      </Card>

      {/* Business Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your vendor profile URL and view business details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vendor-slug">Vendor URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">/vendors/</span>
              <Input
                id="vendor-slug"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                      .replace(/--+/g, '-')
                  )
                }
                placeholder="your-business-name"
                className="max-w-xs"
              />
              {isCheckingSlug && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {slugChanged && !isCheckingSlug && isSlugAvailable && newSlug.length >= 2 && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {slugChanged && !isCheckingSlug && isSlugAvailable === false && (
                <span className="text-xs text-destructive">Slug already taken</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This is the public URL for your vendor storefront.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Business Name</Label>
            <p className="text-sm text-muted-foreground">
              {vendorName || 'Not set'}{' '}
              <span className="text-xs">(editable in Storefront)</span>
            </p>
          </div>

          <Button
            size="sm"
            disabled={!canSaveSlug || slugMutation.isPending}
            onClick={() => slugMutation.mutate()}
          >
            {slugMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-3">
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose which emails you receive.</CardDescription>
              </div>
              <Badge variant="secondary">Coming soon</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 opacity-60 pointer-events-none">
            <label className="flex items-center gap-3 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Email notifications for new inquiries</span>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Email notifications for new messages</span>
            </label>
            <label className="flex items-center gap-3 cursor-not-allowed">
              <input type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-input" />
              <span className="text-sm">Email notifications for new reviews</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your vendor profile.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteDialog ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Vendor Profile
            </Button>
          ) : (
            <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium">
                Are you sure you want to delete your vendor profile? This action cannot be undone.
              </p>
              <p className="text-sm text-muted-foreground">
                Type <span className="font-mono font-semibold text-foreground">{vendorName}</span> to confirm.
              </p>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type vendor name to confirm"
                className="max-w-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirmName !== vendorName || deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Permanently Delete'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
