import { useState } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brutalist, brutalistShadow } from '@/constants/theme';
import { PlanningMenu } from '@/components/layout/PlanningMenu';

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
    title: 'Registry',
    iconActive: 'gift',
    iconInactive: 'gift-outline',
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
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isLoaded || !isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Redirect to onboarding if not complete
  const onboardingComplete =
    (user?.publicMetadata?.onboardingComplete as boolean) ||
    (user?.unsafeMetadata?.onboardingComplete as boolean) ||
    false;
  if (!onboardingComplete) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: brutalist.primaryContainer,
          tabBarInactiveTintColor: brutalist.outline,
          tabBarStyle: {
            backgroundColor: brutalist.surfaceContainerLowest,
            borderTopColor: brutalist.outlineVariant,
            borderTopWidth: 2,
            height: 84,
            paddingBottom: 16,
            paddingTop: 10,
            overflow: 'visible' as any,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'WorkSans-Bold',
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
          tabBarItemStyle: {
            overflow: 'visible' as any,
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
                    tabBarButton: (props) => (
                      <Pressable
                        {...props}
                        onPress={() => setMenuOpen((prev) => !prev)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          paddingTop: 10,
                          overflow: 'visible' as any,
                        }}
                      >
                        <View
                          style={[
                            {
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              backgroundColor: menuOpen ? brutalist.onSurface : brutalist.primaryContainer,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: -28,
                            },
                            brutalistShadow,
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
