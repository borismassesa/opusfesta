'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { BsPlus } from 'react-icons/bs';

interface Service {
  id: string;
  title: string;
  price: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-end">
        <AdminButton href="/admin/services/new" icon={<BsPlus className="w-4 h-4" />}>New Service</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={services}
          keyField="id"
          emptyMessage="No services found."
          onRowClick={(s) => router.push(`/admin/services/${s.id}`)}
          columns={[
            { key: 'sort_order', header: '#', render: (s) => <span className="font-mono text-gray-500">{s.sort_order}</span>, className: 'w-16' },
            { key: 'title', header: 'Title', render: (s) => <span className="font-medium text-gray-900">{s.title}</span> },
            { key: 'price', header: 'Price', render: (s) => s.price },
            { key: 'active', header: 'Active', render: (s) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            ) },
            { key: 'updated', header: 'Updated', render: (s) => new Date(s.updated_at).toLocaleDateString() },
          ]}
        />
      )}
    </div>
  );
}
