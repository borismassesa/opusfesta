import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MessageThreadRecord, VendorMessageRecord } from "@opusfesta/lib";

export type MessageThread = MessageThreadRecord;
export type Message = VendorMessageRecord;

// Get all message threads for a vendor
export async function getVendorMessageThreads(
  vendorId: string,
  options?: { client?: SupabaseClient; currentUserId?: string }
): Promise<MessageThread[]> {
  const db = options?.client || supabase;

  const { data, error } = await db
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
    return [];
  }

  if (!data) {
    return [];
  }

  // Get last message and unread count for each thread
  const currentUserId = options?.currentUserId;
  const threadsWithMessages = await Promise.all(
    data.map(async (thread) => {
      const { data: messages } = await db
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let unreadCount = 0;
      if (currentUserId) {
        const { count } = await db
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .is('read_at', null)
          .neq('sender_id', currentUserId);
        unreadCount = count || 0;
      }

      return {
        ...thread,
        last_message: messages || null,
        unread_count: unreadCount,
      };
    })
  );

  return threadsWithMessages as MessageThread[];
}

// Get all message threads for a user
export async function getUserMessageThreads(
  userId: string,
  client?: SupabaseClient
): Promise<MessageThread[]> {
  const db = client || supabase;

  const { data, error } = await db
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
    return [];
  }

  if (!data) {
    return [];
  }

  // Get last message and unread count for each thread
  const threadsWithMessages = await Promise.all(
    data.map(async (thread) => {
      const { data: messages } = await db
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await db
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
  vendorId: string,
  client?: SupabaseClient
): Promise<MessageThread | null> {
  const db = client || supabase;

  // Try to get existing thread
  const { data: existingThread, error: fetchError } = await db
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
  const { data: newThread, error: createError } = await db
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
    return null;
  }

  return newThread as MessageThread;
}

// Get messages for a specific thread
export async function getThreadMessages(
  threadId: string,
  client?: SupabaseClient
): Promise<Message[]> {
  const db = client || supabase;

  const { data, error } = await db
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
    return [];
  }

  return (data || []) as Message[];
}

// Send a message to a thread
export async function sendMessage(
  threadId: string,
  senderId: string,
  content: string,
  client?: SupabaseClient
): Promise<Message | null> {
  const db = client || supabase;

  const { data, error } = await db
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
    return null;
  }

  return data as Message;
}

// Mark messages as read in a thread
export async function markThreadMessagesAsRead(
  threadId: string,
  userId: string,
  client?: SupabaseClient
): Promise<boolean> {
  const db = client || supabase;

  // Get the other participant's ID (vendor or user)
  const { data: thread } = await db
    .from('message_threads')
    .select('user_id, vendor_id')
    .eq('id', threadId)
    .single();

  if (!thread) {
    return false;
  }

  // Determine the other participant
  const otherParticipantId = thread.user_id === userId
    ? (await db
        .from('vendors')
        .select('user_id')
        .eq('id', thread.vendor_id)
        .single()).data?.user_id
    : thread.user_id;

  if (!otherParticipantId) {
    return false;
  }

  // Mark all messages from the other participant as read
  const { error } = await db
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_id', otherParticipantId)
    .is('read_at', null);

  if (error) {
    return false;
  }

  return true;
}

// Get unread message count for a vendor
export async function getVendorUnreadCount(
  vendorId: string,
  client?: SupabaseClient
): Promise<number> {
  const db = client || supabase;

  // Get vendor's user_id
  const { data: vendor } = await db
    .from('vendors')
    .select('user_id')
    .eq('id', vendorId)
    .single();

  if (!vendor) {
    return 0;
  }

  // Get all threads for this vendor
  const { data: threads } = await db
    .from('message_threads')
    .select('id')
    .eq('vendor_id', vendorId);

  if (!threads || threads.length === 0) {
    return 0;
  }

  const threadIds = threads.map((t) => t.id);

  // Count unread messages (messages not sent by vendor's user_id)
  const { count, error } = await db
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('thread_id', threadIds)
    .is('read_at', null)
    .neq('sender_id', vendor.user_id);

  if (error) {
    return 0;
  }

  return count || 0;
}

// Get unread message count for a user
export async function getUserUnreadCount(
  userId: string,
  client?: SupabaseClient
): Promise<number> {
  const db = client || supabase;

  // Get all threads for this user
  const { data: threads } = await db
    .from('message_threads')
    .select('id')
    .eq('user_id', userId);

  if (!threads || threads.length === 0) {
    return 0;
  }

  const threadIds = threads.map((t) => t.id);

  // Count unread messages (messages not sent by user)
  const { count, error } = await db
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('thread_id', threadIds)
    .is('read_at', null)
    .neq('sender_id', userId);

  if (error) {
    return 0;
  }

  return count || 0;
}
