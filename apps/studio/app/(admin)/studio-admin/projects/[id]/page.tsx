'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BsArrowLeft, BsTrash } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import ProjectForm from '@/components/admin/forms/ProjectForm';
import type { StudioProject } from '@/lib/studio-types';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/studio-admin/projects/${id}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project));
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await fetch(`/api/studio-admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/studio-admin/projects?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/studio-admin/projects/${id}`, { method: 'DELETE' });
    router.push('/studio-admin/projects?deleted=1');
  };

  if (!project) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/projects')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<BsTrash className="w-4 h-4" />}>Delete</AdminButton>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Edit Project</h1>
      <ProjectForm initialData={project} onSubmit={handleSubmit} />
      <ConfirmDeleteModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Project" description="This will permanently delete this project. This action cannot be undone." loading={deleting}
      />
    </div>
  );
}
