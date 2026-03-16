'use client';

import { useEffect, useState, useCallback } from 'react';
import { BsCircleFill, BsChatSquareText, BsSearch } from 'react-icons/bs';
import AdminLifecycleBadge from '@/components/admin/ui/AdminLifecycleBadge';
import type { BookingLifecycleStatus } from '@/lib/booking-types';

export interface Conversation {
  booking_id: string;
  client_name: string;
  client_email: string;
  event_type: string;
  lifecycle_status: string;
  unread_count: number;
  message_count: number;
  last_message: {
    content: string;
    sender_type: string;
    sender_name: string | null;
    created_at: string;
  };
}

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (bookingId: string) => void;
  onConversationsLoaded?: (conversations: Conversation[]) => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type TabFilter = 'unread' | 'all';

export default function ConversationList({ selectedId, onSelect, onConversationsLoaded }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations || [];
        setConversations(convs);
        onConversationsLoaded?.(convs);
        // Auto-switch to unread tab if there are unread messages
        if (convs.some((c: Conversation) => c.unread_count > 0)) {
          setTab('unread');
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [onConversationsLoaded]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Poll every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const unreadCount = conversations.filter(c => c.unread_count > 0).length;

  const filtered = conversations.filter(c => {
    if (tab === 'unread' && c.unread_count === 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.client_name.toLowerCase().includes(q) || c.event_type.toLowerCase().includes(q) || c.client_email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-[var(--admin-border)] shrink-0">
        <button
          onClick={() => setTab('unread')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'unread'
              ? 'text-[var(--admin-primary)] border-b-2 border-[var(--admin-primary)] bg-[var(--admin-primary)]/5'
              : 'text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]'
          }`}
        >
          Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`flex-1 px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'all'
              ? 'text-[var(--admin-primary)] border-b-2 border-[var(--admin-primary)] bg-[var(--admin-primary)]/5'
              : 'text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]'
          }`}
        >
          All ({conversations.length})
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[var(--admin-border)] shrink-0">
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--admin-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--admin-secondary)] border border-[var(--admin-border)] text-[var(--admin-foreground)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:border-[var(--admin-primary)]"
          />
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-[var(--admin-secondary)] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <BsChatSquareText className="w-8 h-8 text-[var(--admin-muted)] opacity-30 mb-3" />
            <p className="text-sm text-[var(--admin-muted)]">
              {tab === 'unread' ? 'No unread messages' : search ? 'No matching conversations' : 'No conversations yet'}
            </p>
            {tab === 'unread' && unreadCount === 0 && conversations.length > 0 && (
              <button
                onClick={() => setTab('all')}
                className="mt-2 text-xs text-[var(--admin-primary)] hover:underline"
              >
                View all conversations
              </button>
            )}
          </div>
        ) : (
          filtered.map(conv => {
            const isSelected = selectedId === conv.booking_id;
            const hasUnread = conv.unread_count > 0;
            return (
              <button
                key={conv.booking_id}
                onClick={() => onSelect(conv.booking_id)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--admin-border)] transition-colors ${
                  isSelected
                    ? 'bg-[var(--admin-primary)]/5 border-l-3 border-l-[var(--admin-primary)]'
                    : hasUnread
                    ? 'bg-blue-50/50 hover:bg-blue-50'
                    : 'hover:bg-[var(--admin-secondary)]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Unread dot */}
                  <div className="w-3 shrink-0 pt-1.5">
                    {hasUnread && <BsCircleFill className="w-2 h-2 text-blue-500" />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm truncate ${hasUnread ? 'font-bold text-[var(--admin-foreground)]' : 'font-medium text-[var(--admin-foreground)]'}`}>
                        {conv.client_name}
                      </span>
                      <span className="text-[10px] text-[var(--admin-muted)] shrink-0">
                        {timeAgo(conv.last_message.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-[var(--admin-muted)]">{conv.event_type}</span>
                      <AdminLifecycleBadge status={conv.lifecycle_status as BookingLifecycleStatus} size="sm" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${hasUnread ? 'text-[var(--admin-foreground)]' : 'text-[var(--admin-muted)]'}`}>
                        <span className="font-medium">
                          {conv.last_message.sender_type === 'client' ? '' : 'You: '}
                        </span>
                        {conv.last_message.content}
                      </p>
                      {hasUnread && (
                        <span className="shrink-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
