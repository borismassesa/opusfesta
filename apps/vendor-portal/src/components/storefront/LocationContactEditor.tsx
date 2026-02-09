'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { updateVendor } from '@/lib/supabase/vendor';
import type { Vendor } from '@/lib/supabase/vendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';

const locationContactSchema = z.object({
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  tiktok: z.string().optional().or(z.literal('')),
});

type LocationContactValues = z.infer<typeof locationContactSchema>;

interface LocationContactEditorProps {
  vendor: Vendor;
  onUpdate: () => void;
  onNextSection: () => void;
}

export function LocationContactEditor({
  vendor,
  onUpdate,
  onNextSection,
}: LocationContactEditorProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationContactValues>({
    resolver: zodResolver(locationContactSchema),
    defaultValues: {
      city: vendor.location?.city ?? '',
      country: vendor.location?.country ?? 'Tanzania',
      address: vendor.location?.address ?? '',
      email: vendor.contact_info?.email ?? '',
      phone: vendor.contact_info?.phone ?? '',
      website: vendor.contact_info?.website ?? '',
      instagram: vendor.social_links?.instagram ?? '',
      facebook: vendor.social_links?.facebook ?? '',
      twitter: vendor.social_links?.twitter ?? '',
      tiktok: vendor.social_links?.tiktok ?? '',
    },
  });

  useEffect(() => {
    reset({
      city: vendor.location?.city ?? '',
      country: vendor.location?.country ?? 'Tanzania',
      address: vendor.location?.address ?? '',
      email: vendor.contact_info?.email ?? '',
      phone: vendor.contact_info?.phone ?? '',
      website: vendor.contact_info?.website ?? '',
      instagram: vendor.social_links?.instagram ?? '',
      facebook: vendor.social_links?.facebook ?? '',
      twitter: vendor.social_links?.twitter ?? '',
      tiktok: vendor.social_links?.tiktok ?? '',
    });
  }, [vendor, reset]);

  const mutation = useMutation({
    mutationFn: async (values: LocationContactValues) => {
      const result = await updateVendor(vendor.id, {
        location: {
          city: values.city || undefined,
          country: values.country || 'Tanzania',
          address: values.address || undefined,
        },
        contact_info: {
          email: values.email || undefined,
          phone: values.phone || undefined,
          website: values.website || undefined,
        },
        social_links: {
          instagram: values.instagram || undefined,
          facebook: values.facebook || undefined,
          twitter: values.twitter || undefined,
          tiktok: values.tiktok || undefined,
        },
      });
      if (!result) throw new Error('Failed to save');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Location & contact info saved!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    },
  });

  const onSubmit = (values: LocationContactValues) => {
    mutation.mutate(values);
  };

  const onSaveAndContinue = (values: LocationContactValues) => {
    mutation.mutate(values, {
      onSuccess: () => onNextSection(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} placeholder="e.g. Dar es Salaam" />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} placeholder="Tanzania" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Street address or area"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@yourbusiness.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+255 xxx xxx xxx"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register('website')}
              placeholder="https://yourbusiness.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              {...register('instagram')}
              placeholder="@yourbusiness or URL"
            />
          </div>
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              {...register('facebook')}
              placeholder="Page name or URL"
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter / X</Label>
            <Input
              id="twitter"
              {...register('twitter')}
              placeholder="@handle or URL"
            />
          </div>
          <div>
            <Label htmlFor="tiktok">TikTok</Label>
            <Input
              id="tiktok"
              {...register('tiktok')}
              placeholder="@handle or URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={handleSubmit(onSaveAndContinue)}
        >
          Save & Continue
        </Button>
      </div>
    </form>
  );
}
