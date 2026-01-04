'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateVendor, type Vendor } from '@/lib/supabase/vendor';
import { toast } from '@/lib/toast';
import { Loader2, Plus, X, Save } from 'lucide-react';

const serviceItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
});

const servicesSchema = z.object({
  services_offered: z.array(serviceItemSchema).default([]),
});

type ServicesFormValues = z.infer<typeof servicesSchema>;

interface ServicesManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

export function ServicesManager({ vendor, onUpdate }: ServicesManagerProps) {
  const queryClient = useQueryClient();

  const form = useForm<ServicesFormValues>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      services_offered: vendor?.services_offered || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'services_offered',
  });

  useEffect(() => {
    form.reset({
      services_offered: vendor?.services_offered || [],
    });
  }, [form, vendor]);

  const updateMutation = useMutation({
    mutationFn: async (data: ServicesFormValues) => {
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      const cleanedServices = data.services_offered
        .map((service) => ({
          title: service.title.trim(),
          description: service.description.trim(),
        }))
        .filter((service) => service.title.length > 0);
      const updated = await updateVendor(vendor.id, {
        services_offered: cleanedServices,
      });
      if (!updated) {
        throw new Error('Failed to update services');
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      onUpdate();
      toast.success('Services updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update services');
    },
  });

  const onSubmit = (data: ServicesFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Card id="section-services" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          Manage the services you offer below.
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
          <div className="space-y-6">
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <div key={field.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`service-title-${index}`}>Service Title</Label>
                        <Input
                          id={`service-title-${index}`}
                          {...form.register(`services_offered.${index}.title` as const)}
                          placeholder="e.g., Full-service planning"
                        />
                        {form.formState.errors.services_offered?.[index]?.title && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.services_offered[index]?.title?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`service-description-${index}`}>Description</Label>
                        <Textarea
                          id={`service-description-${index}`}
                          {...form.register(`services_offered.${index}.description` as const)}
                          placeholder="Describe what this service includes..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label="Remove service"
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No services added yet. Click "Add service" below to get started.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => append({ title: '', description: '' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add service
            </Button>
            <p className="text-xs text-muted-foreground">
              If left blank, your storefront shows a default list based on your category.
            </p>
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
