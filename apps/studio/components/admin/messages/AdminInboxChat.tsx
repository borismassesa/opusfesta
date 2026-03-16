'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BsSend, BsBoxArrowUpRight, BsArrowLeft } from 'react-icons/bs';
import AdminLifecycleBadge from '@/components/admin/ui/AdminLifecycleBadge';
import type { BookingLifecycleStatus } from '@/lib/booking-types';
import type { Conversation } from './ConversationList';

interface Message {
  id: string;
  booking_id: string;
  sender: string;
  sender_type: 'admin' | 'client';
  sender_name: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface AdminInboxChatProps {
  bookingId: string;
  conversation?: Conversation;
  onBack?: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function AdminInboxChat({ bookingId, conversation, onBack }: AdminInboxChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevBookingRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (markRead = false) => {
    try {
      const url = `/api/admin/bookings/${bookingId}/messages${markRead ? '?mark_read=true' : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [bookingId]);

  // Initial load — mark as read
  useEffect(() => {
    if (prevBookingRef.current !== bookingId) {
      setLoading(true);
      setMessages([]);
      setNewMessage('');
      prevBookingRef.current = bookingId;
    }
    fetchMessages(true); // mark_read=true on open
    inputRef.current?.focus();
  }, [bookingId, fetchMessages]);

  // Poll every 8 seconds (don't mark read on poll — already marked on open)
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(false), 8000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchMessages(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      booking_id: bookingId,
      sender: 'admin',
      sender_type: 'admin',
      sender_name: 'Studio Admin',
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === optimistic.id ? data.message : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        setNewMessage(content);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="shrink-0 px-5 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-card)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button onClick={onBack} className="lg:hidden p-1 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]">
                <BsArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[var(--admin-foreground)] truncate">
                  {conversation?.client_name || 'Conversation'}
                </h3>
                {conversation && (
                  <AdminLifecycleBadge status={conversation.lifecycle_status as BookingLifecycleStatus} size="sm" />
                )}
              </div>
              <p className="text-[11px] text-[var(--admin-muted)]">
                {conversation?.event_type || ''}{conversation?.client_email ? ` · ${conversation.client_email}` : ''}
              </p>
            </div>
          </div>
          <Link
            href={`/admin/bookings/${bookingId}`}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--admin-primary)] hover:underline shrink-0"
          >
            <BsBoxArrowUpRight className="w-3 h-3" />
            View Booking
          </Link>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 bg-[var(--admin-background)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-[var(--admin-muted)]">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-[var(--admin-muted)]">No messages yet</p>
            <p className="text-xs text-[var(--admin-muted)] mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAdmin = msg.sender_type === 'admin';
            const showDate = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-[10px] font-semibold text-[var(--admin-muted)] uppercase tracking-wider bg-[var(--admin-secondary)] px-3 py-1 rounded-full">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[75%] px-4 py-2.5 shadow-sm ${
                    isAdmin
                      ? 'bg-[var(--admin-primary)] text-white rounded-[var(--admin-radius)] rounded-br-sm'
                      : 'bg-[var(--admin-card)] text-[var(--admin-foreground)] border border-[var(--admin-border)] rounded-[var(--admin-radius)] rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    <div className={`flex items-center gap-2 mt-1.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${isAdmin ? 'text-white/60' : 'text-[var(--admin-muted)]'}`}>
                        {msg.sender_name || (isAdmin ? 'You' : 'Client')} · {formatTime(msg.created_at)}
                      </span>
                      {isAdmin && msg.read_at && (
                        <span className={`text-[10px] font-medium ${isAdmin ? 'text-white/70' : 'text-green-600'}`}>✓ Read</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-card)] p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-sm bg-[var(--admin-background)] border border-[var(--admin-border)] text-[var(--admin-foreground)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:border-[var(--admin-primary)] rounded-[var(--admin-radius)]"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 bg-[var(--admin-primary)] text-[var(--admin-primary-foreground)] text-xs font-semibold rounded-[var(--admin-radius)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <BsSend className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
