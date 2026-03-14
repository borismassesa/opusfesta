'use client';

import { STATUS_LABELS, STATUS_COLORS, type StatusColor } from '@/lib/booking-state-machine';
import type { BookingLifecycleStatus } from '@/lib/booking-types';

const COLOR_MAP: Record<StatusColor, string> = {
  gray: 'bg-gray-100 text-gray-700 border-gray-300',
  blue: 'bg-blue-50 text-blue-700 border-blue-300',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  violet: 'bg-violet-50 text-violet-700 border-violet-300',
  amber: 'bg-amber-50 text-amber-700 border-amber-300',
  orange: 'bg-orange-50 text-orange-700 border-orange-300',
  green: 'bg-green-50 text-green-700 border-green-300',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  red: 'bg-red-50 text-red-700 border-red-300',
};

interface Props {
  status: BookingLifecycleStatus;
  size?: 'sm' | 'md';
}

export default function AdminLifecycleBadge({ status, size = 'sm' }: Props) {
  const color = STATUS_COLORS[status] || 'gray';
  const classes = COLOR_MAP[color];
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-block border-2 font-mono font-bold uppercase tracking-wider ${classes} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {label}
    </span>
  );
}
