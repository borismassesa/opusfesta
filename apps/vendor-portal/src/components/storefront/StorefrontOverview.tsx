'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Briefcase,
  Images,
  DollarSign,
  MapPin,
  Calendar,
  Award,
  Eye,
  MessageSquare,
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  getVendorPortfolio,
  getVendorPackages,
  getVendorAwards,
} from '@/lib/supabase/vendor';
import type { Vendor } from '@/lib/supabase/vendor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EditingSection =
  | 'business-info'
  | 'services'
  | 'portfolio'
  | 'packages'
  | 'location-contact'
  | 'availability'
  | 'awards'
  | 'preview'
  | null;

interface StorefrontOverviewProps {
  vendor: Vendor;
  onEditSection: (section: EditingSection) => void;
}

// ---------------------------------------------------------------------------
// Completion calculation
// ---------------------------------------------------------------------------

function calculateWeightedCompletion(
  vendor: Vendor,
  portfolioCount: number,
  packagesCount: number,
  awardsCount: number,
): number {
  let score = 0;

  // Business Info: 25%
  const biChecks = [
    !!vendor.business_name,
    !!vendor.category,
    !!vendor.bio,
    !!vendor.logo,
  ];
  score += (biChecks.filter(Boolean).length / biChecks.length) * 25;

  // Services: 20%
  if (Array.isArray(vendor.services_offered) && vendor.services_offered.length > 0) {
    score += 20;
  }

  // Portfolio: 15%
  if (portfolioCount > 0) score += 15;

  // Packages: 15%
  if (packagesCount > 0) score += 15;

  // Location: 15%
  const loc = vendor.location as Record<string, unknown> | null;
  const contact = vendor.contact_info as Record<string, unknown> | null;
  const locChecks = [!!loc?.city, !!contact?.email || !!contact?.phone];
  score += (locChecks.filter(Boolean).length / locChecks.length) * 15;

  // Availability: 5% (always counted)
  score += 5;

  // Awards: 5%
  if (awardsCount > 0) score += 5;

  return Math.round(score);
}

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

