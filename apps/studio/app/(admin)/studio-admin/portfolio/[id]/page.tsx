'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BsArrowLeft, BsTrash } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import PortfolioForm from '@/components/admin/forms/PortfolioForm';
import type { StudioProject } from '@/lib/studio-types';

export default function EditPortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/portfolio/${id}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project));
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await fetch(`/api/admin/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/studio-admin/portfolio?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
    router.push('/studio-admin/portfolio?deleted=1');
  };

  if (!project) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/portfolio')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<BsTrash className="w-4 h-4" />}>Delete</AdminButton>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Edit Portfolio Item</h1>
      <PortfolioForm initialData={project} onSubmit={handleSubmit} />
      <ConfirmDeleteModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Portfolio Item" description="This will permanently delete this item. This action cannot be undone." loading={deleting}
      />
    </div>
  );
}
