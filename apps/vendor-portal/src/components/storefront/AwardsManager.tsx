'use client';

import { useState } from 'react';
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
  getVendorAwards,
  updateVendorAwards,
  type VendorAward,
  type Vendor,
} from '@/lib/supabase/vendor';
import { Plus, Trash2, Edit2, Save, X, Star, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface AwardsManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

const awardIcons = {
  Star,
  Sparkles,
  ShieldCheck,
  Award,
};

export function AwardsManager({ vendor, onUpdate }: AwardsManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const { data: awards = [], isLoading } = useQuery({
    queryKey: ['awards', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorAwards(vendor.id);
    },
    enabled: !!vendor,
  });

  const updateMutation = useMutation({
    mutationFn: async (newAwards: VendorAward[]) => {
      if (!vendor) throw new Error('Vendor not found');
      return await updateVendorAwards(vendor.id, newAwards);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      onUpdate();
      setIsAdding(false);
      setEditingIndex(null);
      toast.success('Awards updated successfully');
    },
    onError: () => {
      toast.error('Failed to update awards');
    },
  });

  const handleAdd = (award: VendorAward) => {
    const newAwards = [...awards, { ...award, display_order: awards.length }];
    updateMutation.mutate(newAwards);
  };

  const handleUpdate = (index: number, updates: Partial<VendorAward>) => {
    const newAwards = awards.map((award, i) =>
      i === index ? { ...award, ...updates } : award
    );
    updateMutation.mutate(newAwards);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this award?')) {
      const newAwards = awards.filter((_, i) => i !== index);
      updateMutation.mutate(newAwards);
    }
  };

  return (
    <Card id="section-awards" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Awards & Recognition</CardTitle>
        <CardDescription>
          Manage your awards and recognition below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Complete your vendor profile in the "About" section first to save awards.
            </p>
          </div>
        )}
        {isLoading && vendor ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {awards.length > 0 ? `Your Awards (${awards.length})` : 'Your Awards'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {awards.length > 0 
                    ? 'Manage your awards below' 
                    : 'Add your first award to get started'}
                </p>
              </div>
              {!isAdding && (
                <Button onClick={() => setIsAdding(true)} size="default" disabled={!vendor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Award
                </Button>
              )}
            </div>

            {isAdding && (
              <AwardForm
                onSave={handleAdd}
                onCancel={() => setIsAdding(false)}
                isSaving={updateMutation.isPending}
              />
            )}

            {awards.map((award, index) => (
              <AwardCard
                key={index}
                award={award}
                index={index}
                isEditing={editingIndex === index}
                onEdit={() => setEditingIndex(index)}
                onSave={(updates) => handleUpdate(index, updates)}
                onCancel={() => setEditingIndex(null)}
                onDelete={() => handleDelete(index)}
                isSaving={updateMutation.isPending}
              />
            ))}

            {awards.length === 0 && !isAdding && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">No awards yet</p>
                <p className="text-xs text-muted-foreground">Click "Add Award" above to showcase your achievements</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AwardFormProps {
  onSave: (award: VendorAward) => void;
  onCancel: () => void;
  isSaving: boolean;
  initialData?: VendorAward;
}

function AwardForm({ onSave, onCancel, isSaving, initialData }: AwardFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState<keyof typeof awardIcons>(initialData?.icon as keyof typeof awardIcons || 'Star');
  const [image, setImage] = useState<string | null>(initialData?.image || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, year, description, icon, image: image || null });
  };

  const IconComponent = awardIcons[icon];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? 'Edit Award' : 'Add Award'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="award_title">Award Title *</Label>
              <Input
                id="award_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., OpusFesta Couples' Choice"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="award_year">Year *</Label>
              <Input
                id="award_year"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_description">Description *</Label>
            <Textarea
              id="award_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the award and what it means..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_icon">Icon</Label>
            <Select value={icon} onValueChange={(value) => setIcon(value as keyof typeof awardIcons)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(awardIcons).map((iconName) => {
                  const Icon = awardIcons[iconName as keyof typeof awardIcons];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="award_image">Award Certificate/Image (Optional)</Label>
            <ImageUpload
              currentImage={image}
              onUpload={(url) => setImage(url || null)}
              bucket="vendor-assets"
              folder="awards"
              maxSizeMB={5}
            />
            <p className="text-xs text-muted-foreground">
              Upload a photo of your award certificate or recognition
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !title || !description}>
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

interface AwardCardProps {
  award: VendorAward;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<VendorAward>) => void;
  onCancel: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

function AwardCard({
  award,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isSaving,
}: AwardCardProps) {
  if (isEditing) {
    return (
      <AwardForm
        initialData={award}
        onSave={(updates) => onSave(updates)}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    );
  }

  const IconComponent = awardIcons[award.icon as keyof typeof awardIcons] || Star;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {award.image ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                <img
                  src={award.image}
                  alt={award.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5 text-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-xs font-semibold text-secondary mb-1">{award.year}</div>
              <div className="text-base font-semibold text-foreground mb-2">{award.title}</div>
              <p className="text-sm text-secondary leading-relaxed">{award.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
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
