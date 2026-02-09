'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Globe,
  Star,
  CheckCircle2,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  getVendorPortfolio,
  getVendorPackages,
  getVendorAwards,
} from '@/lib/supabase/vendor';
import type {
  Vendor,
  PortfolioItem,
  VendorPackage,
  VendorAward,
} from '@/lib/supabase/vendor';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

function getAwardIcon(iconName: string) {
  const icons: Record<string, React.ElementType> = {
    trophy: Trophy,
    award: Award,
    star: Star,
    sparkles: Sparkles,
    'shield-check': ShieldCheck,
  };
  return icons[iconName] ?? Trophy;
}

interface StorefrontPreviewProps {
  vendor: Vendor;
}

export function StorefrontPreview({ vendor }: StorefrontPreviewProps) {
  const { data: portfolio = [], isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['vendor-portfolio', vendor.id],
    queryFn: () => getVendorPortfolio(vendor.id),
    enabled: !!vendor.id,
    staleTime: 30_000,
  });

  const { data: packages = [], isLoading: isPackagesLoading } = useQuery({
    queryKey: ['vendor-packages', vendor.id],
    queryFn: () => getVendorPackages(vendor.id),
    enabled: !!vendor.id,
    staleTime: 30_000,
  });

  const { data: awards = [], isLoading: isAwardsLoading } = useQuery({
    queryKey: ['vendor-awards', vendor.id],
    queryFn: () => getVendorAwards(vendor.id),
    enabled: !!vendor.id,
    staleTime: 30_000,
  });

  const isLoading = isPortfolioLoading || isPackagesLoading || isAwardsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  const services = (vendor.services_offered ?? []) as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* External link */}
      {vendor.slug && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" asChild>
            <a
              href={`${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://opusfesta.com'}/vendors/${vendor.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View Live Page
            </a>
          </Button>
        </div>
      )}

      {/* Hero */}
      <Card className="overflow-hidden">
        {vendor.cover_image && (
          <div className="aspect-[16/5] overflow-hidden">
            <img
              src={vendor.cover_image}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {vendor.logo && (
              <img
                src={vendor.logo}
                alt={vendor.business_name}
                className="h-16 w-16 rounded-lg border object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{vendor.business_name}</h2>
                {vendor.verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{vendor.category}</span>
                {vendor.price_range && (
                  <>
                    <span>&middot;</span>
                    <span>{vendor.price_range}</span>
                  </>
                )}
                {vendor.stats?.averageRating > 0 && (
                  <>
                    <span>&middot;</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>
                        {vendor.stats.averageRating.toFixed(1)} (
                        {vendor.stats.reviewCount})
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      {(vendor.bio || vendor.description) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-3 text-lg font-semibold">About</h3>
            {vendor.bio && (
              <p className="text-sm font-medium">{vendor.bio}</p>
            )}
            {vendor.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {vendor.description}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services */}
      {services.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Services</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{service.title}</p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Portfolio</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item: PortfolioItem) => (
                <div key={item.id} className="overflow-hidden rounded-lg border">
                  {item.images?.[0] && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.event_type && (
                      <p className="text-xs text-muted-foreground">
                        {item.event_type}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Packages & Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg: VendorPackage, i: number) => (
                <div
                  key={pkg.id || i}
                  className="relative rounded-lg border p-4"
                >
                  {pkg.is_popular && (
                    <Badge className="absolute -top-2 right-3">Popular</Badge>
                  )}
                  <h4 className="font-semibold">{pkg.name}</h4>
                  <p className="mt-1 text-2xl font-bold">
                    {pkg.starting_price > 0
                      ? `$${pkg.starting_price.toLocaleString()}`
                      : 'Contact'}
                  </p>
                  {pkg.duration && (
                    <p className="text-xs text-muted-foreground">
                      {pkg.duration}
                    </p>
                  )}
                  {pkg.features.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {pkg.features.map((f, fi) => (
                        <li
                          key={fi}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Awards & Recognition
            </h3>
            <div className="space-y-3">
              {awards.map((award: VendorAward, i: number) => {
                const AwardIcon = getAwardIcon(award.icon);
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <AwardIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {award.title}{' '}
                        <span className="text-muted-foreground">
                          ({award.year})
                        </span>
                      </p>
                      {award.description && (
                        <p className="text-xs text-muted-foreground">
                          {award.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location & Contact */}
      {(vendor.location?.city ||
        vendor.contact_info?.email ||
        vendor.contact_info?.phone ||
        vendor.social_links?.instagram) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Location & Contact</h3>
            <div className="space-y-3">
              {(vendor.location?.address || vendor.location?.city) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {[vendor.location.address, vendor.location.city, vendor.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              {vendor.contact_info?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{vendor.contact_info.email}</span>
                </div>
              )}
              {vendor.contact_info?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{vendor.contact_info.phone}</span>
                </div>
              )}
              {vendor.contact_info?.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{vendor.contact_info.website}</span>
                </div>
              )}

              {/* Social links */}
              {(vendor.social_links?.instagram ||
                vendor.social_links?.facebook ||
                vendor.social_links?.twitter ||
                vendor.social_links?.tiktok) && (
                <>
                  <Separator className="my-3" />
                  <div className="flex flex-wrap gap-2">
                    {vendor.social_links.instagram && (
                      <Badge variant="outline">
                        Instagram: {vendor.social_links.instagram}
                      </Badge>
                    )}
                    {vendor.social_links.facebook && (
                      <Badge variant="outline">
                        Facebook: {vendor.social_links.facebook}
                      </Badge>
                    )}
                    {vendor.social_links.twitter && (
                      <Badge variant="outline">
                        Twitter: {vendor.social_links.twitter}
                      </Badge>
                    )}
                    {vendor.social_links.tiktok && (
                      <Badge variant="outline">
                        TikTok: {vendor.social_links.tiktok}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
