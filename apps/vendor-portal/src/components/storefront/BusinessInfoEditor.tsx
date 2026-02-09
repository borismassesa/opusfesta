'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createVendor, updateVendor } from '@/lib/supabase/vendor';
import type { Vendor } from '@/lib/supabase/vendor';
import { ImageUpload } from './ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';

const CATEGORIES = [
  'Venues',
  'Photographers',
  'Videographers',
  'Caterers',
  'Wedding Planners',
  'Florists',
  'DJs & Music',
  'Beauty & Makeup',
  'Bridal Salons',
  'Cake & Desserts',
  'Decorators',
  'Officiants',
  'Rentals',
  'Transportation',
  'Others',
] as const;

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

const businessInfoSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  price_range: z.string().optional().or(z.literal('')),
  years_in_business: z.coerce.number().min(0).optional().or(z.literal('')),
  team_size: z.coerce.number().min(0).optional().or(z.literal('')),
});

type BusinessInfoValues = z.infer<typeof businessInfoSchema>;

interface BusinessInfoEditorProps {
  vendor: Vendor | null;
  dbUserId: string;
  onUpdate: () => void;
  onNextSection: () => void;
}

export function BusinessInfoEditor({
  vendor,
  dbUserId,
  onUpdate,
  onNextSection,
}: BusinessInfoEditorProps) {
  const queryClient = useQueryClient();
  const isCreateMode = !vendor;

  const [logo, setLogo] = useState<string | null>(vendor?.logo ?? null);
  const [coverImage, setCoverImage] = useState<string | null>(vendor?.cover_image ?? null);
  const [customCategory, setCustomCategory] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BusinessInfoValues>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      business_name: vendor?.business_name ?? '',
      category: vendor?.category ?? '',
      bio: vendor?.bio ?? '',
      description: vendor?.description ?? '',
      price_range: vendor?.price_range ?? '',
      years_in_business: vendor?.years_in_business ?? '',
      team_size: vendor?.team_size ?? '',
    },
  });

  const selectedCategory = watch('category');
  const bioValue = watch('bio') ?? '';

  useEffect(() => {
    if (vendor) {
      reset({
        business_name: vendor.business_name ?? '',
        category: vendor.category ?? '',
        bio: vendor.bio ?? '',
        description: vendor.description ?? '',
        price_range: vendor.price_range ?? '',
        years_in_business: vendor.years_in_business ?? '',
        team_size: vendor.team_size ?? '',
      });
      setLogo(vendor.logo ?? null);
      setCoverImage(vendor.cover_image ?? null);
    }
  }, [vendor, reset]);

  const createMutation = useMutation({
    mutationFn: async (values: BusinessInfoValues) => {
      const category =
        values.category === 'Others' && customCategory.trim()
          ? customCategory.trim()
          : values.category;

      const result = await createVendor(dbUserId, {
        business_name: values.business_name,
        category,
        bio: values.bio || null,
        description: values.description || null,
        logo,
        cover_image: coverImage,
        price_range: values.price_range || null,
        years_in_business:
          typeof values.years_in_business === 'number'
            ? values.years_in_business
            : null,
        team_size:
          typeof values.team_size === 'number' ? values.team_size : null,
      });

      if (!result) {
        throw new Error('Failed to create vendor profile');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Vendor profile created!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: BusinessInfoValues) => {
      if (!vendor) throw new Error('No vendor to update');

      const category =
        values.category === 'Others' && customCategory.trim()
          ? customCategory.trim()
          : values.category;

      const result = await updateVendor(vendor.id, {
        business_name: values.business_name,
        category,
        bio: values.bio || null,
        description: values.description || null,
        logo,
        cover_image: coverImage,
        price_range: values.price_range || null,
        years_in_business:
          typeof values.years_in_business === 'number'
            ? values.years_in_business
            : null,
        team_size:
          typeof values.team_size === 'number' ? values.team_size : null,
      });

      if (!result) {
        throw new Error('Failed to update vendor profile');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Profile updated!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: BusinessInfoValues) => {
    if (isCreateMode) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate(values);
    }
  };

  const onSaveAndContinue = (values: BusinessInfoValues) => {
    if (isCreateMode) {
      createMutation.mutate(values, {
        onSuccess: () => onNextSection(),
      });
    } else {
      updateMutation.mutate(values, {
        onSuccess: () => onNextSection(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cover Image</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Recommended: 1200x400px, landscape orientation
            </p>
            <ImageUpload
              currentImage={coverImage}
              onUpload={setCoverImage}
              bucket="vendor-assets"
              folder="covers"
              aspectHint="wide"
              className="max-w-lg"
            />
          </div>
          <div>
            <Label>Logo</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Recommended: 400x400px, square
            </p>
            <ImageUpload
              currentImage={logo}
              onUpload={setLogo}
              bucket="vendor-assets"
              folder="logos"
              aspectHint="square"
              className="max-w-[160px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              {...register('business_name')}
              placeholder="Your business name"
            />
            {errors.business_name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.business_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setValue('category', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory === 'Others' && (
              <Input
                className="mt-2"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter your category"
              />
            )}
            {errors.category && (
              <p className="mt-1 text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="A short introduction (max 200 characters)"
              rows={2}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {bioValue.length}/200
            </p>
            {errors.bio && (
              <p className="mt-1 text-xs text-destructive">
                {errors.bio.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Tell potential clients about your business, experience, and what makes you unique..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price_range">Price Range</Label>
            <Select
              value={watch('price_range') as string}
              onValueChange={(val) => setValue('price_range', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((pr) => (
                  <SelectItem key={pr} value={pr}>
                    {pr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="years_in_business">Years in Business</Label>
            <Input
              id="years_in_business"
              type="number"
              min={0}
              {...register('years_in_business')}
              placeholder="e.g. 5"
            />
          </div>

          <div>
            <Label htmlFor="team_size">Team Size</Label>
            <Input
              id="team_size"
              type="number"
              min={0}
              {...register('team_size')}
              placeholder="e.g. 10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCreateMode ? 'Create Profile' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleSubmit(onSaveAndContinue)}
        >
          Save & Continue
        </Button>
      </div>
    </form>
  );
}
