'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Bell, Search, User } from 'lucide-react';
import { ThemeSwitcher } from './theme-switcher';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notifications] = useState([
    { id: 1, message: 'New booking request from Sarah M.', time: '2 min ago' },
    { id: 2, message: 'Payment received for Wedding Package', time: '1 hour ago' },
    { id: 3, message: 'Review received - 5 stars!', time: '3 hours ago' },
  ]);

  return (
    <header className="header">
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="sidebar__toggle"
          style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
        >
          <Menu size={20} />
        </button>
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl text-primary hover:text-primary/80 transition-colors select-none"
        >
          OpusFesta
        </Link>
      </div>

      {/* Center - Search */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px', position: 'relative', display: 'none' }}>
        <Search
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '18px',
            height: '18px',
            color: 'var(--muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search bookings, clients..."
          className="input"
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Right side */}
      <div className="header__actions">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="sidebar__toggle"
            style={{ position: 'relative', padding: '8px' }}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '2px solid var(--surface)',
                }}
              />
            )}
          </button>
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right', display: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>John Doe</p>
            <p style={{ fontSize: '12px', margin: 0, color: 'var(--muted)' }}>Photographer</p>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-strong))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04120c',
            }}
          >
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
