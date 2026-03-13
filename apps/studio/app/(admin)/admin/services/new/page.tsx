'use client';

import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import ServiceForm from '@/components/admin/forms/ServiceForm';

export default function NewServicePage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create service');
    }
    router.push('/admin/services?saved=1');
  };

  return (
    <div className="space-y-6">
      <AdminButton variant="ghost" onClick={() => router.push('/admin/services')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
      <h1 className="text-xl font-bold text-gray-900">New Service</h1>
      <ServiceForm onSubmit={handleSubmit} />
    </div>
  );
}
