'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClerkSupabaseClient, useOpusFestaAuth } from '@opusfesta/auth';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  Settings,
  Image as ImageIcon,
  X,
  Check,
  Phone,
  Calendar,
  File,
  Paperclip,
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
  Inbox,
  SmilePlus
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

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

// ---- Skeleton Components ----

function ThreadListSkeleton() {
  return (
    <div className="divide-y divide-border/40 dark:divide-border/30">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-start gap-3.5">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-6 py-4">
      {/* Date separator skeleton */}
      <div className="flex items-center justify-center my-4">
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>
      {/* Incoming message */}
      <div className="flex gap-3 justify-start">
        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-16 w-56 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      {/* Outgoing message */}
      <div className="flex gap-3 justify-end">
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-12 w-48 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      </div>
      {/* Incoming message */}
      <div className="flex gap-3 justify-start">
        <div className="w-9 flex-shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-20 w-64 rounded-2xl rounded-bl-sm" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      {/* Outgoing message */}
      <div className="flex gap-3 justify-end">
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-10 w-40 rounded-2xl rounded-br-sm" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="w-9 flex-shrink-0" />
      </div>
    </div>
  );
}

// ---- Date formatting helper ----

function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return format(date, 'EEEE'); // e.g., "Monday"
  }
  return format(date, 'MMMM d, yyyy'); // e.g., "January 15, 2025"
}

// ---- Main Component ----

