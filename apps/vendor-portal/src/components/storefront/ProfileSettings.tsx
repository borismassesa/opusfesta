'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateVendor, type Vendor } from '@/lib/supabase/vendor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Loader2, Save } from 'lucide-react';

const profileSettingsSchema = z.object({
  years_in_business: z.number().int().positive().nullable().optional(),
  team_size: z.number().int().positive().nullable().optional(),
});

type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;

interface ProfileSettingsProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

export function ProfileSettings({ vendor, onUpdate }: ProfileSettingsProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      years_in_business: vendor?.years_in_business || null,
      team_size: vendor?.team_size || null,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileSettingsValues) => {
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      const updated = await updateVendor(vendor.id, data);
      if (!updated) {
        throw new Error('Failed to update profile');
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      onUpdate();
      toast.success('Profile settings updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile settings');
    },
  });

  const onSubmit = (data: ProfileSettingsValues) => {
    updateMutation.mutate(data);
  };

  // Calculate stats (read-only)
  const reviewCount = vendor?.stats?.reviewCount || 0;
  const averageRating = vendor?.stats?.averageRating || 0;
  const totalBookings = vendor?.stats?.inquiryCount || 0;

  return (
    <Card id="section-profile-settings" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile settings below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor ? (
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please complete your vendor profile in the "About" section first.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Read-only Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-border">
            <div>
              <div className="text-2xl font-bold">{reviewCount}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_in_business">Years in Business</Label>
              <Input
                id="years_in_business"
                type="number"
                min="0"
                {...form.register('years_in_business', { valueAsNumber: true })}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                This appears in your profile stats on the public page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size">Team Size (Optional)</Label>
              <Input
                id="team_size"
                type="number"
                min="1"
                {...form.register('team_size', { valueAsNumber: true })}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Number of team members (optional)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={updateMutation.isPending || !vendor}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  );
}
