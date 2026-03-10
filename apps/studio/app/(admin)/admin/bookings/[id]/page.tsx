'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Send } from 'lucide-react';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import { AdminSelect } from '@/components/admin/ui/AdminInput';
import { AdminTextarea } from '@/components/admin/ui/AdminInput';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import type { StudioBooking, StudioBookingStatus, StudioMessage } from '@/lib/studio-types';

const statusOptions = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' }, { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
];

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<StudioBooking | null>(null);
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/bookings/${id}`).then((r) => r.json()),
      fetch(`/api/admin/bookings/${id}/messages`).then((r) => r.json()),
    ]).then(([bData, mData]) => {
      setBooking(bData.booking);
      setStatus(bData.booking?.status || '');
      setNotes(bData.booking?.admin_notes || '');
      setMessages(mData.messages || []);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    setSaving(false);
    router.push('/admin/bookings?saved=1');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    router.push('/admin/bookings?deleted=1');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const res = await fetch(`/api/admin/bookings/${id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, sender: 'admin' }),
    });
    const data = await res.json();
    if (data.message) setMessages((prev) => [...prev, data.message]);
    setNewMessage('');
  };

  if (!booking) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <AdminButton variant="ghost" onClick={() => router.push('/admin/bookings')} icon={<ArrowLeft className="w-4 h-4" />}>Back</AdminButton>
        <AdminButton variant="danger" size="sm" onClick={() => setShowDelete(true)} icon={<Trash2 className="w-4 h-4" />}>Delete</AdminButton>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900">{booking.name}</h2>
          <AdminBadge status={booking.status as StudioBookingStatus} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{booking.email}</span></div>
          {booking.phone && <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{booking.phone}</span></div>}
          <div><span className="text-gray-500">Event Type:</span> <span className="font-medium">{booking.event_type}</span></div>
          {booking.service && <div><span className="text-gray-500">Service:</span> <span className="font-medium">{booking.service}</span></div>}
          {booking.preferred_date && <div><span className="text-gray-500">Preferred Date:</span> <span className="font-medium">{booking.preferred_date}</span></div>}
          {booking.location && <div><span className="text-gray-500">Location:</span> <span className="font-medium">{booking.location}</span></div>}
          <div><span className="text-gray-500">Submitted:</span> <span className="font-medium">{new Date(booking.created_at).toLocaleString()}</span></div>
        </div>
        {booking.message && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-700">{booking.message}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Update Booking</h3>
        <AdminSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
        <AdminTextarea label="Admin Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
        <AdminButton onClick={handleSave} loading={saving}>Save Changes</AdminButton>
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Messages</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.length === 0 && <p className="text-sm text-gray-400">No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`p-3 text-sm ${m.sender === 'admin' ? 'bg-brand-accent/5 border-l-2 border-brand-accent' : 'bg-gray-50'}`}>
              <p className="text-gray-700">{m.content}</p>
              <p className="text-xs text-gray-400 mt-1">{m.sender} &middot; {new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          />
          <AdminButton onClick={handleSendMessage} icon={<Send className="w-4 h-4" />} size="md">Send</AdminButton>
        </div>
      </div>

      <ConfirmDeleteModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Booking" description="This will permanently delete this booking and all its messages." loading={deleting} />
    </div>
  );
}
