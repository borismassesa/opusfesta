'use client';

import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import TeamMemberForm from '@/components/admin/forms/TeamMemberForm';

export default function NewTeamMemberPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add team member');
    }
    router.push('/admin/team?saved=1');
  };

  return (
    <div className="space-y-6">
      <AdminButton variant="ghost" onClick={() => router.push('/admin/team')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
      <h1 className="text-xl font-bold text-gray-900">New Team Member</h1>
      <TeamMemberForm onSubmit={handleSubmit} />
    </div>
  );
}
