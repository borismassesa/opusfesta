'use client';

import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import ArticleForm from '@/components/admin/forms/ArticleForm';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create article');
    }
    router.push('/admin/articles?saved=1');
  };

  return (
    <div className="space-y-6">
      <AdminButton variant="ghost" onClick={() => router.push('/admin/articles')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
      <h1 className="text-xl font-bold text-gray-900">New Article</h1>
      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
}
