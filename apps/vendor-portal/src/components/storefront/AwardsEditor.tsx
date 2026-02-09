'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { getVendorAwards, updateVendorAwards } from '@/lib/supabase/vendor';
import type { VendorAward } from '@/lib/supabase/vendor';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';

const ICON_OPTIONS = [
  { value: 'trophy', label: 'Trophy', Icon: Trophy },
  { value: 'award', label: 'Award', Icon: Award },
  { value: 'star', label: 'Star', Icon: Star },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
  { value: 'shield-check', label: 'Shield Check', Icon: ShieldCheck },
] as const;

function getAwardIcon(iconName: string) {
  const found = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return found?.Icon ?? Trophy;
}

interface LocalAward {
  _tempId: string;
  title: string;
  year: string;
  description: string;
  icon: string;
}

interface AwardsEditorProps {
  vendorId: string;
  onUpdate: () => void;
  onNextSection: () => void;
}

export function AwardsEditor({
  vendorId,
  onUpdate,
  onNextSection,
}: AwardsEditorProps) {
  const queryClient = useQueryClient();
  const [awards, setAwards] = useState<LocalAward[]>([]);
  const [initialized, setInitialized] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['vendor-awards', vendorId],
    queryFn: async () => {
      const data = await getVendorAwards(vendorId);
      if (!initialized) {
        setAwards(
          data.map((a) => ({
            _tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: a.title,
            year: a.year,
            description: a.description,
            icon: a.icon,
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
    mutationFn: async (localAwards: LocalAward[]) => {
      const cleaned: VendorAward[] = localAwards.map((a) => ({
        title: a.title,
        year: a.year,
        description: a.description,
        icon: a.icon,
      }));
      const success = await updateVendorAwards(vendorId, cleaned);
      if (!success) throw new Error('Failed to save awards');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-awards', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Awards saved!');
      onUpdate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save awards');
    },
  });

  const addAward = () => {
    setAwards((prev) => [
      ...prev,
      {
        _tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: '',
        year: new Date().getFullYear().toString(),
        description: '',
        icon: 'trophy',
      },
    ]);
  };

  const removeAward = (tempId: string) => {
    setAwards((prev) => prev.filter((a) => a._tempId !== tempId));
  };

  const updateAward = (
    tempId: string,
    field: keyof Omit<LocalAward, '_tempId'>,
    value: string
  ) => {
    setAwards((prev) =>
      prev.map((a) => (a._tempId === tempId ? { ...a, [field]: value } : a))
    );
  };

  const handleSave = () => {
    const valid = awards.filter((a) => a.title.trim());
    mutation.mutate(valid);
  };

  const handleSaveAndContinue = () => {
    const valid = awards.filter((a) => a.title.trim());
    mutation.mutate(valid, {
      onSuccess: () => onNextSection(),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (awards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="mb-4 h-14 w-14 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">No awards yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Add awards and recognition to build trust with potential clients.
          </p>
          <Button className="mt-6" onClick={addAward}>
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {awards.map((award) => {
        const AwardIcon = getAwardIcon(award.icon);
        return (
          <Card key={award._tempId}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <AwardIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={award.title}
                      onChange={(e) =>
                        updateAward(award._tempId, 'title', e.target.value)
                      }
                      placeholder="Award name"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      value={award.year}
                      onChange={(e) =>
                        updateAward(award._tempId, 'year', e.target.value)
                      }
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <Select
                      value={award.icon}
                      onValueChange={(val) =>
                        updateAward(award._tempId, 'icon', val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeAward(award._tempId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={award.description}
                onChange={(e) =>
                  updateAward(award._tempId, 'description', e.target.value)
                }
                placeholder="Describe this award or recognition..."
                rows={2}
              />
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" onClick={addAward}>
        <Plus className="mr-2 h-4 w-4" />
        Add Award
      </Button>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Awards
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
