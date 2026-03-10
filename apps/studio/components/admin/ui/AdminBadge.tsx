import type { StudioBookingStatus } from '@/lib/studio-types';

const statusStyles: Record<StudioBookingStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminBadge({ status }: { status: StudioBookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
