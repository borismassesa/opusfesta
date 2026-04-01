'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { BsPlus } from 'react-icons/bs';

interface Testimonial {
  id: string;
  author: string;
  role: string;
  is_published: boolean;
  sort_order: number;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/testimonials')
      .then((r) => r.json())
      .then((d) => setTestimonials(d.testimonials || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <AdminPageHeader
        title="Testimonials"
        description="Manage client testimonials and reviews. These build trust with potential clients and appear on the Testimonials section of the homepage."
        tips={[
          'Published testimonials are shown on the public site. Keep drafts for testimonials you\'re still collecting.',
          'Include the client\'s name, role/title, and optionally a photo for credibility.',
          'Sort order controls the display sequence — put your strongest testimonials first.',
          'A good mix of testimonial types (wedding, corporate, portrait) helps different visitors relate.',
        ]}
      />
      <div className="flex items-center justify-end">
        <AdminButton href="/studio-admin/testimonials/new" icon={<BsPlus className="w-4 h-4" />}>New Testimonial</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={testimonials}
          keyField="id"
          emptyMessage="No testimonials found."
          onRowClick={(t) => router.push(`/studio-admin/testimonials/${t.id}`)}
          columns={[
            { key: 'author', header: 'Author', render: (t) => <span className="font-medium text-gray-900">{t.author}</span> },
            { key: 'role', header: 'Role', render: (t) => t.role },
            { key: 'published', header: 'Published', render: (t) => <span className={t.is_published ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {t.is_published ? 'Published' : 'Draft'}
            </span> },
            { key: 'order', header: 'Order', render: (t) => <span className="font-mono text-gray-500">{t.sort_order}</span>, className: 'w-20' },
          ]}
        />
      )}
    </div>
  );
}
