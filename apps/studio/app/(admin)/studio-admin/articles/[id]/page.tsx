'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BsArrowLeft, BsTrash } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import ArticleForm from '@/components/admin/forms/ArticleForm';
import type { StudioArticle } from '@/lib/studio-types';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<StudioArticle | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.json())
      .then((d) => setArticle(d.article));
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await fetch(`/api/admin/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/studio-admin/articles?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    router.push('/studio-admin/articles?deleted=1');
  };

  if (!article) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/articles')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<BsTrash className="w-4 h-4" />}>Delete</AdminButton>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Edit Article</h1>
      <ArticleForm initialData={article} onSubmit={handleSubmit} />
      <ConfirmDeleteModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Article" description="This will permanently delete this article. This action cannot be undone." loading={deleting}
      />
    </div>
  );
}
