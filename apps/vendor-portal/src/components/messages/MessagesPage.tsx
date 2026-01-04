'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Search, 
  Settings, 
  Plus, 
  Image as ImageIcon,
  X,
  Check,
  Star,
  Phone,
  Calendar,
  File,
  Paperclip
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface MessagesPageProps {
  vendor: Vendor;
}

interface Inquiry {
  id: string;
  event_type: string;
  event_date: string | null;
  guest_count: number | null;
  budget: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

export function MessagesPage({ vendor }: MessagesPageProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ file: File; preview: string; url?: string }>>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get current user and verify authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('[Messages] Not authenticated:', error);
        return;
      }
      setCurrentUserId(user.id);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [vendor.user_id]);

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
    refetchInterval: 30000,
  });

  // Filter and search threads
  const filteredThreads = useMemo(() => {
    let filtered = threads;

    // Apply unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(thread => (thread.unread_count || 0) > 0);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(thread => {
        const userName = thread.user?.name || '';
        const userEmail = thread.user?.email || '';
        const lastMessage = thread.last_message?.content || '';
        return (
          userName.toLowerCase().includes(query) ||
          userEmail.toLowerCase().includes(query) ||
          lastMessage.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [threads, filter, searchQuery]);

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['threadMessages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return [];
      return await getThreadMessages(selectedThreadId);
    },
    enabled: !!selectedThreadId,
    refetchInterval: 5000,
  });

  // Fetch inquiry for selected thread
  const selectedThread = threads.find((t) => t.id === selectedThreadId);
  const { data: inquiry } = useQuery({
    queryKey: ['threadInquiry', selectedThread?.user_id, vendor?.id],
    queryFn: async () => {
      if (!selectedThread?.user_id || !vendor?.id) return null;
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, event_type, event_date, guest_count, budget, location, status, created_at')
        .eq('user_id', selectedThread.user_id)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching inquiry:', error);
        return null;
      }
      return data as Inquiry | null;
    },
    enabled: !!selectedThread?.user_id && !!vendor?.id,
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!selectedThreadId || !vendor?.id) return;

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
          queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor.id] });
          
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

  // Set up realtime subscription for new messages in any thread
  useEffect(() => {
    if (!vendor?.id || !vendorUserId) return;

    const channel = supabase
      .channel(`vendor-messages:${vendor.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Check if this message is for this vendor
          const { data: thread } = await supabase
            .from('message_threads')
            .select('vendor_id')
            .eq('id', payload.new.thread_id)
            .single();

          if (thread?.vendor_id === vendor.id && payload.new.sender_id !== vendorUserId) {
            // New message from a customer
            queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor.id] });
            
            // Show notification if not on messages page or if it's a different thread
            if (payload.new.thread_id !== selectedThreadId) {
              const { data: sender } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', payload.new.sender_id)
                .single();
              
              const senderName = sender?.name || sender?.email || 'Someone';
              const messagePreview = (payload.new.content as string).substring(0, 50);
              
              toast.success(`${senderName} sent a message`, {
                description: messagePreview + (messagePreview.length >= 50 ? '...' : ''),
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor?.id, vendorUserId, selectedThreadId, queryClient]);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 256; // max-h-64 = 256px
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [messageContent]);

  // Auto-focus search input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Handle search close
  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  // Upload attachment function
  const uploadAttachment = async (file: File): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `messages/${timestamp}-${random}.${fileExt}`;

      const { uploadImage } = await import('@/lib/supabase/vendor');
      const { url, error: uploadError } = await uploadImage('vendor-assets', fileName, file);
      
      if (uploadError || !url) {
        throw new Error(uploadError || 'Upload failed');
      }

      return url;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload attachment');
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type for images
    if (isImage && !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    const newAttachment = { file, preview };

    setAttachments(prev => [...prev, newAttachment]);

    // Upload immediately
    setUploadingAttachment(true);
    const url = await uploadAttachment(file);
    setUploadingAttachment(false);

    if (url) {
      setAttachments(prev => 
        prev.map(att => 
          att.file === file ? { ...att, url } : att
        )
      );
    } else {
      // Remove failed upload
      setAttachments(prev => prev.filter(att => att.file !== file));
      URL.revokeObjectURL(preview);
    }

    // Reset input
    e.target.value = '';
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ threadId, content, attachmentUrls }: { threadId: string; content: string; attachmentUrls?: string[] }) => {
      if (!vendorUserId) throw new Error('Not authenticated');
      
      // Combine content with attachment URLs
      let finalContent = content.trim();
      if (attachmentUrls && attachmentUrls.length > 0) {
        const imageUrls = attachmentUrls.map(url => `![attachment](${url})`).join('\n');
        finalContent = finalContent ? `${finalContent}\n\n${imageUrls}` : imageUrls;
      }
      
      return await sendMessageFn(threadId, vendorUserId, finalContent);
    },
    onSuccess: () => {
      setMessageContent('');
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ['threadMessages', selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || (!messageContent.trim() && attachments.length === 0) || !vendorUserId) return;

    // Get uploaded URLs from attachments
    const attachmentUrls = attachments
      .filter(att => att.url)
      .map(att => att.url!)
      .filter(Boolean);

    // Clean up preview URLs
    attachments.forEach(att => {
      if (att.preview) {
        URL.revokeObjectURL(att.preview);
      }
    });

    sendMessageMutation.mutate({
      threadId: selectedThreadId,
      content: messageContent.trim(),
      attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
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

  const formatThreadTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        return format(date, 'EEEE');
      } else {
        return format(date, 'MMM d');
      }
    }
  };

  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background dark:bg-background p-4 gap-4 overflow-hidden">
      {/* Main three-column layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Column: Thread List */}
        <div className="w-[360px] rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm flex flex-col overflow-hidden min-h-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 flex items-center gap-3">
            {/* Left side: Title or Search Bar */}
            <div className="flex-1 relative overflow-hidden min-h-[36px] flex items-center">
              {/* Title - shown when search is inactive */}
              <h2 
                className={`text-2xl font-bold tracking-tight text-foreground transition-all duration-300 ease-out ${
                  isSearchActive 
                    ? 'opacity-0 translate-x-[-24px] absolute pointer-events-none' 
                    : 'opacity-100 translate-x-0'
                }`}
              >
                Messages
              </h2>

              {/* Search Bar - shown when search is active */}
              <div 
                className={`relative w-full transition-all duration-300 ease-out ${
                  isSearchActive 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-[24px] absolute pointer-events-none'
                }`}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10 pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      // Only close if search query is empty
                      if (!searchQuery.trim()) {
                        handleSearchClose();
                      }
                    }}
                    className="pl-11 pr-11 h-11 text-[15px] bg-background dark:bg-muted/30 border border-border/50 dark:border-border/30 focus:bg-background dark:focus:bg-muted/40 focus:border-primary/40 dark:focus:border-primary/50 focus:ring-2 focus:ring-primary/15 dark:focus:ring-primary/20 focus:outline-none transition-all duration-200 rounded-2xl shadow-sm dark:shadow-md hover:border-border/80 dark:hover:border-border/50 hover:shadow-md dark:hover:shadow-lg"
                    style={{ 
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleSearchClose}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-muted/70 rounded-lg transition-all duration-200 group"
                    >
                      <X className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Icons - always visible */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isSearchActive ? (
                <>
                  <button 
                    onClick={() => setIsSearchActive(true)}
                    className="p-2.5 hover:bg-muted/60 active:bg-muted rounded-xl transition-all duration-200 group"
                    aria-label="Search conversations"
                  >
                    <Search className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                  <button 
                    className="p-2.5 hover:bg-muted/60 active:bg-muted rounded-xl transition-all duration-200 group"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleSearchClose}
                  className="px-4 py-2.5 hover:bg-muted/60 active:bg-muted rounded-xl transition-all duration-200 group font-medium text-sm"
                  aria-label="Cancel search"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="px-5 py-3.5 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-transparent to-muted/20 dark:to-muted/30 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-foreground text-background shadow-sm scale-[1.02]'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                filter === 'unread'
                  ? 'bg-foreground text-background shadow-sm scale-[1.02]'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              Unread
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {threadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-foreground font-medium">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery ? 'No conversations match your search' : 'Messages from customers will appear here'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 dark:divide-border/30">
                {filteredThreads.map((thread) => {
                  const isSelected = selectedThreadId === thread.id;
                  const lastMessage = thread.last_message;
                  const displayName = thread.user?.name || thread.user?.email || 'Customer';
                  const unreadCount = thread.unread_count || 0;

                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full px-5 py-4 text-left transition-all duration-200 relative ${
                        isSelected 
                          ? 'bg-primary/5 dark:bg-primary/10 border-l-3 border-l-primary dark:border-l-primary/80' 
                          : 'hover:bg-muted/30 dark:hover:bg-muted/40 border-l-3 border-l-transparent'
                      } ${unreadCount > 0 ? 'font-semibold' : ''}`}
                    >
                      {unreadCount > 0 && !isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <div className="flex items-start gap-3.5">
                        <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-background shadow-sm">
                          <AvatarImage src={thread.user?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground text-sm font-semibold">
                            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className={`text-[15px] truncate ${
                              unreadCount > 0 
                                ? 'font-bold text-foreground' 
                                : isSelected 
                                  ? 'font-semibold text-foreground' 
                                  : 'font-medium text-foreground'
                            }`}>
                              {displayName}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              {lastMessage && (
                                <span className={`text-[11px] font-medium ${
                                  unreadCount > 0 
                                    ? 'text-primary font-semibold' 
                                    : 'text-muted-foreground/80'
                                }`}>
                                  {formatThreadTime(lastMessage.created_at)}
                                </span>
                              )}
                              {unreadCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 shadow-md min-w-[20px] h-5 flex items-center justify-center rounded-full animate-pulse hover:animate-none">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {lastMessage && (
                            <p className={`text-sm line-clamp-2 mb-1.5 leading-relaxed ${
                              unreadCount > 0 
                                ? 'text-foreground font-medium' 
                                : 'text-muted-foreground/90'
                            }`}>
                              {lastMessage.content}
                            </p>
                          )}
                          {inquiry && thread.id === selectedThreadId && (
                            <p className="text-xs text-muted-foreground/80 truncate font-medium">
                              {inquiry.event_type} • {inquiry.event_date ? formatEventDate(inquiry.event_date) : 'Date TBD'}
                            </p>
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

        {/* Center Column: Conversation */}
        <div className="flex-1 flex flex-col rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm overflow-hidden min-h-0">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center bg-card">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose a conversation from the list to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="px-5 py-4 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                      <AvatarImage src={selectedThread?.user?.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground text-sm font-semibold">
                        {(selectedThread?.user?.name || selectedThread?.user?.email || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-[16px] text-foreground tracking-tight">
                        {selectedThread?.user?.name || selectedThread?.user?.email || 'Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
                        {selectedThread?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-card scrollbar-hide">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => {
                      const isFromVendor = message.sender_id === vendorUserId;
                      const senderName = message.sender?.name || message.sender?.email || 'User';
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showDateSeparator = !prevMessage || 
                        format(new Date(message.created_at), 'MMM d, yyyy') !== 
                        format(new Date(prevMessage.created_at), 'MMM d, yyyy');
                      const showAvatar = !prevMessage || 
                        prevMessage.sender_id !== message.sender_id ||
                        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 minutes
                      const isGrouped = !showAvatar && prevMessage && prevMessage.sender_id === message.sender_id;

                      return (
                        <div key={message.id}>
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-8">
                              <span className="text-xs font-semibold text-muted-foreground/80 dark:text-muted-foreground/70 bg-muted/30 dark:bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 dark:border-border/30 shadow-sm dark:shadow-md">
                                {format(new Date(message.created_at), 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex gap-3 ${isFromVendor ? 'justify-end' : 'justify-start'} ${
                              isGrouped ? 'mt-1' : 'mt-4'
                            }`}
                          >
                            {!isFromVendor && (
                              <div className="flex-shrink-0">
                                {showAvatar ? (
                                  <Avatar className="h-9 w-9 ring-2 ring-background">
                                    <AvatarImage src={message.sender?.avatar || undefined} />
                                    <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                                      {senderName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-9" />
                                )}
                              </div>
                            )}
                            <div className={`flex flex-col max-w-[70%] sm:max-w-[65%] ${isFromVendor ? 'items-end' : 'items-start'}`}>
                              {showAvatar && !isFromVendor && (
                                <p className="text-xs font-semibold text-foreground mb-1.5 px-1.5">
                                  {senderName}
                                </p>
                              )}
                            <div
                              className={`rounded-2xl px-4 py-3 shadow-sm dark:shadow-md ${
                                isFromVendor
                                  ? 'bg-foreground dark:bg-foreground/90 text-background rounded-br-sm'
                                  : 'bg-muted/80 dark:bg-muted text-foreground rounded-bl-sm'
                              }`}
                            >
                              <div className="space-y-2">
                                {/* Parse and display content with images */}
                                {(() => {
                                  const lines = message.content.split('\n');
                                  const parts: Array<{ type: 'text' | 'image'; content: string }> = [];
                                  let currentText = '';

                                  lines.forEach((line) => {
                                    const imageMatch = line.match(/!\[.*?\]\((.*?)\)/);
                                    if (imageMatch) {
                                      // Save any accumulated text
                                      if (currentText.trim()) {
                                        parts.push({ type: 'text', content: currentText.trim() });
                                        currentText = '';
                                      }
                                      // Add image
                                      parts.push({ type: 'image', content: imageMatch[1] });
                                    } else {
                                      // Accumulate text
                                      currentText += (currentText ? '\n' : '') + line;
                                    }
                                  });

                                  // Add remaining text
                                  if (currentText.trim()) {
                                    parts.push({ type: 'text', content: currentText.trim() });
                                  }

                                  // If no parts (shouldn't happen), show original content
                                  if (parts.length === 0) {
                                    return (
                                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-normal">
                                        {message.content}
                                      </p>
                                    );
                                  }

                                  return parts.map((part, idx) => {
                                    if (part.type === 'image') {
                                      return (
                                        <img
                                          key={idx}
                                          src={part.content}
                                          alt="Attachment"
                                          className="max-w-[300px] max-h-[300px] rounded-lg object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      );
                                    }
                                    return (
                                      <p key={idx} className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-normal">
                                        {part.content}
                                      </p>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                              <div className={`flex items-center gap-1.5 mt-1.5 px-1.5 ${isFromVendor ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                {isFromVendor && message.read_at && (
                                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            {isFromVendor && (
                              <div className="flex-shrink-0">
                                {showAvatar ? (
                                  <Avatar className="h-9 w-9 ring-2 ring-background">
                                    <AvatarImage src={vendor.logo || undefined} />
                                    <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                                      {vendor.business_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-9" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-5 pt-5 pb-4 border-t border-border/60 dark:border-border/30 bg-gradient-to-b from-card/95 to-card dark:from-card/90 dark:to-card shrink-0">
                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        {attachment.file.type.startsWith('image/') ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/60 dark:border-border/30">
                            <img
                              src={attachment.preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            {uploadingAttachment && !attachment.url && (
                              <div className="absolute inset-0 bg-background/80 dark:bg-background/60 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative px-3 py-2 rounded-lg border border-border/60 dark:border-border/30 bg-muted/30 dark:bg-muted/40 flex items-center gap-2">
                            <File className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-foreground truncate max-w-[100px]">
                              {attachment.file.name}
                            </span>
                            {uploadingAttachment && !attachment.url && (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-2xl shadow-md dark:shadow-lg border border-border/60 dark:border-border/30 bg-background/80 dark:bg-muted/20 backdrop-blur-sm p-4">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Write a message..."
                        className="w-full min-h-[80px] max-h-64 px-4 py-3 pr-20 rounded-xl border border-border/60 dark:border-border/30 bg-background dark:bg-muted/20 text-foreground placeholder:text-muted-foreground/70 dark:placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/25 focus:border-primary/30 dark:focus:border-primary/50 text-[15px] leading-relaxed transition-all duration-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        rows={3}
                      />
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="*"
                          onChange={(e) => handleFileSelect(e, false)}
                          className="hidden"
                        />
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, true)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 group"
                          title="Attach file"
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 group"
                          title="Attach image"
                        >
                          <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={(!messageContent.trim() && attachments.length === 0) || sendMessageMutation.isPending || uploadingAttachment}
                      size="icon"
                      className="h-12 w-12 rounded-xl shrink-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {sendMessageMutation.isPending || uploadingAttachment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Reservation Details */}
        {selectedThreadId && selectedThread && (
          <div className="w-[360px] flex flex-col rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm overflow-hidden min-h-0">
            <div className="px-5 py-4 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground tracking-tight">Reservation</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                    <AvatarImage src={selectedThread.user?.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
                      {(selectedThread.user?.name || selectedThread.user?.email || 'C').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-[15px] text-foreground tracking-tight">
                      {selectedThread.user?.name || selectedThread.user?.email || 'Customer'}
                    </p>
                    <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
                      {selectedThread.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inquiry Details */}
              {inquiry ? (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Event Type</p>
                    <p className="text-sm font-bold text-foreground capitalize">{inquiry.event_type}</p>
                  </div>
                  {inquiry.event_date && (
                    <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Event Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="text-sm font-bold text-foreground">
                          {formatEventDate(inquiry.event_date)}
                        </p>
                      </div>
                    </div>
                  )}
                  {inquiry.guest_count && (
                    <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Guests</p>
                      <p className="text-sm font-bold text-foreground">{inquiry.guest_count} guests</p>
                    </div>
                  )}
                  {inquiry.location && (
                    <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Location</p>
                      <p className="text-sm font-bold text-foreground">{inquiry.location}</p>
                    </div>
                  )}
                  {inquiry.budget && (
                    <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Budget</p>
                      <p className="text-sm font-bold text-foreground">{inquiry.budget}</p>
                    </div>
                  )}
                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-muted/40 border border-border/40 dark:border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground/80 mb-2 uppercase tracking-wide">Status</p>
                    <Badge variant="outline" className="capitalize font-semibold border-2">
                      {inquiry.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/70 font-medium">No inquiry details available</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-5 border-t border-border/60 dark:border-border/30">
                <Button variant="outline" className="w-full justify-start h-11 rounded-xl font-semibold hover:bg-muted/60 transition-all duration-200">
                  <Phone className="h-4 w-4 mr-2.5" />
                  Contact Customer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