export function MessagesPage({ vendor }: MessagesPageProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ file: File; preview: string; url?: string }>>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [mobileView, setMobileView] = useState<'threads' | 'conversation'>('threads');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const supabase = useClerkSupabaseClient();
  const { user: authUser } = useOpusFestaAuth();

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
  const currentUserId = vendorUserId || authUser?.id || null;

  // Fetch message threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['messageThreads', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorMessageThreads(vendor.id, {
        client: supabase,
        currentUserId: currentUserId || undefined,
      });
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
      return await getThreadMessages(selectedThreadId, supabase);
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
            markThreadMessagesAsRead(selectedThreadId, vendorUserId, supabase);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThreadId, currentUserId, vendorUserId, queryClient, vendor?.id, supabase]);

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

              toast.success(
                `${senderName} sent a message: ${messagePreview}${messagePreview.length >= 50 ? '...' : ''}`
              );
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
      markThreadMessagesAsRead(selectedThreadId, vendorUserId, supabase);
      queryClient.invalidateQueries({ queryKey: ['messageThreads', vendor?.id] });
    }
  }, [selectedThreadId, vendorUserId, messages.length, queryClient, vendor?.id, supabase]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      // Use requestAnimationFrame for smoother resize
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = '0px';
        const maxHeight = 256; // max-h-64 = 256px
        const minHeight = 44; // comfortable single-line height
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`;
      });
    }
  }, [messageContent]);

  // Auto-focus search input when search becomes active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Switch to conversation view on mobile when thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      setMobileView('conversation');
    }
  }, [selectedThreadId]);

  // Handle search close
  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  // Handle mobile back to thread list
  const handleMobileBack = () => {
    setMobileView('threads');
    setSelectedThreadId(null);
  };

  // Scroll to composer (for quick-reply button in sidebar)
  const scrollToComposer = useCallback(() => {
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // Focus the textarea after scrolling
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  }, []);

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

      return await sendMessageFn(threadId, vendorUserId, finalContent, supabase);
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

  const isSending = sendMessageMutation.isPending;
  const charCount = messageContent.length;

  return (
    <div className="h-full flex flex-col bg-background dark:bg-background p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      {/* Main three-column layout */}
      <div className="flex-1 flex gap-2 md:gap-4 min-h-0">
        {/* Left Column: Thread List */}
        <div className={`
          w-full md:w-[360px] md:flex-shrink-0
          rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm flex flex-col overflow-hidden min-h-0
          ${mobileView === 'conversation' ? 'hidden md:flex' : 'flex'}
        `}>
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
              <ThreadListSkeleton />
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mb-5">
                  <Inbox className="w-8 h-8 text-primary/60" />
                </div>
                {searchQuery ? (
                  <>
                    <p className="text-foreground font-semibold text-[15px]">No results found</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                      No conversations match &ldquo;{searchQuery}&rdquo;. Try a different search term.
                    </p>
                  </>
                ) : filter === 'unread' ? (
                  <>
                    <p className="text-foreground font-semibold text-[15px]">All caught up!</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                      You have no unread messages. Switch to &ldquo;All&rdquo; to see your conversations.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground font-semibold text-[15px]">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                      When customers reach out about your services, their messages will appear here. You will be notified of new inquiries.
                    </p>
                  </>
                )}
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
                              {inquiry.event_type} {inquiry.event_date ? `\u00B7 ${formatEventDate(inquiry.event_date)}` : '\u00B7 Date TBD'}
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
        <div className={`
          flex-1 flex flex-col rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm overflow-hidden min-h-0
          ${mobileView === 'threads' ? 'hidden md:flex' : 'flex'}
        `}>
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center bg-card">
              <div className="text-center max-w-[280px]">
                <div className="w-20 h-20 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-10 h-10 text-primary/50" />
                </div>
                <p className="text-foreground font-semibold text-lg">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
                  Choose a conversation from the list to view and reply to customer messages.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Conversation Header */}
              <div className="px-3 md:px-5 py-3 md:py-4 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3.5">
                    {/* Mobile back button */}
                    <button
                      onClick={handleMobileBack}
                      className="md:hidden p-2 -ml-1 hover:bg-muted/60 rounded-xl transition-colors"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <Avatar className="h-10 w-10 md:h-11 md:w-11 ring-2 ring-background shadow-sm">
                      <AvatarImage src={selectedThread?.user?.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground text-sm font-semibold">
                        {(selectedThread?.user?.name || selectedThread?.user?.email || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-[15px] md:text-[16px] text-foreground tracking-tight">
                        {selectedThread?.user?.name || selectedThread?.user?.email || 'Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground/80 font-medium mt-0.5 hidden sm:block">
                        {selectedThread?.user?.email}
                      </p>
                    </div>
                  </div>
                  {/* Desktop sidebar toggle */}
                  <button
                    onClick={() => setIsSidebarCollapsed(prev => !prev)}
                    className="hidden lg:flex p-2 hover:bg-muted/60 rounded-xl transition-colors"
                    aria-label={isSidebarCollapsed ? 'Show details panel' : 'Hide details panel'}
                    title={isSidebarCollapsed ? 'Show details' : 'Hide details'}
                  >
                    {isSidebarCollapsed ? (
                      <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <PanelRightClose className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-6 bg-card scrollbar-hide">
                {messagesLoading ? (
                  <MessagesSkeleton />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center mb-5">
                      <SmilePlus className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-foreground font-semibold text-[15px]">Start the conversation</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[260px] leading-relaxed">
                      Send a friendly greeting to kick things off. Great communication leads to great events!
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-5 rounded-xl"
                      onClick={scrollToComposer}
                    >
                      <Send className="h-3.5 w-3.5 mr-2" />
                      Write a message
                    </Button>
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
                                {formatDateSeparator(message.created_at)}
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
                            <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] md:max-w-[65%] ${isFromVendor ? 'items-end' : 'items-start'}`}>
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
              <div ref={composerRef} className="px-3 md:px-5 pt-3 md:pt-5 pb-3 md:pb-4 border-t border-border/60 dark:border-border/30 bg-gradient-to-b from-card/95 to-card dark:from-card/90 dark:to-card shrink-0">
                {/* Sending state banner */}
                {isSending && (
                  <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs font-medium text-primary">Sending message...</span>
                  </div>
                )}

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

                <div className="rounded-2xl shadow-md dark:shadow-lg border border-border/60 dark:border-border/30 bg-background/80 dark:bg-muted/20 backdrop-blur-sm p-3 md:p-4">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Write a message..."
                        className="w-full min-h-[44px] max-h-64 px-3 md:px-4 py-2.5 md:py-3 pr-20 rounded-xl border border-border/60 dark:border-border/30 bg-background dark:bg-muted/20 text-foreground placeholder:text-muted-foreground/70 dark:placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/25 focus:border-primary/30 dark:focus:border-primary/50 text-[15px] leading-relaxed transition-[height,border-color,box-shadow] duration-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
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
                      disabled={(!messageContent.trim() && attachments.length === 0) || isSending || uploadingAttachment}
                      size="icon"
                      className="h-11 w-11 md:h-12 md:w-12 rounded-xl shrink-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      {isSending || uploadingAttachment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  {/* Character count - only shown for long messages */}
                  {charCount > 500 && (
                    <div className="flex justify-end mt-1.5 pr-14">
                      <span className={`text-[11px] font-medium tabular-nums ${
                        charCount > 2000 ? 'text-destructive' : 'text-muted-foreground/60'
                      }`}>
                        {charCount.toLocaleString()} characters
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Reservation Details */}
        {selectedThreadId && selectedThread && !isSidebarCollapsed && (
          <div className="hidden lg:flex w-[360px] flex-shrink-0 flex-col rounded-2xl shadow-lg dark:shadow-2xl border border-border/60 dark:border-border/30 bg-card/95 dark:bg-card backdrop-blur-sm overflow-hidden min-h-0">
            <div className="px-5 py-4 border-b border-border/60 dark:border-border/30 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground tracking-tight">Reservation</h3>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 hover:bg-muted/60 rounded-lg transition-colors"
                aria-label="Close details panel"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
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
                <Button
                  variant="outline"
                  className="w-full justify-start h-11 rounded-xl font-semibold hover:bg-muted/60 transition-all duration-200"
                  onClick={scrollToComposer}
                >
                  <Send className="h-4 w-4 mr-2.5" />
                  Quick Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
