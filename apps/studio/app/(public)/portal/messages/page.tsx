'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BsChatSquareText, BsChevronRight, BsCircleFill } from 'react-icons/bs';
import { useUser } from '@clerk/nextjs';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import PortalLoader from '@/components/portal/PortalLoader';

interface Conversation {
  booking_id: string;
  event_type: string;
  service: string | null;
  unread_count: number;
  last_message: {
    content: string;
    sender_type: 'admin' | 'client';
    sender_name: string | null;
    created_at: string;
  };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PortalMessagesPage() {
  const { user, isLoaded } = useUser();
  const { client, loading: clientLoading } = useClientAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async (retries = 2) => {
    try {
      const res = await fetch('/api/portal/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setLoading(false);
        return;
      }
      if (res.status === 401 && retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchConversations(retries - 1);
      }
      setLoading(false);
    } catch {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchConversations(retries - 1);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user || clientLoading || !client) return;
    fetchConversations();
  }, [isLoaded, user, clientLoading, client, fetchConversations]);

  // Poll for updates
  useEffect(() => {
    if (!client) return;
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [client, fetchConversations]);

  if (!isLoaded || clientLoading) {
    return <PortalLoader message="Loading messages" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-1">
          Client Portal
        </p>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Messages
        </h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-3 border-brand-border/30 bg-white p-6 animate-pulse">
              <div className="h-4 w-48 bg-brand-bg mb-3" />
              <div className="h-3 w-64 bg-brand-bg" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="border-3 border-brand-border bg-white p-12 text-center shadow-brutal">
          <BsChatSquareText className="w-10 h-10 text-brand-border mx-auto mb-4" />
          <h2 className="text-lg font-bold text-brand-dark font-mono uppercase mb-2">No Messages Yet</h2>
          <p className="text-brand-muted text-sm">
            Messages will appear here once you start a conversation on a booking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link
              key={conv.booking_id}
              href={`/portal/bookings/${conv.booking_id}`}
              className="block border-3 border-brand-border bg-white hover:border-brand-accent hover:shadow-brutal-accent transition-all group"
            >
              <div className="p-4 flex items-center gap-4">
                {/* Unread indicator */}
                <div className="w-5 shrink-0 flex justify-center">
                  {conv.unread_count > 0 ? (
                    <BsCircleFill className="w-2.5 h-2.5 text-brand-accent" />
                  ) : (
                    <div className="w-2.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-brand-dark font-mono text-sm uppercase tracking-wider truncate">
                      {conv.event_type}
                    </h3>
                    {conv.unread_count > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center bg-brand-accent text-white text-[10px] font-mono font-bold px-1.5">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted truncate">
                    <span className="font-bold">
                      {conv.last_message.sender_type === 'client' ? 'You' : (conv.last_message.sender_name || 'Studio')}:
                    </span>
                    {' '}{conv.last_message.content}
                  </p>
                </div>

                {/* Time + arrow */}
                <div className="shrink-0 text-right flex items-center gap-3">
                  <span className="text-[10px] font-mono text-brand-muted">
                    {timeAgo(conv.last_message.created_at)}
                  </span>
                  <BsChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-accent transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
