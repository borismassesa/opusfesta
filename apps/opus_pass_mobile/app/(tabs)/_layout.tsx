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
      <Tabs.Screen name="planning" options={{ title: 'Planning' }} />
      <Tabs.Screen name="registry" options={{ title: 'Registry' }} />
      <Tabs.Screen name="vendors" options={{ title: 'Vendors' }} />
      {/* Hidden from the tab bar (omitted from FloatingTabBar's TAB_CONFIG) —
          still reachable via the Chat icon buttons in the header pills, and
          Guest List via the Planning radial menu. */}
      <Tabs.Screen name="chat" options={{ title: 'Chat', href: null }} />
      <Tabs.Screen name="guests" options={{ title: 'Guests', href: null }} />
    </Tabs>
  );
}
