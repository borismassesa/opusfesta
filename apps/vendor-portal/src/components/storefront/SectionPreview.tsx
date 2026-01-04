'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Vendor, type VendorPackage, type PortfolioItem, type VendorAward } from '@/lib/supabase/vendor';
import { useQuery } from '@tanstack/react-query';
import { getVendorPortfolio, getVendorPackages, getVendorAwards } from '@/lib/supabase/vendor';
import { Star, Calendar, Award, Image as ImageIcon } from 'lucide-react';

interface SectionPreviewProps {
  vendor: Vendor | null;
  activeSection: string;
}

export function SectionPreview({ vendor, activeSection }: SectionPreviewProps) {
  const { data: portfolioItems = [] } = useQuery({
    queryKey: ['portfolio', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPortfolio(vendor.id);
    },
    enabled: !!vendor && activeSection === 'section-portfolio',
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorPackages(vendor.id);
    },
    enabled: !!vendor && activeSection === 'section-packages',
  });

  const { data: awards = [] } = useQuery({
    queryKey: ['awards', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorAwards(vendor.id);
    },
    enabled: !!vendor && activeSection === 'section-awards',
  });

  if (!vendor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            Complete your storefront to see preview
          </p>
        </CardContent>
      </Card>
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
    const trimmed = duration.trim();
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed} hours`;
    }
    return trimmed;
  };

  // Render different previews based on active section
  switch (activeSection) {
    case 'section-business-info':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Business Info Preview</CardTitle>
            <CardDescription>How your business information appears</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hero Section */}
              <div className="border border-border rounded-lg overflow-hidden">
                {vendor.cover_image ? (
                  <div className="relative h-32 w-full">
                    <img
                      src={vendor.cover_image}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Cover Image</span>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{vendor.business_name || 'Business Name'}</h3>
                    {vendor.verified && <Badge variant="default">Verified</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{vendor.category}</p>
                  {vendor.bio && (
                    <p className="text-sm text-foreground line-clamp-2">{vendor.bio}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {vendor.location?.city && (
                      <span className="text-muted-foreground">{vendor.location.city}</span>
                    )}
                    {vendor.price_range && (
                      <span className="font-semibold">{vendor.price_range}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              {vendor.logo && (
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Logo</p>
                  <img
                    src={vendor.logo}
                    alt="Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}

              {/* Contact Info */}
              {(vendor.contact_info?.email || vendor.contact_info?.phone || vendor.contact_info?.website) && (
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Contact Information</p>
                  {vendor.contact_info?.email && (
                    <p className="text-sm">{vendor.contact_info.email}</p>
                  )}
                  {vendor.contact_info?.phone && (
                    <p className="text-sm">{vendor.contact_info.phone}</p>
                  )}
                  {vendor.contact_info?.website && (
                    <p className="text-sm text-primary">{vendor.contact_info.website}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'section-portfolio':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Preview</CardTitle>
            <CardDescription>Your portfolio gallery preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No portfolio items yet</p>
                  <p className="text-xs mt-1">Add items to see preview</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {portfolioItems.slice(0, 4).map((item: PortfolioItem) => (
                    <div key={item.id} className="aspect-square rounded-lg overflow-hidden border border-border">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {portfolioItems.length > 4 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{portfolioItems.length - 4} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'section-packages':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Packages Preview</CardTitle>
            <CardDescription>How your packages appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No packages yet</p>
                  <p className="text-xs mt-1">Add packages to see preview</p>
                </div>
              ) : (
                packages.slice(0, 3).map((pkg: VendorPackage) => (
                  <div
                    key={pkg.id || pkg.name}
                    className={`border rounded-lg p-3 space-y-2 ${
                      pkg.is_popular ? 'border-primary border-2' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{pkg.name}</h4>
                      {pkg.is_popular && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div>
                      <span className="text-lg font-bold">{formatCurrency(pkg.starting_price)}</span>
                      <span className="text-xs text-muted-foreground ml-1">starting</span>
                    </div>
                    {pkg.duration && (
                      <p className="text-xs text-muted-foreground">
                        Duration: {formatDuration(pkg.duration)}
                      </p>
                    )}
                    {pkg.features && pkg.features.length > 0 && (
                      <div className="space-y-1">
                        {pkg.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="text-primary text-[10px]">✓</span>
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {pkg.features.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{pkg.features.length - 2} more features
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              {packages.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{packages.length - 3} more packages
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'section-availability':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Availability Preview</CardTitle>
            <CardDescription>Your calendar availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Calendar View</p>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-muted-foreground font-medium py-1">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="aspect-square border border-border rounded flex items-center justify-center text-xs text-muted-foreground"
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Calendar preview - manage availability in the main panel
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'section-awards':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Awards Preview</CardTitle>
            <CardDescription>Your awards and recognitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {awards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No awards yet</p>
                  <p className="text-xs mt-1">Add awards to see preview</p>
                </div>
              ) : (
                awards.slice(0, 3).map((award: VendorAward, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">{award.title}</h4>
                    </div>
                    {award.year && (
                      <p className="text-xs text-muted-foreground">{award.year}</p>
                    )}
                    {award.description && (
                      <p className="text-xs text-foreground line-clamp-2">{award.description}</p>
                    )}
                  </div>
                ))
              )}
              {awards.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  +{awards.length - 3} more awards
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'section-profile-settings':
    case 'section-reviews':
    default:
      // Default preview for settings and reviews
      return (
        <Card>
          <CardHeader>
            <CardTitle>Storefront Preview</CardTitle>
            <CardDescription>Overview of your storefront</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border rounded-lg overflow-hidden">
                {vendor.cover_image ? (
                  <div className="relative h-24 w-full">
                    <img
                      src={vendor.cover_image}
                      alt={vendor.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Cover Image</span>
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <h3 className="font-bold text-sm">{vendor.business_name || 'Business Name'}</h3>
                  <p className="text-xs text-muted-foreground">{vendor.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 border border-border rounded-lg">
                  <div className="text-base font-bold">{vendor.stats?.reviewCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="p-2 border border-border rounded-lg">
                  <div className="text-base font-bold">
                    {vendor.stats?.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="p-2 border border-border rounded-lg">
                  <div className="text-base font-bold">{vendor.years_in_business || '-'}</div>
                  <div className="text-xs text-muted-foreground">Years</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
  }
}
