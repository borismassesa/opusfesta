'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import TeamMemberForm from '@/components/admin/forms/TeamMemberForm';
import type { StudioTeamMember } from '@/lib/studio-types';

export default function EditTeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<StudioTeamMember | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/team/${id}`)
      .then((r) => r.json())
      .then((d) => setMember(d.member));
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await fetch(`/api/admin/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    router.push('/admin/team?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
    router.push('/admin/team?deleted=1');
  };

  if (!member) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/admin/team')} icon={<ArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<Trash2 className="w-4 h-4" />}>Delete</AdminButton>
      </div>
      <h1 className="text-xl font-bold text-gray-900">Edit Team Member</h1>
      <TeamMemberForm initialData={member} onSubmit={handleSubmit} />
      <ConfirmDeleteModal
        open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Team Member" description="This will permanently delete this team member. This action cannot be undone." loading={deleting}
      />
    </div>
  );
}
