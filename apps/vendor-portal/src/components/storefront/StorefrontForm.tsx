'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ImageUpload } from './ImageUpload';
import { updateVendor, createVendor, generateSlug, type Vendor } from '@/lib/supabase/vendor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { Loader2, Save, Check } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useState } from 'react';

const vendorCategories = [
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

// Custom URL validator that auto-adds https:// if missing and handles social media handles
// Completely optional - only validates if user provides a value
const urlSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform((val) => {
    // If empty, return empty string (completely optional)
    if (!val || val.trim() === '') return '';
    
    const trimmed = val.trim();
    
    // If it already has a protocol, return as is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Handle social media handles (e.g., @username) - return as-is
    if (trimmed.startsWith('@')) {
      return trimmed;
    }
    
    // Otherwise, add https://
    return `https://${trimmed}`;
  })
  .pipe(
    z
      .string()
      .refine(
        (val) => {
          // Empty is always valid (optional field)
          if (!val || val === '') return true;
          // Allow @ handles
          if (val.startsWith('@')) return true;
          // Validate URL format
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'Please enter a valid URL or handle' }
      )
      .optional()
      .or(z.literal(''))
  );

const storefrontFormSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  category: z.enum(vendorCategories),
  custom_category: z.string().optional(),
  bio: z.string().max(200, 'Short bio must be 200 characters or less').optional(),
  description: z.string().optional(),
  logo: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }),
  contact_info: z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    website: urlSchema,
  }),
  social_links: z.object({
    instagram: urlSchema,
    facebook: urlSchema,
    twitter: urlSchema,
    tiktok: urlSchema,
  }),
  years_in_business: z.number().int().positive().nullable().optional(),
  team_size: z.number().int().positive().nullable().optional(),
}).refine((data) => {
  // If category is "Others", custom_category is required
  if (data.category === 'Others') {
    return data.custom_category && data.custom_category.trim().length > 0;
  }
  return true;
}, {
  message: 'Please enter your business type',
  path: ['custom_category'],
});

type StorefrontFormValues = z.infer<typeof storefrontFormSchema>;

interface StorefrontFormProps {
  vendor: Vendor | null;
  userId: string | null;
  onUpdate: () => void;
  onNextSection?: () => void;
}

