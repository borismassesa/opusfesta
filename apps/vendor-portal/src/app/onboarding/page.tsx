'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Store, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { toast } from '@/lib/toast';

function statusLabel(status: string | null): string {
  switch (status) {
    case 'invited':
      return 'Invitation Pending';
    case 'in_progress':
      return 'Profile In Progress';
    case 'pending_review':
      return 'Pending Review';
    case 'active':
      return 'Active';
    case 'suspended':
      return 'Suspended';
    default:
      return 'Not Started';
  }
}

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const supabase = useClerkSupabaseClient();
  const {
    isAuthLoaded,
    isAccessLoading,
    onboardingStatus,
    vendorName,
    vendorId,
    suspensionReason,
    isSuspended,
    isActiveVendor,
  } = useVendorPortalAccess();

  const markReadyMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) {
        throw new Error('Vendor profile is required');
      }

      const { error } = await supabase
        .from('vendors')
        .update({
          onboarding_status: 'active',
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', vendorId);

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      toast.success('Onboarding completed. Welcome to your dashboard.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update onboarding status';
      toast.error(message);
    },
  });

  if (!isAuthLoaded || isAccessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
      <Card>
        <CardHeader className="space-y-3">
          <Badge className="w-fit">{statusLabel(onboardingStatus)}</Badge>
          <CardTitle className="text-2xl">
            {vendorName ? `${vendorName} onboarding` : 'Vendor onboarding'}
          </CardTitle>
          <CardDescription>
            Complete and maintain your storefront profile so your vendor account can stay active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSuspended && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Account requires attention</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {suspensionReason || 'Please update your storefront details and contact support to restore access.'}
              </p>
            </div>
          )}

          {onboardingStatus === 'pending_review' && (
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Submission under review</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile has been submitted. You can still update details while you wait.
              </p>
            </div>
          )}

          {isActiveVendor && (
            <div className="rounded-lg border border-green-600/30 bg-green-600/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Your account is active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Onboarding is complete. You can continue managing your business from the dashboard.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/storefront">
                <Store className="mr-2 h-4 w-4" />
                {vendorId ? 'Update Storefront' : 'Create Storefront'}
              </Link>
            </Button>
            {!isActiveVendor &&
              vendorId &&
              (onboardingStatus === 'invited' || onboardingStatus === 'in_progress') && (
              <Button
                variant="secondary"
                onClick={() => markReadyMutation.mutate()}
                disabled={markReadyMutation.isPending}
              >
                {markReadyMutation.isPending ? 'Saving...' : 'Mark Profile Ready'}
              </Button>
            )}
            {isActiveVendor && (
              <Button asChild variant="outline">
                <Link href="/">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
