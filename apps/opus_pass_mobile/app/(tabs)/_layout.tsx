import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="cards" options={{ title: 'Cards' }} />
      <Tabs.Screen name="guests" options={{ title: 'Guests' }} />
      <Tabs.Screen name="registry" options={{ title: 'Registry' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
    </Tabs>
  );
}
