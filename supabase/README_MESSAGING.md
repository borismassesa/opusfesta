# Messaging System Setup

## Overview

The messaging system allows vendors and customers to communicate directly through the platform. When a customer submits an inquiry, a message thread is automatically created.

## Database Setup

### 1. Run Migrations

Run the following migrations in order:

```bash
# Create messaging tables
supabase migration up 022_messaging_system.sql

# Auto-create threads on inquiry
supabase migration up 023_auto_create_message_thread_on_inquiry.sql
```

Or if using Supabase CLI:

```bash
supabase db push
```

### 2. Create Test Data

To create sample conversations for testing:

```bash
# Connect to your Supabase database and run:
psql <your-database-url> -f supabase/create_test_messages.sql
```

Or via Supabase SQL Editor:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/create_test_messages.sql`
4. Run the script

## How It Works

### Automatic Thread Creation

When a customer submits an inquiry:
1. The inquiry is created in the `inquiries` table
2. A database trigger (`trigger_create_message_thread_on_inquiry`) automatically:
   - Creates a message thread if one doesn't exist between the user and vendor
   - Creates an initial message with the inquiry content
   - Sets the thread's `last_message_at` timestamp

### Message Flow

1. **Customer submits inquiry** → Inquiry created → Thread + initial message created automatically
2. **Vendor views messages** → Sees new thread in `/messages` page
3. **Vendor responds** → Message added to thread
4. **Customer views messages** → Sees vendor's response
5. **Conversation continues** → Messages flow back and forth

## Testing

### Create Test Conversations

The `create_test_messages.sql` script will:
- Find existing users and vendors in your database
- Create 2 sample conversation threads
- Add multiple messages to each thread with different timestamps
- Include both read and unread messages

### Verify Setup

After running migrations and test data:

```sql
-- Check threads
SELECT 
  mt.id,
  u.email as user_email,
  v.business_name as vendor_name,
  mt.last_message_at,
  (SELECT COUNT(*) FROM messages WHERE thread_id = mt.id) as message_count
FROM message_threads mt
JOIN users u ON mt.user_id = u.id
JOIN vendors v ON mt.vendor_id = v.id
ORDER BY mt.last_message_at DESC;

-- Check messages
SELECT 
  m.id,
  m.content,
  m.sender_id,
  m.read_at,
  m.created_at
FROM messages m
ORDER BY m.created_at DESC
LIMIT 10;
```

## API Integration

The messaging system is integrated with:
- **Inquiry submission**: Automatically creates threads via database trigger
- **Messages page**: `/messages` route in vendor portal
- **Real-time updates**: Supabase Realtime subscriptions for live message delivery

## Troubleshooting

### Threads not being created

1. Check that the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_message_thread_on_inquiry';
   ```

2. Verify the function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'create_message_thread_from_inquiry';
   ```

3. Check inquiry has `user_id`:
   ```sql
   SELECT id, user_id, vendor_id FROM inquiries WHERE user_id IS NULL;
   ```

### Messages not appearing

1. Check RLS policies are enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('message_threads', 'messages');
   ```

2. Verify user authentication in Supabase
3. Check browser console for errors
