import { useState } from 'react';
import { Redirect, Tabs, type ErrorBoundaryProps } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { VendorMenu } from '@/components/layout/VendorMenu';
import { ErrorFallback } from '@/components/ErrorFallback';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useOnboardingState } from '@/lib/auth';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} title="This screen hit a snag" />;
}

type TabIcon = keyof typeof Ionicons.glyphMap;

const tabs: {
  name: string;
  title: string;
  iconActive: TabIcon;
  iconInactive: TabIcon;
  center?: boolean;
}[] = [
  { name: 'index', title: 'Home', iconActive: 'home', iconInactive: 'home-outline' },
  { name: 'leads', title: 'Leads', iconActive: 'mail', iconInactive: 'mail-outline' },
  { name: 'bookings', title: 'Business', iconActive: 'briefcase', iconInactive: 'briefcase-outline', center: true },
  { name: 'calendar', title: 'Calendar', iconActive: 'calendar', iconInactive: 'calendar-outline' },
  { name: 'messages', title: 'Messages', iconActive: 'chatbubble', iconInactive: 'chatbubble-outline' },
];

export default function VendorTabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const onboarding = useOnboardingState();
  const [menuOpen, setMenuOpen] = useState(false);
  const { editorial } = useTheme();
  usePushNotifications();

  if (!isLoaded || !isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboarding.status === 'loading') return null;
  if (onboarding.status === 'signed-out') return <Redirect href="/(auth)/welcome" />;
  if (onboarding.status === 'incomplete') return <Redirect href="/" />;
  // A couple who somehow lands on this route group gets sent to their own tabs.
  if (onboarding.status === 'couple') return <Redirect href="/(tabs)" />;

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: editorial.primaryContainer,
          tabBarInactiveTintColor: editorial.outline,
          tabBarStyle: {
            backgroundColor: editorial.surfaceContainerLowest,
            borderTopColor: editorial.outlineVariant,
            borderTopWidth: 2,
            height: 84,
            paddingBottom: 16,
            paddingTop: 10,
            overflow: 'visible',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'WorkSans-Bold',
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
          tabBarItemStyle: {
            overflow: 'visible',
          },
        }}
      >
        {/* Radial-menu destinations — routable but hidden from the tab bar. */}
        <Tabs.Screen name="storefront" options={{ href: null }} />
        <Tabs.Screen name="team" options={{ href: null }} />
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              ...(tab.center
                ? {
                    // React Navigation's BottomTabBarButtonProps lives in
                    // @react-navigation/bottom-tabs — a transitive dep not
                    // resolvable from here — and props are spread onto Pressable.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tabBarButton: ({ ref: _ref, ...props }: any) => (
                      <Pressable
                        {...props}
                        onPress={() => setMenuOpen((prev) => !prev)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          paddingTop: 10,
                          overflow: 'visible',
                        }}
                      >
                        <View
                          style={[
                            {
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              backgroundColor: menuOpen ? editorial.onSurface : editorial.primaryContainer,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: -28,
                            },
                            shadowSoft,
                          ]}
                        >
                          <Ionicons name={menuOpen ? 'close' : 'briefcase-outline'} size={24} color="#fff" />
                        </View>
                      </Pressable>
                    ),
                  }
                : {
                    tabBarIcon: ({ focused, color }) => (
                      <Ionicons name={focused ? tab.iconActive : tab.iconInactive} size={22} color={color} />
                    ),
                  }),
            }}
          />
        ))}
      </Tabs>

      <VendorMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}
