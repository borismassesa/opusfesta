'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { BsSend, BsChatSquareText } from 'react-icons/bs';

interface Message {
  id: string;
  booking_id: string;
  sender_type: 'admin' | 'client';
  sender_name: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface BookingChatProps {
  bookingId: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function BookingChat({ bookingId }: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail on poll
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 8 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 8000);

    // Pause polling when tab is hidden
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages();
      }
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
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      booking_id: bookingId,
      sender_type: 'client',
      sender_name: 'You',
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        // Replace optimistic with real message
        setMessages(prev =>
          prev.map(m => m.id === optimisticMsg.id ? data.message : m)
        );
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        setNewMessage(content); // Restore the message
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="border-3 border-brand-border bg-white shadow-brutal">
      {/* Header */}
      <div className="bg-brand-dark px-6 py-3 flex items-center gap-2">
        <BsChatSquareText className="w-4 h-4 text-brand-accent" />
        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Messages</span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto p-4 space-y-1 bg-brand-bg/30"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-brand-muted font-mono">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BsChatSquareText className="w-8 h-8 text-brand-border mb-3" />
            <p className="text-sm font-bold text-brand-muted font-mono">No messages yet</p>
            <p className="text-xs text-brand-muted mt-1">Send a message to the studio team below</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isClient = msg.sender_type === 'client';
            const showDate = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider bg-brand-bg px-3 py-1">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 ${
                      isClient
                        ? 'bg-brand-dark text-white border-3 border-brand-border'
                        : 'bg-white text-brand-dark border-3 border-brand-border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    <div className={`flex items-center gap-2 mt-1.5 ${isClient ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] font-mono ${isClient ? 'text-white/60' : 'text-brand-muted'}`}>
                        {msg.sender_name || (isClient ? 'You' : 'Studio')} · {formatTime(msg.created_at)}
                      </span>
                      {isClient && msg.read_at && (
                        <span className="text-[10px] font-mono text-brand-accent">Read</span>
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
      <div className="border-t-3 border-brand-border p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border-3 border-brand-border text-sm font-mono focus:outline-none focus:border-brand-accent transition-colors"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 border-3 border-brand-border bg-brand-dark text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal-sm flex items-center gap-2"
          >
            <BsSend className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
