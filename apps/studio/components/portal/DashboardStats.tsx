'use client';

import { BsCalendar3, BsEnvelope, BsCashCoin, BsCheckCircle } from 'react-icons/bs';

interface DashboardStatsProps {
  activeBookings: number;
  totalBookings: number;
  unreadMessages: number;
  outstandingBalance: number;
  totalSpent: number;
}

function formatTZS(amount: number) {
  if (amount === 0) return 'TZS 0';
  return `TZS ${amount.toLocaleString('en-US')}`;
}

const stats = (props: DashboardStatsProps) => [
  {
    label: 'Active Bookings',
    value: String(props.activeBookings),
    sub: `${props.totalBookings} total`,
    icon: BsCalendar3,
    accent: props.activeBookings > 0,
  },
  {
    label: 'Unread Messages',
    value: String(props.unreadMessages),
    sub: props.unreadMessages > 0 ? 'Tap to view' : 'All caught up',
    icon: BsEnvelope,
    accent: props.unreadMessages > 0,
    href: '/portal/messages',
  },
  {
    label: 'Outstanding',
    value: formatTZS(props.outstandingBalance),
    sub: props.outstandingBalance > 0 ? 'Balance due' : 'Nothing due',
    icon: BsCashCoin,
    accent: props.outstandingBalance > 0,
  },
  {
    label: 'Total Spent',
    value: formatTZS(props.totalSpent),
    sub: `${props.totalBookings} booking${props.totalBookings !== 1 ? 's' : ''}`,
    icon: BsCheckCircle,
    accent: false,
  },
];

export default function DashboardStats(props: DashboardStatsProps) {
  const items = stats(props);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`border-3 bg-white p-4 transition-all ${
              stat.accent
                ? 'border-brand-accent shadow-brutal-accent'
                : 'border-brand-border shadow-brutal'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                className={`w-3.5 h-3.5 ${
                  stat.accent ? 'text-brand-accent' : 'text-brand-muted'
                }`}
              />
              <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <p
              className={`text-lg font-bold font-mono tracking-tight ${
                stat.accent ? 'text-brand-accent' : 'text-brand-dark'
              }`}
            >
              {stat.value}
            </p>
            <p className="text-[10px] text-brand-muted mt-0.5">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
