import type { ReactNode } from 'react';

interface AdminCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function AdminCard({ title, value, subtitle, icon }: AdminCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="p-2 bg-brand-accent/10 text-brand-accent">{icon}</div>}
      </div>
    </div>
  );
}
