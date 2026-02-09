'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, X, Loader2, Star } from 'lucide-react';
import {
  getVendorPackages,
  updateVendorPackages,
} from '@/lib/supabase/vendor';
import type { VendorPackage } from '@/lib/supabase/vendor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';

interface LocalPackage {
  _tempId: string;
  id?: string;
  name: string;
  starting_price: number;
  duration: string;
  features: string[];
  is_popular: boolean;
}

interface PackagesEditorProps {
  vendorId: string;
  onUpdate: () => void;
  onNextSection: () => void;
}

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PackagesEditor({
  vendorId,
  onUpdate,
  onNextSection,
}: PackagesEditorProps) {
  const queryClient = useQueryClient();
  const [packages, setPackages] = useState<LocalPackage[]>([]);
  const [featureInputs, setFeatureInputs] = useState<Record<string, string>>(
    {}
  );
  const [initialized, setInitialized] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['vendor-packages', vendorId],
    queryFn: async () => {
      const data = await getVendorPackages(vendorId);
      if (!initialized) {
        setPackages(
          data.map((pkg) => ({
            _tempId: pkg.id || createTempId(),
            id: pkg.id,
            name: pkg.name,
            starting_price: pkg.starting_price,
            duration: pkg.duration,
            features: pkg.features ?? [],
            is_popular: pkg.is_popular ?? false,
          }))
        );
        setInitialized(true);
      }
      return data;
    },
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (pkgs: LocalPackage[]) => {
      const cleaned: VendorPackage[] = pkgs.map((p, i) => ({
        id: p.id,
        vendor_id: vendorId,
        name: p.name,
        starting_price: p.starting_price,
        duration: p.duration,
        features: p.features,
        is_popular: p.is_popular,
        display_order: i,
      }));
      const success = await updateVendorPackages(vendorId, cleaned);
      if (!success) throw new Error('Failed to save packages');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-packages', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Packages saved!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save packages');
    },
  });

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        _tempId: createTempId(),
        name: '',
        starting_price: 0,
        duration: '',
        features: [],
        is_popular: false,
      },
    ]);
  };

  const removePackage = (tempId: string) => {
    setPackages((prev) => prev.filter((p) => p._tempId !== tempId));
  };

  const updatePackage = (
    tempId: string,
    field: keyof Omit<LocalPackage, '_tempId' | 'id' | 'features'>,
    value: string | number | boolean
  ) => {
    setPackages((prev) =>
      prev.map((p) => (p._tempId === tempId ? { ...p, [field]: value } : p))
    );
  };

  const togglePopular = (tempId: string) => {
    setPackages((prev) =>
      prev.map((p) => ({
        ...p,
        is_popular: p._tempId === tempId ? !p.is_popular : false,
      }))
    );
  };

  const addFeature = (tempId: string) => {
    const text = (featureInputs[tempId] ?? '').trim();
    if (!text) return;
    setPackages((prev) =>
      prev.map((p) =>
        p._tempId === tempId
          ? { ...p, features: [...p.features, text] }
          : p
      )
    );
    setFeatureInputs((prev) => ({ ...prev, [tempId]: '' }));
  };

  const removeFeature = (tempId: string, featureIndex: number) => {
    setPackages((prev) =>
      prev.map((p) =>
        p._tempId === tempId
          ? { ...p, features: p.features.filter((_, i) => i !== featureIndex) }
          : p
      )
    );
  };

  const handleSave = () => {
    const valid = packages.filter((p) => p.name.trim());
    mutation.mutate(valid);
  };

  const handleSaveAndContinue = () => {
    const valid = packages.filter((p) => p.name.trim());
    mutation.mutate(valid, {
      onSuccess: () => onNextSection(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <DollarSign className="mb-4 h-14 w-14 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No packages yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Create pricing packages for your services so clients know what to
            expect.
          </p>
          <Button className="mt-6" onClick={addPackage}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <Card key={pkg._tempId}>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Package Name *</Label>
                  <Input
                    value={pkg.name}
                    onChange={(e) =>
                      updatePackage(pkg._tempId, 'name', e.target.value)
                    }
                    placeholder="e.g. Silver Package"
                  />
                </div>
                <div>
                  <Label>Starting Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={pkg.starting_price || ''}
                    onChange={(e) =>
                      updatePackage(
                        pkg._tempId,
                        'starting_price',
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={pkg.duration}
                    onChange={(e) =>
                      updatePackage(pkg._tempId, 'duration', e.target.value)
                    }
                    placeholder="e.g. 8 hours"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removePackage(pkg._tempId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Popular toggle */}
            <div>
              <Button
                type="button"
                variant={pkg.is_popular ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePopular(pkg._tempId)}
              >
                <Star
                  className={`mr-1.5 h-3.5 w-3.5 ${
                    pkg.is_popular ? 'fill-current' : ''
                  }`}
                />
                {pkg.is_popular ? 'Popular' : 'Mark as Popular'}
              </Button>
            </div>

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {pkg.features.map((feature, fi) => (
                  <Badge key={fi} variant="secondary" className="gap-1 pr-1">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(pkg._tempId, fi)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={featureInputs[pkg._tempId] ?? ''}
                  onChange={(e) =>
                    setFeatureInputs((prev) => ({
                      ...prev,
                      [pkg._tempId]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature(pkg._tempId);
                    }
                  }}
                  placeholder="Add a feature"
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature(pkg._tempId)}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addPackage}>
        <Plus className="mr-2 h-4 w-4" />
        Add Package
      </Button>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Packages
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
