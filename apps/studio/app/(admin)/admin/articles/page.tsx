'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { BsPlus } from 'react-icons/bs';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/articles')
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-end">
        <AdminButton href="/admin/articles/new" icon={<BsPlus className="w-4 h-4" />}>New Article</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={articles}
          keyField="id"
          emptyMessage="No articles found."
          onRowClick={(a) => router.push(`/admin/articles/${a.id}`)}
          columns={[
            { key: 'title', header: 'Title', render: (a) => <span className="font-medium text-gray-900">{a.title}</span> },
            { key: 'category', header: 'Category', render: (a) => a.category },
            { key: 'author', header: 'Author', render: (a) => a.author },
            { key: 'published', header: 'Published', render: (a) => <span className={a.is_published ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {a.is_published ? 'Published' : 'Draft'}
            </span> },
            { key: 'published_at', header: 'Published Date', render: (a) => a.published_at ? new Date(a.published_at).toLocaleDateString() : '—' },
            { key: 'updated', header: 'Updated', render: (a) => new Date(a.updated_at).toLocaleDateString() },
          ]}
        />
      )}
    </div>
  );
}
