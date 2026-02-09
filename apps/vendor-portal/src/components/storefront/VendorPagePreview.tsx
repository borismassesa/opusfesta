'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Star,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  Users,
  Heart,
  Share,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ImageIcon,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

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

function getStartingPrice(vendor: Vendor): string {
  if (vendor.price_range === '$') return '$200';
  if (vendor.price_range === '$$') return '$500';
  if (vendor.price_range === '$$$') return '$1,000';
  if (vendor.price_range === '$$$$') return '$2,500';
  return '$500';
}

// ---------------------------------------------------------------------------
// VendorPagePreview
// ---------------------------------------------------------------------------

interface VendorPagePreviewProps {
  vendor: Vendor;
}

export function VendorPagePreview({ vendor }: VendorPagePreviewProps) {
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

  const rating = vendor.stats?.averageRating || 0;
  const reviewCount = vendor.stats?.reviewCount || 0;
  const location = vendor.location as Record<string, string> | null;
  const contact = vendor.contact_info as Record<string, string> | null;
  const social = vendor.social_links as Record<string, string> | null;
  const locationText = location?.city
    ? `${location.city}, ${location.country || 'Tanzania'}`
    : 'Tanzania';

  const services = (vendor.services_offered ?? []) as Array<
    string | { title: string; description?: string }
  >;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="aspect-[16/5] w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Collect portfolio images for gallery
  const galleryImages: string[] = [];
  if (vendor.cover_image) galleryImages.push(vendor.cover_image);
  for (const item of portfolio) {
    for (const img of item.images ?? []) {
      if (galleryImages.length < 5) galleryImages.push(img);
    }
  }

  return (
    <div className="min-h-[600px] bg-white text-gray-900">
      {/* ----------------------------------------------------------------- */}
      {/* Image Gallery */}
      {/* ----------------------------------------------------------------- */}
      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_0.4fr] gap-2">
          {/* Main image */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[350px] overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={galleryImages[0]}
              alt={vendor.business_name}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="hidden lg:grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((idx) =>
              galleryImages[idx] ? (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl bg-gray-100"
                  style={{ height: '170px' }}
                >
                  <img
                    src={galleryImages[idx]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {idx === 4 && portfolio.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold">
                        Show all {portfolio.length + (vendor.cover_image ? 1 : 0)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  key={idx}
                  className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50"
                  style={{ height: '170px' }}
                >
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/5] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
          <div className="text-center">
            <ImageIcon className="mx-auto mb-2 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">No images uploaded yet</p>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Content + Sidebar grid */}
      {/* ----------------------------------------------------------------- */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ---- Main Content (2/3) ---- */}
        <div className="lg:col-span-2 space-y-10">
          {/* Vendor header */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div className="flex items-start gap-4">
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.business_name}
                  className="h-14 w-14 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-xl font-bold text-gray-600">
                  {vendor.business_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{vendor.business_name}</h1>
                  {vendor.verified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{vendor.category}</p>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationText}
                  </span>
                  {rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)} ({reviewCount} review
                      {reviewCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                <Share className="h-4 w-4" />
                Share
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                <Heart className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>

          {/* About */}
          {(vendor.bio || vendor.description) && (
            <section>
              <h2 className="mb-3 text-2xl font-bold">About</h2>
              {vendor.bio && (
                <p className="text-sm font-medium leading-relaxed">
                  {vendor.bio}
                </p>
              )}
              {vendor.description && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {vendor.description}
                </p>
              )}
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">
                What this vendor offers
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service, i) => {
                  const title =
                    typeof service === 'string' ? service : service.title;
                  const desc =
                    typeof service === 'string' ? undefined : service.description;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{title}</p>
                        {desc && (
                          <p className="text-xs text-gray-500">{desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">Portfolio</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.slice(0, 6).map((item: PortfolioItem) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
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
                        <p className="text-xs text-gray-500">
                          {item.event_type}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Packages & Pricing */}
          {packages.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">Prices & packages</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {packages.map((pkg: VendorPackage, i: number) => (
                  <div
                    key={pkg.id || i}
                    className="relative rounded-xl border border-gray-200 p-6"
                  >
                    {pkg.is_popular && (
                      <Badge className="absolute -top-2.5 right-3 bg-gray-900 text-white">
                        Most popular
                      </Badge>
                    )}
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className="mt-1 text-3xl font-bold">
                      {pkg.starting_price > 0
                        ? `$${pkg.starting_price.toLocaleString()}`
                        : 'Contact'}
                    </p>
                    <p className="text-xs text-gray-500">starting price</p>
                    {pkg.duration && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {pkg.duration}
                      </p>
                    )}
                    {pkg.features.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {pkg.features.slice(0, 5).map((f, fi) => (
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
            </section>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">
                Awards & recognition
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {awards.map((award: VendorAward, i: number) => {
                  const AwardIcon = getAwardIcon(award.icon);
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-gray-200 p-5"
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                        <AwardIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-xs text-gray-500">{award.year}</p>
                      <p className="font-semibold">{award.title}</p>
                      {award.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {award.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Location & Contact */}
          {(location?.city || contact?.email || contact?.phone) && (
            <section>
              <h2 className="mb-4 text-2xl font-bold">Location & Contact</h2>
              <div className="space-y-3">
                {(location?.address || location?.city) && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>
                      {[location?.address, location?.city, location?.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {contact?.email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact?.phone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact?.website && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>{contact.website}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Team */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-2xl font-bold">Team</h2>
            {vendor.team_size && vendor.team_size > 1 && (
              <p className="mb-4 text-sm text-gray-500">
                {vendor.team_size} members
              </p>
            )}
            <div className="inline-block rounded-2xl border border-gray-200 p-6 text-center">
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.business_name}
                  className="mx-auto h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-3xl font-bold text-gray-500">
                  {vendor.business_name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="mt-3 text-lg font-bold">{vendor.business_name}</h3>
              <p className="text-sm uppercase text-gray-500">
                {vendor.category}
              </p>
              <button className="mt-4 w-full rounded-lg border-2 border-gray-900 px-6 py-2.5 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                <span className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </span>
              </button>
            </div>
          </section>

          {/* Trust badge */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
              <p className="text-sm text-gray-600">
                To help protect your payment, always use OpusFesta to send money
                and communicate with vendors.
              </p>
            </div>
          </div>
        </div>

        {/* ---- Booking Sidebar (1/3) ---- */}
        <div className="hidden lg:block">
          <div className="sticky top-8 space-y-4">
            <div className="rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold">Start the conversation</h3>
              <div className="mt-3 border-b border-gray-200 pb-4">
                <p className="text-xs text-gray-500">Starting price</p>
                <p className="text-2xl font-bold">
                  {getStartingPrice(vendor)}
                </p>
                <p className="text-xs text-gray-500">per event</p>
              </div>

              {/* Date / Guest inputs mock */}
              <div className="mt-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase text-gray-500">
                      Check-in
                    </p>
                    <p className="text-sm text-gray-400">Add date</p>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase text-gray-500">
                      Checkout
                    </p>
                    <p className="text-sm text-gray-400">Add date</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-3">
                  <p className="text-[10px] font-semibold uppercase text-gray-500">
                    Guests
                  </p>
                  <p className="text-sm text-gray-400">Add guests</p>
                </div>
              </div>

              <button className="mt-4 w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white">
                Request Quote
              </button>
            </div>

            {/* Rating summary */}
            {rating > 0 && (
              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
