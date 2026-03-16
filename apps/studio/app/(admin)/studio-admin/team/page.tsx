'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { BsPlus } from 'react-icons/bs';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  is_published: boolean;
  sort_order: number;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/team')
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <AdminToast />
      <AdminPageHeader
        title="Team"
        description="Manage your studio team members. Team profiles help clients know who they'll be working with and add a personal touch to your brand."
        tips={[
          'Published team members are visible on the public site. Draft profiles are hidden.',
          'Add a professional photo, name, role/title, and a short bio for each member.',
          'Sort order controls the display sequence — typically the studio owner/lead appears first.',
          'Update profiles when team members change roles or new members join.',
        ]}
      />
      <div className="flex items-center justify-end">
        <AdminButton href="/studio-admin/team/new" icon={<BsPlus className="w-4 h-4" />}>New Member</AdminButton>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      ) : (
        <AdminTable
          data={members}
          keyField="id"
          emptyMessage="No team members found."
          onRowClick={(m) => router.push(`/admin/team/${m.id}`)}
          columns={[
            { key: 'name', header: 'Name', render: (m) => <span className="font-medium text-gray-900">{m.name}</span> },
            { key: 'role', header: 'Role', render: (m) => m.role },
            { key: 'published', header: 'Published', render: (m) => <span className={m.is_published ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {m.is_published ? 'Published' : 'Draft'}
            </span> },
            { key: 'order', header: 'Order', render: (m) => <span className="font-mono text-gray-500">{m.sort_order}</span>, className: 'w-20' },
          ]}
        />
      )}
    </div>
  );
}
