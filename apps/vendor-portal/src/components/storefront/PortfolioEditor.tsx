'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Images, Plus, Trash2, Pencil, X, Loader2 } from 'lucide-react';
import {
  getVendorPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '@/lib/supabase/vendor';
import type { PortfolioItem } from '@/lib/supabase/vendor';
import { ImageUpload } from './ImageUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';

interface PortfolioEditorProps {
  vendorId: string;
  onUpdate: () => void;
  onNextSection: () => void;
}

interface PortfolioForm {
  title: string;
  description: string;
  event_type: string;
  images: string[];
}

const EMPTY_FORM: PortfolioForm = {
  title: '',
  description: '',
  event_type: '',
  images: [],
};

export function PortfolioEditor({
  vendorId,
  onUpdate,
  onNextSection,
}: PortfolioEditorProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioForm>(EMPTY_FORM);

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ['vendor-portfolio', vendorId],
    queryFn: () => getVendorPortfolio(vendorId),
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PortfolioForm) => {
      const result = await createPortfolioItem({
        vendor_id: vendorId,
        title: data.title,
        images: data.images,
        description: data.description || null,
        event_type: data.event_type || null,
        event_date: null,
        featured: false,
        display_order: portfolio.length,
      });
      if (!result) throw new Error('Failed to create portfolio item');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portfolio', vendorId] });
      toast.success('Portfolio item added!');
      resetForm();
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PortfolioForm;
    }) => {
      const result = await updatePortfolioItem(id, {
        title: data.title,
        images: data.images,
        description: data.description || null,
        event_type: data.event_type || null,
      });
      if (!result) throw new Error('Failed to update portfolio item');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portfolio', vendorId] });
      toast.success('Portfolio item updated!');
      resetForm();
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePortfolioItem(id);
      if (!success) throw new Error('Failed to delete portfolio item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-portfolio', vendorId] });
      toast.success('Portfolio item deleted.');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item');
    },
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  };

  const startEditing = (item: PortfolioItem) => {
    setForm({
      title: item.title,
      description: item.description ?? '',
      event_type: item.event_type ?? '',
      images: item.images ?? [],
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (editingId) {
      editMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this portfolio item?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = (url: string | null) => {
    if (url) {
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const isPending =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (portfolio.length === 0 && !showForm) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Images className="mb-4 h-14 w-14 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No portfolio items yet</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Showcase your best work to attract potential clients. Add photos,
              descriptions, and event details.
            </p>
            <Button className="mt-6" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit form */}
      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {editingId ? 'Edit Item' : 'New Portfolio Item'}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Sarah & John's Wedding"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe this project..."
                rows={3}
              />
            </div>

            <div>
              <Label>Event Type</Label>
              <Input
                value={form.event_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, event_type: e.target.value }))
                }
                placeholder="e.g. Wedding, Corporate Event"
              />
            </div>

            <div>
              <Label>Images</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {form.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-24 overflow-hidden rounded-lg border"
                  >
                    <img
                      src={img}
                      alt={`Portfolio ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <ImageUpload
                  currentImage={null}
                  onUpload={handleImageUpload}
                  bucket="vendor-assets"
                  folder={`portfolio/${vendorId}`}
                  aspectHint="square"
                  className="h-24 w-24"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? 'Update' : 'Add Item'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.images?.[0] && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <h4 className="font-medium">{item.title}</h4>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.event_type && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.event_type}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(item)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {!showForm && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Portfolio Item
          </Button>
          <Button variant="outline" onClick={onNextSection}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
