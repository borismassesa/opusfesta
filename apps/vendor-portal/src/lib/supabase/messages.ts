import { supabase } from './client';

export interface MessageThread {
  id: string;
  user_id: string;
  vendor_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  vendor?: {
    id: string;
    business_name: string;
    logo: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

// Get all message threads for a vendor
export async function getVendorMessageThreads(
  vendorId: string
): Promise<MessageThread[]> {
  // Get current user for debugging
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[Messages] Fetching threads for vendor:', vendorId, 'Current user:', user?.id);

  // First, verify we can access the vendor
  const { data: vendorCheck, error: vendorError } = await supabase
    .from('vendors')
    .select('id, user_id')
    .eq('id', vendorId)
    .single();
  
  if (vendorError) {
    console.error('[Messages] Error checking vendor:', vendorError);
  }
  
  console.log('[Messages] Vendor check result:', vendorCheck);
  console.log('[Messages] Vendor owner matches user:', vendorCheck?.user_id === user?.id);

  // Try query without join first to test RLS
  const { data: threadsWithoutJoin, error: testError } = await supabase
    .from('message_threads')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('last_message_at', { ascending: false });
  
  console.log('[Messages] Threads without join:', threadsWithoutJoin?.length || 0);
  if (testError) {
    console.error('[Messages] Error fetching threads (no join):', testError);
  }

  const { data, error } = await supabase
    .from('message_threads')
    .select(`
      *,
      user:users (
        id,
        name,
        email,
        avatar
      )
    `)
    .eq('vendor_id', vendorId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('[Messages] Error fetching vendor message threads:', error);
    console.error('[Messages] Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return [];
  }

  console.log('[Messages] Raw data from Supabase:', data);
  console.log('[Messages] Fetched threads:', data?.length || 0, 'threads');
  
  // If no data but no error, check RLS
  if (!data || data.length === 0) {
    console.warn('[Messages] No threads returned. Possible RLS issue. Current user:', user?.id);
    // Try a direct query to check RLS
    const { data: vendorCheck } = await supabase
      .from('vendors')
      .select('id, user_id')
      .eq('id', vendorId)
      .single();
    console.log('[Messages] Vendor check:', vendorCheck);
    if (vendorCheck && vendorCheck.user_id !== user?.id) {
      console.error('[Messages] User mismatch! Logged in as:', user?.id, 'but vendor owner is:', vendorCheck.user_id);
    }
  }

  if (!data) {
    return [];
  }

  // Get last message and unread count for each thread
  const threadsWithMessages = await Promise.all(
    data.map(async (thread) => {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .is('read_at', null)
        .neq('sender_id', (await supabase.auth.getUser()).data.user?.id || '');

      return {
        ...thread,
        last_message: messages || null,
        unread_count: unreadCount || 0,
      };
    })
  );

  return threadsWithMessages as MessageThread[];
}

// Get all message threads for a user
export async function getUserMessageThreads(
  userId: string
): Promise<MessageThread[]> {
  const { data, error } = await supabase
    .from('message_threads')
    .select(`
      *,
      vendor:vendors (
        id,
        business_name,
        logo
      )
    `)
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching user message threads:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Get last message and unread count for each thread
  const threadsWithMessages = await Promise.all(
    data.map(async (thread) => {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', thread.id)
        .is('read_at', null)
        .neq('sender_id', userId);

      return {
        ...thread,
        last_message: messages || null,
        unread_count: unreadCount || 0,
      };
    })
  );

  return threadsWithMessages as MessageThread[];
}

// Get or create a message thread between a user and vendor
export async function getOrCreateThread(
  userId: string,
  vendorId: string
): Promise<MessageThread | null> {
  // Try to get existing thread
  const { data: existingThread, error: fetchError } = await supabase
    .from('message_threads')
    .select(`
      *,
      user:users (
        id,
        name,
        email,
        avatar
      ),
      vendor:vendors (
        id,
        business_name,
        logo
      )
    `)
    .eq('user_id', userId)
    .eq('vendor_id', vendorId)
    .single();

  if (existingThread && !fetchError) {
    return existingThread as MessageThread;
  }

  // Create new thread if it doesn't exist
  const { data: newThread, error: createError } = await supabase
    .from('message_threads')
    .insert({
      user_id: userId,
      vendor_id: vendorId,
    })
    .select(`
      *,
      user:users (
        id,
        name,
        email,
        avatar
      ),
      vendor:vendors (
        id,
        business_name,
        logo
      )
    `)
    .single();

  if (createError || !newThread) {
    console.error('Error creating message thread:', createError);
    return null;
  }

  return newThread as MessageThread;
}

// Get messages for a specific thread
export async function getThreadMessages(
  threadId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users (
        id,
        name,
        email,
        avatar
      )
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching thread messages:', error);
    return [];
  }

  return (data || []) as Message[];
}

// Send a message to a thread
export async function sendMessage(
  threadId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select(`
      *,
      sender:users (
        id,
        name,
        email,
        avatar
      )
    `)
    .single();

  if (error || !data) {
    console.error('Error sending message:', error);
    return null;
  }

  return data as Message;
}

// Mark messages as read in a thread
export async function markThreadMessagesAsRead(
  threadId: string,
  userId: string
): Promise<boolean> {
  // Get the other participant's ID (vendor or user)
  const { data: thread } = await supabase
    .from('message_threads')
    .select('user_id, vendor_id')
    .eq('id', threadId)
    .single();

  if (!thread) {
    return false;
  }

  // Determine the other participant
  const otherParticipantId = thread.user_id === userId 
    ? (await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', thread.vendor_id)
        .single()).data?.user_id
    : thread.user_id;

  if (!otherParticipantId) {
    return false;
  }

  // Mark all messages from the other participant as read
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_id', otherParticipantId)
    .is('read_at', null);

  if (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }

  return true;
}

// Get unread message count for a vendor
export async function getVendorUnreadCount(
  vendorId: string
): Promise<number> {
  // Get vendor's user_id
  const { data: vendor } = await supabase
    .from('vendors')
    .select('user_id')
    .eq('id', vendorId)
    .single();

  if (!vendor) {
    return 0;
  }

  // Get all threads for this vendor
  const { data: threads } = await supabase
    .from('message_threads')
    .select('id')
    .eq('vendor_id', vendorId);

  if (!threads || threads.length === 0) {
    return 0;
  }

  const threadIds = threads.map((t) => t.id);

  // Count unread messages (messages not sent by vendor's user_id)
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('thread_id', threadIds)
    .is('read_at', null)
    .neq('sender_id', vendor.user_id);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

// Get unread message count for a user
export async function getUserUnreadCount(
  userId: string
): Promise<number> {
  // Get all threads for this user
  const { data: threads } = await supabase
    .from('message_threads')
    .select('id')
    .eq('user_id', userId);

  if (!threads || threads.length === 0) {
    return 0;
  }

  const threadIds = threads.map((t) => t.id);

  // Count unread messages (messages not sent by user)
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('thread_id', threadIds)
    .is('read_at', null)
    .neq('sender_id', userId);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}
