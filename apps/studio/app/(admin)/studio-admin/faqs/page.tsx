'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { BsPlus } from 'react-icons/bs';

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
      <AdminPageHeader
        title="FAQs"
        description="Manage frequently asked questions. These appear on the FAQ section of your website, helping clients find answers without reaching out."
        tips={[
          'Published FAQs are visible on the public site. Use drafts to prepare answers before publishing.',
          'Sort order controls display sequence — put the most commonly asked questions first.',
          'Keep answers concise but helpful. Link to relevant pages if more detail is needed.',
          'Common topics: pricing, booking process, turnaround time, cancellation policy, what to expect.',
        ]}
      />
      <div className="flex items-center justify-end">
        <AdminButton href="/studio-admin/faqs/new" icon={<BsPlus className="w-4 h-4" />}>New FAQ</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={faqs}
          keyField="id"
          emptyMessage="No FAQs found."
          onRowClick={(f) => router.push(`/studio-admin/faqs/${f.id}`)}
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
