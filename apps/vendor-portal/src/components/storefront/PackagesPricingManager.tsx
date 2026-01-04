'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  getVendorPackages,
  updateVendor,
  updateVendorPackages,
  type VendorPackage,
  type Vendor,
} from '@/lib/supabase/vendor';
import { Plus, Trash2, Edit2, Save, X, Star } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

const priceRanges = ['$', '$$', '$$$', '$$$$'] as const;

interface PackagesPricingManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

export function PackagesPricingManager({ vendor, onUpdate }: PackagesPricingManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [priceRange, setPriceRange] = useState<string>(vendor?.price_range || 'none');
  const queryClient = useQueryClient();

  useEffect(() => {
    setPriceRange(vendor?.price_range || 'none');
  }, [vendor?.price_range]);

  const { data: packages = [], isLoading, refetch } = useQuery({
    queryKey: ['packages', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPackages(vendor.id);
    },
    enabled: !!vendor,
  });

  const updateMutation = useMutation({
    mutationFn: async (newPackages: VendorPackage[]) => {
      if (!vendor) throw new Error('Vendor not found');
      await updateVendorPackages(vendor.id, newPackages);
      return newPackages;
    },
    onMutate: async (newPackages) => {
      if (!vendor?.id) return { previousPackages: [] };
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['packages', vendor.id] });
      
      // Snapshot the previous value
      const previousPackages = queryClient.getQueryData<VendorPackage[]>(['packages', vendor.id]) || [];
      
      // Optimistically update to the new value
      queryClient.setQueryData<VendorPackage[]>(['packages', vendor.id], newPackages);
      
      // Return a context object with the snapshotted value
      return { previousPackages };
    },
    onSuccess: async () => {
      // Refetch to ensure we have the latest data from the server
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['packages', vendor?.id] });
      onUpdate();
      // Don't close the form - keep it open so user can add more packages
      setEditingId(null);
      toast.success('Package saved successfully');
    },
    onError: (err, newPackages, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPackages) {
        queryClient.setQueryData(['packages', vendor?.id], context.previousPackages);
      }
      console.error('Failed to save package:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save package');
    },
  });

  const priceRangeMutation = useMutation({
    mutationFn: async (value: string | null) => {
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      const updated = await updateVendor(vendor.id, { price_range: value });
      if (!updated) {
        throw new Error('Failed to update price range');
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      onUpdate();
      toast.success('Price range updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update price range');
    },
  });

  const handleAdd = (pkg: VendorPackage) => {
    // Generate a temporary ID for new packages
    const newPackage: VendorPackage = {
      ...pkg,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vendor_id: vendor?.id || '',
      display_order: packages.length,
    };
    const newPackages = [...packages, newPackage];
    updateMutation.mutate(newPackages);
  };

  const handleUpdate = (id: string, updates: Partial<VendorPackage>) => {
    const newPackages = packages.map((pkg) =>
      pkg.id === id ? { ...pkg, ...updates } : pkg
    );
    updateMutation.mutate(newPackages);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const newPackages = packages.filter((pkg) => pkg.id !== id);
      updateMutation.mutate(newPackages);
    }
  };

  const handleSetPopular = (id: string) => {
    const newPackages = packages.map((pkg) => ({
      ...pkg,
      is_popular: pkg.id === id,
    }));
    updateMutation.mutate(newPackages);
  };

  const hasPriceRangeChanged = (vendor?.price_range || 'none') !== priceRange;

  return (
    <Card id="section-packages" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Packages & Pricing</CardTitle>
        <CardDescription>
          Manage your pricing packages and price level badge below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Complete your vendor profile in the "About" section first to save packages.
            </p>
          </div>
        ) : null}
        {isLoading && vendor ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
              {/* Section Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {packages.length > 0 ? `Your Packages (${packages.length})` : 'Your Packages'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {packages.length > 0 
                      ? 'Manage your pricing packages below' 
                      : 'Add your first package to get started'}
                  </p>
                </div>
                {!isAdding && (
                  <Button 
                    onClick={() => setIsAdding(true)} 
                    size="default"
                    disabled={!vendor}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Package
                  </Button>
                )}
              </div>

              {/* Add New Package Form */}
              {isAdding && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">
                      {packages.length > 0 ? 'Add New Package' : 'Create Your First Package'}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <PackageForm
                    onSave={(pkg) => {
                      handleAdd(pkg);
                      setIsAdding(false);
                    }}
                    onCancel={() => setIsAdding(false)}
                    isSaving={updateMutation.isPending}
                  />
                </div>
              )}

              {/* Saved Packages Grid */}
              {packages.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {packages.map((pkg) => (
                    <PackagePreviewCard
                      key={pkg.id || `temp-${pkg.name}`}
                      pkg={pkg}
                      isEditing={editingId === pkg.id}
                      onEdit={() => {
                        if (pkg.id) setEditingId(pkg.id);
                      }}
                      onSave={(fullPackage) => {
                        if (pkg.id) {
                          // Extract only the updatable fields (exclude id, vendor_id, timestamps)
                          const { id, vendor_id, created_at, updated_at, display_order, ...updates } = fullPackage;
                          handleUpdate(pkg.id, updates);
                        }
                      }}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => {
                        if (pkg.id) handleDelete(pkg.id);
                      }}
                      onSetPopular={() => {
                        if (pkg.id) handleSetPopular(pkg.id);
                      }}
                      isSaving={updateMutation.isPending}
                    />
                  ))}
                </div>
              )}

              {/* Empty State - only show when no packages and form is not open */}
              {packages.length === 0 && !isAdding && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-2">No packages yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add Package" above to create your first pricing package</p>
                </div>
              )}
            </div>
          )}

          {/* Price Range Section - Secondary Setting */}
          <div className="border-t border-border pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Price Level Badge</h3>
                <p className="text-xs text-muted-foreground">
                  Choose a price level badge ($ to $$$$) that will appear on your storefront listing. This helps customers quickly identify your pricing tier.
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="price_range" className="text-sm font-medium">Price Level</Label>
                  <Select
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value)}
                  >
                    <SelectTrigger id="price_range" className="w-full">
                      <SelectValue placeholder="Select price level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don't show badge</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range} {range === '$' ? '(Budget)' : range === '$$' ? '(Moderate)' : range === '$$$' ? '(Premium)' : '(Luxury)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      priceRangeMutation.mutate(
                        priceRange === 'none' ? null : (priceRange as typeof priceRanges[number])
                      )
                    }
                    disabled={!vendor || !hasPriceRangeChanged || priceRangeMutation.isPending}
                    variant={hasPriceRangeChanged ? "default" : "outline"}
                    size="default"
                    className="min-w-[100px]"
                  >
                    {priceRangeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PackageFormProps {
  onSave: (pkg: VendorPackage) => void;
  onCancel: () => void;
  isSaving: boolean;
  initialData?: VendorPackage;
}

function PackageForm({ onSave, onCancel, isSaving, initialData }: PackageFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [startingPrice, setStartingPrice] = useState(initialData?.starting_price?.toString() || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [features, setFeatures] = useState<string[]>(initialData?.features || ['']);
  const [isPopular, setIsPopular] = useState(initialData?.is_popular || false);

  // Reset form after successful save (when isSaving goes from true to false and we're adding new)
  const prevIsSaving = useRef(isSaving);
  useEffect(() => {
    if (prevIsSaving.current && !isSaving && !initialData) {
      // Save just completed, reset form
      setName('');
      setStartingPrice('');
      setDuration('');
      setFeatures(['']);
      setIsPopular(false);
    }
    prevIsSaving.current = isSaving;
  }, [isSaving, initialData]);

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const packageData: VendorPackage = {
      vendor_id: initialData?.vendor_id || '', // Preserve vendor_id if editing
      name,
      starting_price: parseFloat(startingPrice) || 0,
      duration,
      features: features.filter((f) => f.trim() !== ''),
      is_popular: isPopular,
      display_order: initialData?.display_order ?? 0, // Preserve display_order if editing
    };
    // Preserve id if editing
    if (initialData?.id) {
      packageData.id = initialData.id;
    }
    onSave(packageData);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? 'Edit Package' : 'Add Package'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="package_name">Package Name *</Label>
            <Input
              id="package_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Reception Package"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starting_price">Starting Price (TZS) *</Label>
              <Input
                id="starting_price"
                type="number"
                min="0"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="2500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 4 hours"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="e.g., Free consultation"
                />
                {features.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFeature}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_popular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="is_popular" className="cursor-pointer">
              Mark as "Most Popular"
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !name || !startingPrice || !duration}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface PackagePreviewCardProps {
  pkg: VendorPackage;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (fullPackage: VendorPackage) => void;
  onCancel: () => void;
  onDelete: () => void;
  onSetPopular: () => void;
  isSaving: boolean;
}

function PackagePreviewCard({
  pkg,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSetPopular,
  isSaving,
}: PackagePreviewCardProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  if (isEditing) {
    return (
      <PackageForm
        initialData={pkg}
        onSave={(fullPackage) => onSave(fullPackage)}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    // If duration is just a number, append "hours"
    const trimmed = duration.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed} hours`;
    }
    // Otherwise, return as-is (user may have entered "4 hours", "2 days", etc.)
    return trimmed;
  };

  return (
    <Card className={pkg.is_popular ? 'border-primary border-2' : 'border-border'}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm truncate">{pkg.name}</h4>
              {pkg.is_popular && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                  <Star className="h-3 w-3" />
                  Popular
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-lg font-bold">{formatCurrency(pkg.starting_price)}</span>
                <span className="text-xs text-muted-foreground ml-1">starting</span>
              </div>
              {pkg.duration && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Duration:</span> {formatDuration(pkg.duration)}
                </div>
              )}
              {pkg.features && pkg.features.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {(showAllFeatures ? pkg.features : pkg.features.slice(0, 3)).map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <span className="text-primary text-[10px]">✓</span>
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 3 && !showAllFeatures && (
                    <button
                      type="button"
                      onClick={() => setShowAllFeatures(true)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      +{pkg.features.length - 3} more
                    </button>
                  )}
                  {showAllFeatures && pkg.features.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllFeatures(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {!pkg.is_popular && (
              <Button variant="ghost" size="sm" onClick={onSetPopular} className="h-7 px-2">
                <Star className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7">
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PackageCardProps {
  pkg: VendorPackage;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<VendorPackage>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onSetPopular: () => void;
  isSaving: boolean;
}

function PackageCard({
  pkg,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSetPopular,
  isSaving,
}: PackageCardProps) {
  if (isEditing) {
    return (
      <PackageForm
        initialData={pkg}
        onSave={(updates) => onSave(updates)}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '';
    // If duration is just a number, append "hours"
    const trimmed = duration.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed} hours`;
    }
    // Otherwise, return as-is (user may have entered "4 hours", "2 days", etc.)
    return trimmed;
  };

  return (
    <Card className={pkg.is_popular ? 'border-primary' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{pkg.name}</h4>
              {pkg.is_popular && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-2xl font-bold">{formatCurrency(pkg.starting_price)}</span>
                <span className="text-sm text-muted-foreground ml-2">starting price</span>
              </div>
              {pkg.duration && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Duration:</span> {formatDuration(pkg.duration)}
                </div>
              )}
              {pkg.features && pkg.features.length > 0 && (
                <div className="space-y-1 mt-3">
                  {pkg.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{pkg.features.length - 4} more features
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!pkg.is_popular && (
              <Button variant="outline" size="sm" onClick={onSetPopular}>
                <Star className="h-4 w-4 mr-1" />
                Set Popular
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
