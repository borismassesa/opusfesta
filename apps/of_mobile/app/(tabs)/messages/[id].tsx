import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/components/messages/ChatScreen';

export default function CoupleChatRoute() {
  const { id, vendorName } = useLocalSearchParams<{ id: string; vendorName?: string }>();
  return <ChatScreen threadId={id} counterpartName={vendorName} />;
}
