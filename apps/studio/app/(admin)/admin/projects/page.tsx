'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  is_published: boolean;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/projects')
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        <AdminButton href="/admin/projects/new" icon={<Plus className="w-4 h-4" />}>New Project</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={projects}
          keyField="id"
          emptyMessage="No projects found."
          onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
          columns={[
            { key: 'number', header: 'Number', render: (p) => <span className="font-mono text-gray-500">{p.number}</span>, className: 'w-20' },
            { key: 'title', header: 'Title', render: (p) => <span className="font-medium text-gray-900">{p.title}</span> },
            { key: 'category', header: 'Category', render: (p) => p.category },
            { key: 'published', header: 'Published', render: (p) => <span className={p.is_published ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {p.is_published ? 'Published' : 'Draft'}
            </span> },
            { key: 'updated', header: 'Updated', render: (p) => new Date(p.updated_at).toLocaleDateString() },
          ]}
        />
      )}
    </div>
  );
}
