'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import ConversationList from '@/components/admin/messages/ConversationList';
import AdminInboxChat from '@/components/admin/messages/AdminInboxChat';
import { BsChatSquareText } from 'react-icons/bs';
import type { Conversation } from '@/components/admin/messages/ConversationList';

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('booking') || null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Auto-select from URL param
  useEffect(() => {
    const bookingParam = searchParams.get('booking');
    if (bookingParam) {
      setSelectedId(bookingParam);
      setMobileShowChat(true);
    }
  }, [searchParams]);

  const handleSelect = useCallback((bookingId: string) => {
    setSelectedId(bookingId);
    setMobileShowChat(true);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('booking', bookingId);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleBack = useCallback(() => {
    setMobileShowChat(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('booking');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleConversationsLoaded = useCallback((convs: Conversation[]) => {
    setConversations(convs);
    // Auto-select first conversation if none selected
    if (!selectedId && convs.length > 0) {
      setSelectedId(convs[0].booking_id);
    }
  }, [selectedId]);

  const selectedConversation = conversations.find(c => c.booking_id === selectedId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="shrink-0 px-6 pt-4 pb-2">
        <AdminToast />
        <AdminPageHeader
          title="Messages"
          description="Chat with clients in real-time. Conversations are linked to bookings. Unread messages appear first."
          tips={[
            'Blue dot and badge indicate unread messages from clients.',
            'Switch between "Unread" and "All" tabs to filter conversations.',
            'Click "View Booking" in the chat header to see full booking details.',
            'Messages sent here are instantly visible to clients in their portal.',
          ]}
        />
      </div>

      {/* Two-panel inbox */}
      <div className="flex-1 flex overflow-hidden border-t border-[var(--admin-border)] min-h-0">
        {/* Left: Conversation list */}
        <div className={`w-full lg:w-[340px] lg:shrink-0 lg:border-r border-[var(--admin-border)] bg-[var(--admin-card)] ${
          mobileShowChat ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
        }`}>
          <ConversationList
            selectedId={selectedId}
            onSelect={handleSelect}
            onConversationsLoaded={handleConversationsLoaded}
          />
        </div>

        {/* Right: Chat panel */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          !mobileShowChat ? 'hidden lg:flex' : 'flex'
        }`}>
          {selectedId ? (
            <AdminInboxChat
              bookingId={selectedId}
              conversation={selectedConversation}
              onBack={handleBack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[var(--admin-background)]">
              <BsChatSquareText className="w-12 h-12 text-[var(--admin-muted)] opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-[var(--admin-foreground)] mb-1">Select a conversation</h3>
              <p className="text-sm text-[var(--admin-muted)] max-w-sm">
                Choose a conversation from the list to view messages and reply to clients.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
