'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getVendorPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  type PortfolioItem,
  type Vendor,
} from '@/lib/supabase/vendor';
import { Plus, Trash2, Edit2, Save, X, GripVertical, Upload } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/supabase/vendor';
import { cn } from '@/lib/utils';

interface PortfolioManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
  onNextSection?: () => void;
}

export function PortfolioManager({ vendor, onUpdate, onNextSection }: PortfolioManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const justSavedRef = useRef(false);

  const { data: portfolioItems = [], isLoading } = useQuery({
    queryKey: ['portfolio', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPortfolio(vendor.id);
    },
    enabled: !!vendor,
  });

  const createMutation = useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio', vendor?.id] });
      queryClient.refetchQueries({ queryKey: ['portfolio', vendor?.id] });
      onUpdate();
      setIsAdding(false);
      justSavedRef.current = true;
      toast.success('Portfolio item added');
    },
    onError: () => {
      toast.error('Failed to add portfolio item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PortfolioItem> }) =>
      updatePortfolioItem(id, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio', vendor?.id] });
      queryClient.refetchQueries({ queryKey: ['portfolio', vendor?.id] });
      onUpdate();
      setEditingId(null);
      justSavedRef.current = true;
      toast.success('Portfolio item updated');
    },
    onError: () => {
      toast.error('Failed to update portfolio item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio', vendor?.id] });
      queryClient.refetchQueries({ queryKey: ['portfolio', vendor?.id] });
      onUpdate();
      toast.success('Portfolio item deleted');
    },
    onError: () => {
      toast.error('Failed to delete portfolio item');
    },
  });

  const handleAdd = (item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!vendor) return;
    createMutation.mutate({
      ...item,
      vendor_id: vendor.id,
      display_order: portfolioItems.length,
    });
  };

  const handleUpdate = (id: string, item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert the full item to updates format
    const updates: Partial<PortfolioItem> = {
      title: item.title,
      description: item.description,
      event_type: item.event_type,
      event_date: item.event_date,
      images: item.images,
      featured: item.featured,
      display_order: item.display_order,
    };
    updateMutation.mutate({ id, updates });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      deleteMutation.mutate(id);
    }
  };

  // Calculate total images, filtering out empty strings
  const totalImages = portfolioItems.reduce((sum, item) => {
    const validImages = (item.images || []).filter(url => url && url.trim() !== '');
    return sum + validImages.length;
  }, 0);
  const minPhotos = 20;
  const photoProgress = Math.min((totalImages / minPhotos) * 100, 100);

  // Navigate to next section when progress reaches 100% after a save
  useEffect(() => {
    if (justSavedRef.current && photoProgress >= 100 && onNextSection) {
      justSavedRef.current = false;
      // Small delay to ensure UI updates are visible
      setTimeout(() => {
        onNextSection();
      }, 500);
    }
  }, [photoProgress, onNextSection]);

  return (
    <Card id="section-portfolio" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Portfolio Gallery</CardTitle>
        <CardDescription>
          Manage your portfolio images below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Complete your vendor profile in the "About" section first to save portfolio items.
            </p>
          </div>
        )}
        {vendor && (
          <>
            {/* Progress Indicator */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {totalImages} / {minPhotos} photos
                </span>
                <span className={totalImages >= minPhotos ? 'text-green-600' : 'text-amber-600'}>
                  {Math.round(photoProgress)}% complete
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    totalImages >= minPhotos ? 'bg-green-600' : 'bg-amber-600'
                  }`}
                  style={{ width: `${photoProgress}%` }}
                />
              </div>
            </div>
          </>
        )}
        {isLoading && vendor ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add Button */}
            {!isAdding && (
              <div className="flex justify-end">
                <Button 
                  onClick={() => setIsAdding(true)} 
                  size="default"
                  disabled={!vendor}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            )}
            {/* Add New Item Form */}
            {isAdding && (
              <PortfolioItemForm
                onSave={(item) => {
                  handleAdd(item);
                }}
                onCancel={() => setIsAdding(false)}
                isSaving={createMutation.isPending}
              />
            )}

            {/* Portfolio Items List */}
            {portfolioItems.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                onEdit={() => setEditingId(item.id)}
                onSave={(itemData) => {
                  handleUpdate(item.id, itemData);
                }}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(item.id)}
                isSaving={updateMutation.isPending}
              />
            ))}

            {portfolioItems.length === 0 && !isAdding && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No portfolio items yet. Add your first item to get started!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PortfolioItemFormProps {
  onSave: (item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSaving: boolean;
  initialData?: PortfolioItem;
}

function PortfolioItemForm({
  onSave,
  onCancel,
  isSaving,
  initialData,
}: PortfolioItemFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventType, setEventType] = useState(initialData?.event_type || '');
  const [eventDate, setEventDate] = useState(initialData?.event_date || '');
  const [images, setImages] = useState<string[]>(
    (initialData?.images || []).filter(url => url && url.trim() !== '')
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    const filesArray = Array.from(files);
    const remainingSlots = 10 - images.length;
    const filesToUpload = filesArray.slice(0, remainingSlots);

    if (filesArray.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s). Maximum 10 images per item.`);
    }

    // Create preview URLs immediately for instant feedback
    const previewUrls = new Map<string, string>();
    filesToUpload.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.set(file.name, previewUrl);
    });

    // Add preview images immediately - users see them right away
    const previewArray = Array.from(previewUrls.values());
    setImages(prev => [...prev.filter(url => url && url.trim() !== ''), ...previewArray]);

    // Track uploading files
    const uploadingSet = new Set(filesToUpload.map(f => f.name));
    setUploadingImages(uploadingSet);

    try {
      // Upload all images in parallel for maximum speed
      const uploadPromises = filesToUpload.map(async (file) => {
        try {
          // Validate file size
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`${file.name} is larger than 5MB`);
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} is not an image file`);
          }

          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `portfolio/${timestamp}-${random}.${fileExt}`;

          const { url, error: uploadError } = await uploadImage('vendor-assets', fileName, file);
          
          if (uploadError) {
            throw new Error(uploadError);
          }

          if (!url) {
            throw new Error('Upload failed: No URL returned');
          }

          // Replace preview with actual URL as soon as it's ready
          const previewUrl = previewUrls.get(file.name);
          setImages(prev => {
            const filtered = prev.filter(u => u !== previewUrl && u && u.trim() !== '');
            return [...filtered, url];
          });

          // Remove from uploading set
          setUploadingImages(prev => {
            const next = new Set(prev);
            next.delete(file.name);
            return next;
          });

          // Clean up preview URL
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          return url;
        } catch (error) {
          // Remove failed preview
          const previewUrl = previewUrls.get(file.name);
          setImages(prev => prev.filter(u => u !== previewUrl && u && u.trim() !== ''));
          setUploadingImages(prev => {
            const next = new Set(prev);
            next.delete(file.name);
            return next;
          });
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          throw error;
        }
      });

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter((r): r is PromiseFulfilledResult<string> => 
        r.status === 'fulfilled' && r.value && r.value.trim() !== ''
      );
      const failed = results.filter(r => r.status === 'rejected');

      if (successful.length > 0) {
        toast.success(`Uploaded ${successful.length} image(s)`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length} image(s) failed to upload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingImages(new Set());
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      vendor_id: initialData?.vendor_id || '', // Will be set by parent
      title,
      description: description || null,
      event_type: eventType || null,
      event_date: eventDate || null,
      images: images.filter(url => url && url.trim() !== ''),
      featured,
      display_order: initialData?.display_order || 0, // Will be set by parent
    });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Elegant Garden Wedding"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this portfolio item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Input
                id="event_type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g., Wedding, Reception"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.filter(url => url && url.trim() !== '').map((url, index) => {
                const isUploading = url.startsWith('blob:');
                return (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
              {images.length < 10 && (
                <div
                  className={cn(
                    'aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors',
                    uploadingImages.size > 0 && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => uploadingImages.size === 0 && fileInputRef.current?.click()}
                >
                  {uploadingImages.size > 0 ? (
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Uploading {uploadingImages.size}...</p>
                    </div>
                  ) : (
                    <div className="text-center p-2">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Add images</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {10 - images.length} left
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImageUpload(e.target.files);
                }
              }}
              className="hidden"
              disabled={uploadingImages > 0}
            />
            <p className="text-xs text-muted-foreground">
              Up to 10 images per item. Max 5MB per image.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Mark as featured
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !title}>
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

interface PortfolioItemCardProps {
  item: PortfolioItem;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

function PortfolioItemCard({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isSaving,
}: PortfolioItemCardProps) {
  if (isEditing) {
    return (
      <PortfolioItemForm
        initialData={item}
        onSave={(updates) => onSave(updates)}
        onCancel={onCancel}
        isSaving={isSaving}
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{item.title}</h4>
              {item.featured && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  Featured
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            )}
            <div className="flex gap-4 text-xs text-muted-foreground">
              {item.event_type && <span>Type: {item.event_type}</span>}
              {item.event_date && <span>Date: {new Date(item.event_date).toLocaleDateString()}</span>}
              <span>{item.images?.length || 0} images</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {item.images && item.images.filter(url => url && url.trim() !== '').length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {item.images.filter(url => url && url.trim() !== '').map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
