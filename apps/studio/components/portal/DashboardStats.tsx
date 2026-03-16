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
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`border-3 bg-white p-3 sm:p-4 transition-all ${
              stat.accent
                ? 'border-brand-accent shadow-brutal-accent'
                : 'border-brand-border shadow-brutal'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Icon
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                  stat.accent ? 'text-brand-accent' : 'text-brand-muted'
                }`}
              />
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider truncate">
                {stat.label}
              </span>
            </div>
            <p
              className={`text-sm sm:text-lg font-bold font-mono tracking-tight truncate ${
                stat.accent ? 'text-brand-accent' : 'text-brand-dark'
              }`}
            >
              {stat.value}
            </p>
            <p className="text-[9px] sm:text-[10px] text-brand-muted mt-0.5 truncate">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
