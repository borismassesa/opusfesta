export interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageThreadRow {
  id: string;
  user_id: string;
  vendor_id: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  vendors: {
    id: string;
    business_name: string;
    logo: string | null;
  } | null;
}

/** A thread plus the preview fields the list needs, derived client-side. */
export interface ConversationSummary extends MessageThreadRow {
  preview: string | null;
  unreadCount: number;
}
