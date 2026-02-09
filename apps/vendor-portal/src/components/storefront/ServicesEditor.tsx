'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, Trash2, Loader2 } from 'lucide-react';
import { updateVendor } from '@/lib/supabase/vendor';
import type { Vendor } from '@/lib/supabase/vendor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';

interface Service {
  title: string;
  description: string;
}

interface ServicesEditorProps {
  vendor: Vendor;
  onUpdate: () => void;
  onNextSection: () => void;
}

export function ServicesEditor({
  vendor,
  onUpdate,
  onNextSection,
}: ServicesEditorProps) {
  const queryClient = useQueryClient();
  const [services, setServices] = useState<Service[]>(
    () => (vendor.services_offered as Service[]) ?? []
  );

  const mutation = useMutation({
    mutationFn: async (updatedServices: Service[]) => {
      const result = await updateVendor(vendor.id, {
        services_offered: updatedServices,
      });
      if (!result) throw new Error('Failed to save services');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Services saved!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save services');
    },
  });

  const addService = () => {
    setServices((prev) => [...prev, { title: '', description: '' }]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateService = (
    index: number,
    field: keyof Service,
    value: string
  ) => {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    const filtered = services.filter((s) => s.title.trim());
    mutation.mutate(filtered);
  };

  const handleSaveAndContinue = () => {
    const filtered = services.filter((s) => s.title.trim());
    mutation.mutate(filtered, {
      onSuccess: () => onNextSection(),
    });
  };

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="mb-4 h-14 w-14 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No services yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Add services your clients can book. Describe what you offer to help
              clients understand your expertise.
            </p>
            <Button className="mt-6" onClick={addService}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <Input
                  value={service.title}
                  onChange={(e) =>
                    updateService(index, 'title', e.target.value)
                  }
                  placeholder="Service name"
                />
                <Textarea
                  value={service.description}
                  onChange={(e) =>
                    updateService(index, 'description', e.target.value)
                  }
                  placeholder="Describe this service..."
                  rows={2}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeService(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addService}>
        <Plus className="mr-2 h-4 w-4" />
        Add Service
      </Button>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Services
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveAndContinue}
          disabled={mutation.isPending}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
