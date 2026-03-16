'use client';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:                 { label: 'Draft',              bg: 'bg-gray-100',    text: 'text-gray-600',    border: 'border-gray-300' },
  slot_held:             { label: 'Slot Held',          bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-300' },
  intake_submitted:      { label: 'Request Sent',       bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-300' },
  qualified:             { label: 'Under Review',       bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-300' },
  quote_sent:            { label: 'Quote Ready',        bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-300' },
  quote_accepted:        { label: 'Quote Accepted',     bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-300' },
  contract_sent:         { label: 'Contract Ready',     bg: 'bg-cyan-50',     text: 'text-cyan-700',    border: 'border-cyan-300' },
  contract_signed:       { label: 'Contract Signed',    bg: 'bg-teal-50',     text: 'text-teal-700',    border: 'border-teal-300' },
  deposit_pending:       { label: 'Deposit Due',        bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-300' },
  confirmed:             { label: 'Confirmed',          bg: 'bg-green-50',    text: 'text-green-700',   border: 'border-green-400' },
  reschedule_requested:  { label: 'Rescheduling',       bg: 'bg-yellow-50',   text: 'text-yellow-700',  border: 'border-yellow-300' },
  rescheduled:           { label: 'Rescheduled',        bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-300' },
  completed:             { label: 'Completed',          bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-400' },
  cancelled:             { label: 'Cancelled',          bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-300' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border-2 ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}
