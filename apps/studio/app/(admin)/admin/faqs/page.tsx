'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { Plus } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  is_published: boolean;
  sort_order: number;
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/faqs')
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">FAQs</h1>
        <AdminButton href="/admin/faqs/new" icon={<Plus className="w-4 h-4" />}>New FAQ</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={faqs}
          keyField="id"
          emptyMessage="No FAQs found."
          onRowClick={(f) => router.push(`/admin/faqs/${f.id}`)}
          columns={[
            { key: 'question', header: 'Question', render: (f) => <span className="font-medium text-gray-900">{f.question.length > 80 ? f.question.slice(0, 80) + '...' : f.question}</span> },
            { key: 'published', header: 'Published', render: (f) => <span className={f.is_published ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {f.is_published ? 'Published' : 'Draft'}
            </span> },
            { key: 'order', header: 'Order', render: (f) => <span className="font-mono text-gray-500">{f.sort_order}</span>, className: 'w-20' },
          ]}
        />
      )}
    </div>
  );
}
