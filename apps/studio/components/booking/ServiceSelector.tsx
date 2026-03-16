'use client';

import { useEffect, useState } from 'react';
import { BsCamera, BsChevronRight, BsBox } from 'react-icons/bs';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  cover_image: string;
}

interface Package {
  id: string;
  service_id: string | null;
  name: string;
  description: string | null;
  base_price_tzs: number;
}

interface Props {
  onSelect: (service: string, packageId?: string) => void;
}

export default function ServiceSelector({ onSelect }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/booking/services').then(r => r.json()),
          fetch('/api/booking/packages').then(r => r.json()),
        ]);
        setServices(sRes.services || []);
        setPackages(pRes.packages || []);
      } catch (e) {
        console.error('Failed to load services:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 border-3 border-brand-border bg-brand-bg animate-pulse" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="border-3 border-brand-border bg-white p-12 text-center">
        <BsCamera className="w-10 h-10 text-brand-border mx-auto mb-4" />
        <p className="text-brand-muted font-mono text-sm">No services available at the moment.</p>
        <p className="text-brand-muted text-xs mt-1">Please contact us directly to discuss your project.</p>
      </div>
    );
  }

  const servicePackages = selectedService
    ? packages.filter(p => p.service_id === selectedService)
    : [];

  return (
    <div className="space-y-8">
      {/* Service list */}
      <div className="space-y-3">
        {services.map(s => {
          const isSelected = selectedService === s.id;
          const hasPkgs = packages.some(p => p.service_id === s.id);

          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedService(s.id);
                if (!hasPkgs) onSelect(s.title);
              }}
              className={`
                w-full text-left border-3 p-5 transition-all flex items-center gap-5 group
                ${isSelected
                  ? 'border-brand-accent bg-brand-panel shadow-brutal-accent'
                  : 'border-brand-border bg-white hover:shadow-brutal hover:border-brand-accent'
                }
              `}
            >
              <div className={`
                w-12 h-12 border-2 flex items-center justify-center shrink-0 transition-colors
                ${isSelected
                  ? 'border-brand-accent bg-brand-accent/10'
                  : 'border-brand-border bg-brand-bg group-hover:border-brand-accent'
                }
              `}>
                <BsCamera className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-accent'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-brand-dark text-lg">{s.title}</h4>
                <p className="text-brand-muted text-sm mt-0.5 line-clamp-1">{s.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-brand-accent font-bold font-mono">{s.price}</p>
                {hasPkgs && (
                  <p className="text-[10px] text-brand-muted font-mono mt-0.5">{packages.filter(p => p.service_id === s.id).length} packages</p>
                )}
              </div>
              <BsChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-accent'}`} />
            </button>
          );
        })}
      </div>

      {/* Package selection */}
      {selectedService && servicePackages.length > 0 && (
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark text-white px-6 py-3 flex items-center gap-2">
            <BsBox className="w-3.5 h-3.5 text-brand-accent" />
            <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Choose a Package</h3>
          </div>
          <div className="p-4 space-y-3">
            {servicePackages.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => {
                  const svc = services.find(s => s.id === selectedService);
                  onSelect(svc?.title || '', pkg.id);
                }}
                className="w-full text-left border-3 border-brand-border bg-white p-5 hover:shadow-brutal hover:border-brand-accent transition-all group flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-brand-dark">{pkg.name}</h4>
                  {pkg.description && (
                    <p className="text-brand-muted text-sm mt-0.5 line-clamp-2">{pkg.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-brand-accent font-bold font-mono whitespace-nowrap">
                    TZS {pkg.base_price_tzs.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}

            {/* Option to skip package */}
            <button
              onClick={() => {
                const svc = services.find(s => s.id === selectedService);
                onSelect(svc?.title || '');
              }}
              className="w-full text-center border-3 border-brand-border/50 bg-brand-bg p-3 hover:border-brand-border transition-colors"
            >
              <span className="text-sm font-mono text-brand-muted">
                Skip — I&apos;ll discuss options later
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
