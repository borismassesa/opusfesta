'use client';

import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import TestimonialForm from '@/components/admin/forms/TestimonialForm';

export default function NewTestimonialPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/studio-admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create testimonial');
    }
    router.push('/studio-admin/testimonials?saved=1');
  };

  return (
    <div className="space-y-6">
      <AdminButton variant="ghost" onClick={() => router.push('/studio-admin/testimonials')} icon={<BsArrowLeft className="w-4 h-4" />}>Back</AdminButton>
      <h1 className="text-xl font-bold text-gray-900">New Testimonial</h1>
      <TestimonialForm onSubmit={handleSubmit} />
    </div>
  );
}
