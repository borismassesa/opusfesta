'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { 
  getVendorMessageThreads, 
  getThreadMessages, 
  sendMessage as sendMessageFn,
  markThreadMessagesAsRead,
  type MessageThread,
  type Message
} from '@/lib/supabase/messages';
import { type Vendor } from '@/lib/supabase/vendor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface MessagesTabProps {
  vendor: Vendor | null;
}

export function MessagesTab({ vendor }: MessagesTabProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get vendor's user_id
  const { data: vendorUserId } = useQuery({
    queryKey: ['vendorUserId', vendor?.id],
    queryFn: async () => {
      if (!vendor) return null;
      const { data } = await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', vendor.id)
        .single();
      return data?.user_id || null;
    },
    enabled: !!vendor,
  });

  // Fetch message threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['messageThreads', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorMessageThreads(vendor.id);
    },
    enabled: !!vendor,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['threadMessages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return [];
      return await getThreadMessages(selectedThreadId);
    },
    enabled: !!selectedThreadId,
    refetchInterval: 5000, // Refetch every 5 seconds for active thread
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!selectedThreadId) return;

    const channel = supabase
      .channel(`thread:${selectedThreadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${selectedThreadId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['threadMessages', selectedThreadId] });
          queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor?.id] });
          
          // Mark as read if message is from other user
          if (payload.new.sender_id !== currentUserId && vendorUserId) {
            markThreadMessagesAsRead(selectedThreadId, vendorUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThreadId, currentUserId, vendorUserId, queryClient, vendor?.id]);

  // Mark messages as read when thread is selected
  useEffect(() => {
    if (selectedThreadId && vendorUserId && messages.length > 0) {
      markThreadMessagesAsRead(selectedThreadId, vendorUserId);
      queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor?.id] });
    }
  }, [selectedThreadId, vendorUserId, messages.length, queryClient, vendor?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: string; content: string }) => {
      if (!vendorUserId) throw new Error('Not authenticated');
      return await sendMessageFn(threadId, vendorUserId, content);
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['threadMessages', selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !messageContent.trim() || !vendorUserId) return;

    sendMessageMutation.mutate({
      threadId: selectedThreadId,
      content: messageContent.trim(),
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No vendor selected</p>
      </div>
    );
  }

  return (
    <div id="section-messages" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Messages</h2>
        <p className="text-muted-foreground">
          Communicate with customers who have contacted you about your services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Thread List */}
        <div className="lg:col-span-1 border border-border rounded-lg bg-background overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Messages from customers will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {threads.map((thread) => {
                  const isSelected = selectedThreadId === thread.id;
                  const lastMessage = thread.last_message;
                  const displayName = thread.user?.name || thread.user?.email || 'Customer';
                  const unreadCount = thread.unread_count || 0;

                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full p-4 text-left hover:bg-surface transition-colors ${
                        isSelected ? 'bg-surface border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={thread.user?.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {displayName}
                            </p>
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatMessageTime(lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-2 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                          {unreadCount > 0 && (
                            <Badge className="mt-2 bg-primary text-primary-foreground">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 border border-border rounded-lg bg-background flex flex-col">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedThread?.user?.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(selectedThread?.user?.name || selectedThread?.user?.email || 'C').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedThread?.user?.name || selectedThread?.user?.email || 'Customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedThread?.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromVendor = message.sender_id === vendorUserId;
                    const senderName = message.sender?.name || message.sender?.email || 'User';

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isFromVendor ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isFromVendor && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={message.sender?.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col max-w-[70%] ${isFromVendor ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isFromVendor
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-surface text-foreground'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {isFromVendor && message.read_at && (
                              <span className="text-xs text-muted-foreground">✓ Read</span>
                            )}
                          </div>
                        </div>
                        {isFromVendor && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={vendor.logo || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {vendor.business_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    className="self-end"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
