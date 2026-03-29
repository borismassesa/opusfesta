'use client';

import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import FaqForm from '@/components/admin/forms/FaqForm';

export default function NewFaqPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/studio-admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create FAQ');
    }
    router.push('/studio-admin/faqs?saved=1');
  };

  return (
    <div className="space-y-6">
      <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/faqs')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
      <h1 className="text-xl font-bold text-gray-900">New FAQ</h1>
      <FaqForm onSubmit={handleSubmit} />
    </div>
  );
}
