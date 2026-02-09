'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Palette,
  Briefcase,
  MapPin,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { createVendor, updateVendor } from '@/lib/supabase/vendor';
import type { Vendor } from '@/lib/supabase/vendor';
import { ImageUpload } from './ImageUpload';
import { ServicesEditor } from './ServicesEditor';
import { LocationContactEditor } from './LocationContactEditor';
import { StorefrontPreview } from './StorefrontPreview';
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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const STEPS = [
  { title: "Let's set up your storefront", subtitle: 'Start with the essentials', icon: Sparkles },
  { title: 'Make it yours', subtitle: 'Add your brand identity', icon: Palette },
  { title: 'What do you offer?', subtitle: 'Tell clients about your services', icon: Briefcase },
  { title: 'Help clients find you', subtitle: 'Add your location and contact info', icon: MapPin },
  { title: "You're almost there!", subtitle: 'Review your storefront', icon: Rocket },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingWizardProps {
  dbUserId: string;
  vendor: Vendor | null;
  onComplete: () => void;
}

// Step 0 schema
const step0Schema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
});
type Step0Values = z.infer<typeof step0Schema>;

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function WizardStepper({ currentStep }: { currentStep: number }) {
  const labels = ['Essentials', 'Brand', 'Services', 'Location', 'Launch'];

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isCompleted &&
                    'border-primary bg-primary text-primary-foreground',
                  isActive &&
                    'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isActive &&
                    'border-border text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors duration-300',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8 sm:w-12 transition-colors duration-500',
                  i < currentStep ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OnboardingWizard
// ---------------------------------------------------------------------------

export function OnboardingWizard({
  dbUserId,
  vendor: initialVendor,
  onComplete,
}: OnboardingWizardProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(initialVendor ? 1 : 0);
  const [vendor, setVendor] = useState<Vendor | null>(initialVendor);

  const refetchVendor = async () => {
    if (!vendor?.id) return;
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendor.id)
      .single();
    if (data) setVendor(data as Vendor);
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8 md:px-10">
      <WizardStepper currentStep={currentStep} />

      <div className="mt-10">
        {/* Step header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {STEPS[currentStep].title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {STEPS[currentStep].subtitle}
          </p>
        </div>

        {/* Step content with animated transitions */}
        <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
          {currentStep === 0 && (
            <Step0
              dbUserId={dbUserId}
              vendor={vendor}
              onCreated={(v) => {
                setVendor(v);
                goNext();
              }}
            />
          )}
          {currentStep === 1 && vendor && (
            <Step1
              vendor={vendor}
              onUpdate={refetchVendor}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 2 && vendor && (
            <Step2
              vendor={vendor}
              onUpdate={refetchVendor}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && vendor && (
            <Step3
              vendor={vendor}
              onUpdate={refetchVendor}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && vendor && (
            <Step4
              vendor={vendor}
              onBack={goBack}
              onComplete={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 0: Business Name + Category
// ---------------------------------------------------------------------------

function Step0({
  dbUserId,
  vendor,
  onCreated,
}: {
  dbUserId: string;
  vendor: Vendor | null;
  onCreated: (v: Vendor) => void;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step0Values>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      business_name: vendor?.business_name ?? '',
      category: vendor?.category ?? '',
    },
  });

  const selectedCategory = watch('category');

  const mutation = useMutation({
    mutationFn: async (values: Step0Values) => {
      if (vendor) {
        const result = await updateVendor(vendor.id, {
          business_name: values.business_name,
          category: values.category,
        });
        if (!result) throw new Error('Failed to update vendor');
        return result;
      } else {
        const result = await createVendor(dbUserId, {
          business_name: values.business_name,
          category: values.category,
        });
        if (!result) throw new Error('Failed to create vendor profile');
        return result;
      }
    },
    onSuccess: (result) => {
      // Invalidate access so the portal knows a vendor exists, but the wizard
      // won't unmount because the parent checks needsOnboarding BEFORE vendor loading.
      queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Great start! Now let\u2019s make your profile stand out.');
      onCreated(result);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              {...register('business_name')}
              placeholder="e.g. Golden Hour Photography"
              className="mt-1"
            />
            {errors.business_name && (
              <p className="mt-1 text-xs text-destructive">
                {errors.business_name.message}
              </p>
            )}
          </div>

          <div>
            <Label>Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setValue('category', val)}
            >
              <SelectTrigger className="mt-1">
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
            {errors.category && (
              <p className="mt-1 text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tip card */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-primary">Quick tip</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose a clear business name and the category that best matches your
            main offering. You can always update these later.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Brand Identity (structured into clear sections)
// ---------------------------------------------------------------------------

function Step1({
  vendor,
  onUpdate,
  onNext,
  onBack,
}: {
  vendor: Vendor;
  onUpdate: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [logo, setLogo] = useState<string | null>(vendor.logo ?? null);
  const [coverImage, setCoverImage] = useState<string | null>(vendor.cover_image ?? null);
  const [bio, setBio] = useState(vendor.bio ?? '');
  const [description, setDescription] = useState(vendor.description ?? '');
  const [priceRange, setPriceRange] = useState(vendor.price_range ?? '');

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await updateVendor(vendor.id, {
        logo,
        cover_image: coverImage,
        bio: bio || null,
        description: description || null,
        price_range: priceRange || null,
      });
      if (!result) throw new Error('Failed to save');
      return result;
    },
    onSuccess: () => {
      toast.success('Looking good! Your brand details are saved.');
      onUpdate();
      onNext();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    },
  });

  return (
    <div className="space-y-6">
      {/* Visual Identity */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Visual Identity
          </h3>
          <div className="space-y-6">
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

            <div>
              <Label>Cover Image</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Recommended: 1200x400px, landscape &mdash; this is the banner at
                the top of your storefront
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
          </div>
        </CardContent>
      </Card>

      {/* About Your Business */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About Your Business
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Tagline</Label>
              <p className="mb-1 text-xs text-muted-foreground">
                A one-liner that shows up below your name
              </p>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                placeholder="e.g. Capturing your most important moments with an artistic eye"
                rows={2}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {bio.length}/200
              </p>
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <p className="mb-1 text-xs text-muted-foreground">
                Tell potential clients about your experience and what makes you unique
              </p>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="We are a team of passionate photographers with over 10 years of experience..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Price Range</Label>
              <p className="mb-1 text-xs text-muted-foreground">
                Give clients a general sense of your pricing
              </p>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="mt-1 w-40">
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
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNext}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Skip for now
          </button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Services (embed editor with consistent wizard nav)
// ---------------------------------------------------------------------------

function Step2({
  vendor,
  onUpdate,
  onNext,
  onBack,
}: {
  vendor: Vendor;
  onUpdate: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <ServicesEditor
        vendor={vendor}
        onUpdate={onUpdate}
        onNextSection={onNext}
      />

      {/* Unified wizard navigation below the editor */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Location & Contact (embed editor with consistent wizard nav)
// ---------------------------------------------------------------------------

function Step3({
  vendor,
  onUpdate,
  onNext,
  onBack,
}: {
  vendor: Vendor;
  onUpdate: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <LocationContactEditor
        vendor={vendor}
        onUpdate={onUpdate}
        onNextSection={onNext}
      />

      {/* Unified wizard navigation below the editor */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Review & Launch
// ---------------------------------------------------------------------------

function Step4({
  vendor,
  onBack,
  onComplete,
}: {
  vendor: Vendor;
  onBack: () => void;
  onComplete: () => void;
}) {
  const queryClient = useQueryClient();

  const completionChecks = [
    { label: 'Business name', done: !!vendor.business_name },
    { label: 'Category', done: !!vendor.category },
    { label: 'Logo', done: !!vendor.logo },
    { label: 'Bio', done: !!vendor.bio },
    {
      label: 'Services',
      done:
        Array.isArray(vendor.services_offered) &&
        vendor.services_offered.length > 0,
    },
    {
      label: 'Location',
      done: !!(vendor.location as Record<string, unknown>)?.city,
    },
    {
      label: 'Contact info',
      done:
        !!(vendor.contact_info as Record<string, unknown>)?.email ||
        !!(vendor.contact_info as Record<string, unknown>)?.phone,
    },
  ];

  const doneCount = completionChecks.filter((c) => c.done).length;

  const launchMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('vendors')
        .update({
          onboarding_status: 'active',
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vendor-portal-access'] });
      await queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast.success('Your storefront is live! Welcome aboard.');
      onComplete();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to launch storefront',
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Completion summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Completion Summary
            </h3>
            <Badge variant="secondary">
              {doneCount}/{completionChecks.length} complete
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {completionChecks.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span
                  className={cn(
                    item.done ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto rounded-lg">
            <StorefrontPreview vendor={vendor} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={() => launchMutation.mutate()}
          disabled={launchMutation.isPending}
        >
          {launchMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}
          Launch Your Storefront
        </Button>
      </div>
    </div>
  );
}