export function StorefrontForm({ vendor, userId, onUpdate, onNextSection }: StorefrontFormProps) {
  const queryClient = useQueryClient();
  const isCreateMode = !vendor;
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Determine if vendor has a custom category
  const vendorCategory = vendor?.category || '';
  const isCustomCategory = vendorCategory && !vendorCategories.includes(vendorCategory as typeof vendorCategories[number]);
  
  const form = useForm<StorefrontFormValues>({
    resolver: zodResolver(storefrontFormSchema),
    defaultValues: {
      business_name: vendor?.business_name || '',
      category: isCustomCategory ? 'Others' : ((vendor?.category as typeof vendorCategories[number]) || 'Photographers'),
      custom_category: isCustomCategory ? vendorCategory : '',
      bio: vendor?.bio || '',
      description: vendor?.description || '',
      logo: vendor?.logo || null,
      cover_image: vendor?.cover_image || null,
      location: vendor?.location || {
        city: '',
        country: 'Tanzania',
        address: '',
        coordinates: undefined,
      },
      contact_info: vendor?.contact_info || {
        email: '',
        phone: '',
        website: '',
      },
      social_links: vendor?.social_links || {
        instagram: '',
        facebook: '',
        twitter: '',
        tiktok: '',
      },
      years_in_business: vendor?.years_in_business || null,
      team_size: vendor?.team_size || null,
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: StorefrontFormValues) => {
      if (isCreateMode) {
        // Create new vendor
        if (!userId) {
          throw new Error('User ID is required to create vendor profile');
        }

        const newVendor = await createVendor(userId, {
          business_name: data.business_name,
          category: data.category === 'Others' && data.custom_category ? data.custom_category : data.category,
          subcategories: [],
          bio: data.bio || null,
          description: data.description || null,
          logo: data.logo || null,
          cover_image: data.cover_image || null,
          location: data.location,
          contact_info: data.contact_info,
          social_links: data.social_links,
          years_in_business: data.years_in_business || null,
          team_size: data.team_size || null,
        });

        if (!newVendor) {
          throw new Error('Failed to create vendor profile');
        }

        return newVendor;
      } else {
        // Update existing vendor
        if (!vendor) {
          throw new Error('Vendor not found');
        }

        // Generate slug if business name changed
        const slug = data.business_name !== vendor.business_name
          ? generateSlug(data.business_name)
          : vendor.slug;

        // Use custom_category if "Others" is selected, otherwise use the selected category
        const categoryValue = data.category === 'Others' && data.custom_category 
          ? data.custom_category 
          : data.category;

        // Remove custom_category from the data as it's not a vendor field
        const { custom_category, ...vendorData } = data;

        const updated = await updateVendor(vendor.id, {
          ...vendorData,
          category: categoryValue,
          slug,
        });

        if (!updated) {
          throw new Error('Failed to update vendor');
        }

        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      onUpdate();
      toast.success(isCreateMode ? 'Vendor profile created successfully!' : 'Storefront updated successfully');
      
      // Navigate to next section after successful save (only in update mode, not create mode)
      if (!isCreateMode && onNextSection) {
        setTimeout(() => {
          onNextSection();
        }, 500); // Small delay to show success message
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (isCreateMode ? 'Failed to create vendor profile' : 'Failed to update storefront'));
    },
  });

  const onSubmit = (data: StorefrontFormValues) => {
    createOrUpdateMutation.mutate(data);
  };

  // Auto-save functionality (only for update mode, not create mode)
  const handleAutoSave = async (data: StorefrontFormValues) => {
    if (isCreateMode || !vendor) return;
    
    setIsAutoSaving(true);
    try {
      const slug = data.business_name !== vendor.business_name
        ? generateSlug(data.business_name)
        : vendor.slug;

      // Use custom_category if "Others" is selected, otherwise use the selected category
      const categoryValue = data.category === 'Others' && data.custom_category 
        ? data.custom_category 
        : data.category;

      // Remove custom_category from the data as it's not a vendor field
      const { custom_category, ...vendorData } = data;

      const updated = await updateVendor(vendor.id, {
        ...vendorData,
        category: categoryValue,
        slug,
      });

      if (updated) {
        queryClient.invalidateQueries({ queryKey: ['vendor'] });
        setLastSaved(new Date());
        // Don't show toast for auto-save to avoid notification spam
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Enable auto-save only in update mode
  useAutoSave({
    form,
    onSave: handleAutoSave,
    enabled: !isCreateMode && !!vendor,
    delay: 2000, // 2 seconds after user stops typing
  });

  return (
    <Card id="section-business-info" className="scroll-mt-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>Business Details</CardTitle>
            <CardDescription>
              Fill in your business information below.
            </CardDescription>
          </div>
          {!isCreateMode && lastSaved && !isAutoSaving && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4">
              <Check className="h-3 w-3 text-green-600" />
              <span className="hidden sm:inline">Saved</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                {...form.register('business_name')}
                placeholder="Your Business Name"
              />
              {form.formState.errors.business_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.business_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => {
                  form.setValue('category', value as typeof vendorCategories[number]);
                  // Clear custom_category when switching away from "Others"
                  if (value !== 'Others') {
                    form.setValue('custom_category', '');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {vendorCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.watch('category') === 'Others' && (
                <div className="mt-2">
                  <Input
                    id="custom_category"
                    {...form.register('custom_category')}
                    placeholder="Enter your business type"
                  />
                  {form.formState.errors.custom_category && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.custom_category.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio & Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Short Bio</Label>
              <span className="text-xs text-muted-foreground">
                {form.watch('bio')?.length || 0} / 200 characters
              </span>
            </div>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Short intro shown in the About section when no full description is provided"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Used as a fallback in the About section if the full description is empty.
            </p>
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Tell couples about your business, your passion, and what makes you special"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              This appears in the "About" section on your public page.
            </p>
          </div>

          {/* Visual Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload
                currentImage={form.watch('logo')}
                onUpload={(url) => form.setValue('logo', url)}
                bucket="vendor-assets"
                folder="logos"
              />
              <p className="text-xs text-muted-foreground">
                Shown in the About section contact card.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                currentImage={form.watch('cover_image')}
                onUpload={(url) => form.setValue('cover_image', url)}
                bucket="vendor-assets"
                folder="covers"
              />
              <p className="text-xs text-muted-foreground">
                This is the main image shown in your gallery
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...form.register('location.city')}
                  placeholder="e.g., Dar es Salaam"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...form.register('location.country')}
                  placeholder="Tanzania"
                  defaultValue="Tanzania"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register('location.address')}
                placeholder="Street address (optional)"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Phone and website appear as icons in the About section. Email stays private.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('contact_info.email')}
                  placeholder="contact@yourbusiness.com"
                />
                <p className="text-xs text-muted-foreground">Not shown on your public storefront.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...form.register('contact_info.phone')}
                  placeholder="+255 XXX XXX XXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="text"
                {...form.register('contact_info.website')}
                placeholder="www.yourwebsite.com or https://yourwebsite.com"
              />
              {form.formState.errors.contact_info?.website && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.contact_info.website.message}
                </p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Social Media Links</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Instagram, Facebook, and Twitter appear as icons in the About section.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="text"
                  {...form.register('social_links.instagram')}
                  placeholder="instagram.com/yourhandle or @yourhandle"
                />
                {form.formState.errors.social_links?.instagram && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.social_links.instagram.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="text"
                  {...form.register('social_links.facebook')}
                  placeholder="facebook.com/yourpage"
                />
                {form.formState.errors.social_links?.facebook && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.social_links.facebook.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  type="text"
                  {...form.register('social_links.twitter')}
                  placeholder="twitter.com/yourhandle or @yourhandle"
                />
                {form.formState.errors.social_links?.twitter && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.social_links.twitter.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  type="text"
                  {...form.register('social_links.tiktok')}
                  placeholder="tiktok.com/@yourhandle or @yourhandle"
                />
                <p className="text-xs text-muted-foreground">
                  Shown in the Connect section, not in the About icons.
                </p>
                {form.formState.errors.social_links?.tiktok && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.social_links.tiktok.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Years in Business & Team Size */}
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
                Displayed in the About section.
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
                Displayed in the About section.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={createOrUpdateMutation.isPending}>
              {createOrUpdateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreateMode ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isCreateMode ? 'Create Profile' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
