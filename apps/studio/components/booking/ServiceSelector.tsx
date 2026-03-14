'use client';

import { useEffect, useState } from 'react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 border-3 border-brand-border bg-brand-bg animate-pulse" />
        ))}
      </div>
    );
  }

  const servicePackages = selectedService
    ? packages.filter(p => p.service_id === selectedService)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-brand-dark mb-4 font-mono uppercase tracking-wider">
          Choose a Service
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedService(s.id);
                // If no packages for this service, select service directly
                const hasPkgs = packages.some(p => p.service_id === s.id);
                if (!hasPkgs) onSelect(s.title);
              }}
              className={`text-left border-3 p-6 transition-all ${
                selectedService === s.id
                  ? 'border-brand-accent bg-brand-panel shadow-brutal-accent'
                  : 'border-brand-border bg-white hover:shadow-brutal'
              }`}
            >
              <h4 className="font-bold text-brand-dark text-lg">{s.title}</h4>
              <p className="text-brand-muted text-sm mt-1 line-clamp-2">{s.description}</p>
              <p className="text-brand-accent font-bold mt-3">{s.price}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedService && servicePackages.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-brand-dark mb-4 font-mono uppercase tracking-wider">
            Choose a Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicePackages.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => {
                  const svc = services.find(s => s.id === selectedService);
                  onSelect(svc?.title || '', pkg.id);
                }}
                className="text-left border-3 border-brand-border bg-white p-6 hover:shadow-brutal hover:border-brand-accent transition-all"
              >
                <h4 className="font-bold text-brand-dark">{pkg.name}</h4>
                {pkg.description && (
                  <p className="text-brand-muted text-sm mt-1">{pkg.description}</p>
                )}
                <p className="text-brand-accent font-bold mt-3">
                  TZS {pkg.base_price_tzs.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
