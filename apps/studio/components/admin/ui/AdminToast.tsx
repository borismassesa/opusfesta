'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BsCheckCircle, BsXCircle, BsX } from 'react-icons/bs';

function ToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const saved = searchParams.get('saved');
    const deleted = searchParams.get('deleted');
    const error = searchParams.get('error');

    if (saved === '1') { setMessage('Saved successfully'); setType('success'); setVisible(true); }
    else if (deleted === '1') { setMessage('Deleted successfully'); setType('success'); setVisible(true); }
    else if (error) { setMessage(error); setType('error'); setVisible(true); }

    if (saved || deleted || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete('saved');
      url.searchParams.delete('deleted');
      url.searchParams.delete('error');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border px-4 py-3 text-sm font-medium shadow-[var(--admin-shadow-lg)] ${
      type === 'success'
        ? 'border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-card-foreground)]'
        : 'border-[rgba(239,67,67,0.2)] bg-[var(--admin-card)] text-[var(--admin-destructive)]'
    }`}>
      {type === 'success' ? <BsCheckCircle className="w-4 h-4" /> : <BsXCircle className="w-4 h-4" />}
      {message}
      <button onClick={() => setVisible(false)} className="ml-2 p-0.5 transition-opacity hover:opacity-70"><BsX className="w-3 h-3" /></button>
    </div>
  );
}

export default function AdminToast() {
  return <Suspense><ToastInner /></Suspense>;
}
