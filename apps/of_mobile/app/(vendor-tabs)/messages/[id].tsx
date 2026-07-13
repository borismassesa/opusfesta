import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/components/messages/ChatScreen';

export default function VendorChatRoute() {
  const { id, coupleName } = useLocalSearchParams<{ id: string; coupleName?: string }>();
  return <ChatScreen threadId={id} counterpartName={coupleName} />;
}
