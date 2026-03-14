'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BsArrowLeft, BsTrash } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import FaqForm from '@/components/admin/forms/FaqForm';
import type { StudioFaq } from '@/lib/studio-types';

export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [faq, setFaq] = useState<StudioFaq | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/faqs/${id}`)
      .then((r) => r.json())
      .then((d) => setFaq(d.faq));
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await fetch(`/api/admin/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/admin/faqs?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    router.push('/admin/faqs?deleted=1');
  };

  if (!faq) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/admin/faqs')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<BsTrash className="w-4 h-4" />}>Delete</AdminButton>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Edit FAQ</h1>
      <FaqForm initialData={faq} onSubmit={handleSubmit} />
      <ConfirmDeleteModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete FAQ" description="This will permanently delete this FAQ. This action cannot be undone." loading={deleting}
      />
    </div>
  );
}