function CompletionKpiCard({ percent }: { percent: number }) {
  const color =
    percent >= 75
      ? 'hsl(var(--chart-2))'
      : percent >= 40
        ? 'hsl(var(--chart-4))'
        : 'hsl(var(--chart-1))';

  const data = [
    { name: 'completion', value: percent, fill: color },
  ];

  return (
    <Card className="kpi-card group">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="h-20 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={data}
              barSize={8}
            >
              <RadialBar
                dataKey="value"
                background={{ fill: 'hsl(var(--muted))' }}
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-2xl font-semibold text-primary">{percent}%</div>
          <p className="text-xs text-muted-foreground">Profile complete</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatKpiCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <Card className="kpi-card group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 transition-colors text-muted-foreground group-hover:text-accent-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-primary">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section Card
// ---------------------------------------------------------------------------

interface SectionCardDef {
  key: NonNullable<EditingSection>;
  title: string;
  icon: React.ElementType;
  getStatus: (v: Vendor, p: number, pkg: number, a: number) => {
    done: boolean;
    preview: string;
  };
}

const SECTION_DEFS: SectionCardDef[] = [
  {
    key: 'business-info',
    title: 'Business Info',
    icon: Building2,
    getStatus: (v) => {
      const done = !!v.business_name && !!v.category;
      return {
        done,
        preview: done
          ? `${v.business_name} · ${v.category}`
          : 'Add your business details',
      };
    },
  },
  {
    key: 'services',
    title: 'Services',
    icon: Briefcase,
    getStatus: (v) => {
      const count = Array.isArray(v.services_offered)
        ? v.services_offered.length
        : 0;
      return {
        done: count > 0,
        preview:
          count > 0
            ? `${count} service${count === 1 ? '' : 's'} listed`
            : 'Add services you offer',
      };
    },
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    icon: Images,
    getStatus: (_v, p) => ({
      done: p > 0,
      preview:
        p > 0
          ? `${p} portfolio item${p === 1 ? '' : 's'}`
          : 'Showcase your work',
    }),
  },
  {
    key: 'packages',
    title: 'Packages & Pricing',
    icon: DollarSign,
    getStatus: (_v, _p, pkg) => ({
      done: pkg > 0,
      preview:
        pkg > 0
          ? `${pkg} package${pkg === 1 ? '' : 's'}`
          : 'Create pricing packages',
    }),
  },
  {
    key: 'location-contact',
    title: 'Location & Contact',
    icon: MapPin,
    getStatus: (v) => {
      const loc = v.location as Record<string, unknown> | null;
      const city = loc?.city as string | undefined;
      const country = loc?.country as string | undefined;
      const done = !!city;
      return {
        done,
        preview: done
          ? [city, country].filter(Boolean).join(', ')
          : 'Add your location',
      };
    },
  },
  {
    key: 'availability',
    title: 'Availability',
    icon: Calendar,
    getStatus: () => ({
      done: true,
      preview: 'Manage your calendar',
    }),
  },
  {
    key: 'awards',
    title: 'Awards & Recognition',
    icon: Award,
    getStatus: (_v, _p, _pkg, a) => ({
      done: a > 0,
      preview:
        a > 0
          ? `${a} award${a === 1 ? '' : 's'}`
          : 'Add your achievements',
    }),
  },
];

function SectionCard({
  def,
  vendor,
  portfolioCount,
  packagesCount,
  awardsCount,
  onClick,
}: {
  def: SectionCardDef;
  vendor: Vendor;
  portfolioCount: number;
  packagesCount: number;
  awardsCount: number;
  onClick: () => void;
}) {
  const { done, preview } = def.getStatus(
    vendor,
    portfolioCount,
    packagesCount,
    awardsCount,
  );
  const Icon = def.icon;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            done ? 'bg-primary/10' : 'bg-muted',
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5',
              done ? 'text-primary' : 'text-muted-foreground',
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{def.title}</span>
            <Badge variant={done ? 'secondary' : 'outline'} className="text-[10px]">
              {done ? 'Done ✓' : 'Add'}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {preview}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// StorefrontOverview
// ---------------------------------------------------------------------------

export function StorefrontOverview({
  vendor,
  onEditSection,
}: StorefrontOverviewProps) {
  // Parallel data fetching for counts
  const { data: portfolio = [] } = useQuery({
    queryKey: ['vendor-portfolio', vendor.id],
    queryFn: () => getVendorPortfolio(vendor.id),
    staleTime: 30_000,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['vendor-packages', vendor.id],
    queryFn: () => getVendorPackages(vendor.id),
    staleTime: 30_000,
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['vendor-awards', vendor.id],
    queryFn: () => getVendorAwards(vendor.id),
    staleTime: 30_000,
  });

  const portfolioCount = portfolio.length;
  const packagesCount = packages.length;
  const awardsCount = awards.length;

  const completion = calculateWeightedCompletion(
    vendor,
    portfolioCount,
    packagesCount,
    awardsCount,
  );

  const stats = vendor.stats as {
    viewCount?: number;
    inquiryCount?: number;
    averageRating?: number;
  } | null;

  const rating = (stats?.averageRating ?? 0) > 0
    ? (stats!.averageRating!).toFixed(1)
    : '--';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.01em]">
            Storefront
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your public vendor profile and track performance.
          </p>
        </div>
        {vendor.slug && (
          <Button variant="outline" onClick={() => onEditSection('preview')}>
            <Eye className="mr-2 h-4 w-4" />
            View Live Page
          </Button>
        )}
      </div>

      {/* KPI row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CompletionKpiCard percent={completion} />
        <StatKpiCard
          icon={Eye}
          value={stats?.viewCount ?? 0}
          label="Profile Views"
        />
        <StatKpiCard
          icon={MessageSquare}
          value={stats?.inquiryCount ?? 0}
          label="Inquiries"
        />
        <StatKpiCard
          icon={Star}
          value={rating}
          label="Average Rating"
        />
      </div>

      {/* Section Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Storefront Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTION_DEFS.map((def) => (
            <SectionCard
              key={def.key}
              def={def}
              vendor={vendor}
              portfolioCount={portfolioCount}
              packagesCount={packagesCount}
              awardsCount={awardsCount}
              onClick={() => onEditSection(def.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
