import { useState } from 'react';
import { Redirect, Tabs, type ErrorBoundaryProps } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { PlanningMenu } from '@/components/layout/PlanningMenu';
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
  {
    name: 'index',
    title: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    name: 'categories',
    title: 'Vendors',
    iconActive: 'storefront',
    iconInactive: 'storefront-outline',
  },
  {
    name: 'dashboard',
    title: 'Planning',
    iconActive: 'calendar',
    iconInactive: 'calendar-outline',
    center: true,
  },
  {
    name: 'messages',
    title: 'Messages',
    iconActive: 'chatbubble',
    iconInactive: 'chatbubble-outline',
  },
  {
    name: 'profile',
    title: 'Website',
    iconActive: 'laptop',
    iconInactive: 'laptop-outline',
  },
];

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const onboarding = useOnboardingState();
  const [menuOpen, setMenuOpen] = useState(false);
  const { editorial } = useTheme();
  usePushNotifications();

  if (!isLoaded || !isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboarding.status === 'loading' || onboarding.status === 'signed-out') return null;
  if (onboarding.status === 'incomplete') {
    return <Redirect href="/" />;
  }
  // A vendor who lands here (e.g. a stale deep link) belongs in their own tabs.
  if (onboarding.status === 'vendor') {
    return <Redirect href="/(vendor-tabs)" />;
  }

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
                          <Ionicons
                            name={menuOpen ? 'close' : 'calendar-outline'}
                            size={24}
                            color="#fff"
                          />
                        </View>
                      </Pressable>
                    ),
                  }
                : {
                    tabBarIcon: ({ focused, color }) => (
                      <Ionicons
                        name={focused ? tab.iconActive : tab.iconInactive}
                        size={22}
                        color={color}
                      />
                    ),
                  }),
            }}
          />
        ))}
      </Tabs>

      {/* Radial planning menu overlay */}
      <PlanningMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}
