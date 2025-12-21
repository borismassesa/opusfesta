import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import screens
import { SplashScreen } from '@/screens/SplashScreen'; // Simple static splash with logo/branding
import { OnboardingScreen } from '@/screens/OnboardingScreen'; // Intro slides with wedding images + auth buttons
import { LoginScreen } from '@/screens/LoginScreen';
import { CreateAccountScreen } from '@/screens/CreateAccountScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { RoleSelectionScreen } from '@/screens/RoleSelectionScreen';
import { ProfileSetupScreen } from '@/screens/ProfileSetupScreen';
import { TermsOfServiceScreen } from '@/screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlanScreen } from '@/screens/PlanScreen';
import { GuestsScreen } from '@/screens/GuestsScreen';
import { MessagesScreen } from '@/screens/MessagesScreen';
import { MoreScreen } from '@/screens/MoreScreen';
import { EventDetailsScreen } from '@/screens/EventDetailsScreen';
import { VendorDetailsScreen } from '@/screens/VendorDetailsScreen';
import { CreateEventScreen } from '@/screens/CreateEventScreen';
import { CreateGuestScreen } from '@/screens/CreateGuestScreen';
import { VendorSearchScreen } from '@/screens/VendorSearchScreen';
import { BookingScreen } from '@/screens/BookingScreen';
import { PaymentScreen } from '@/screens/PaymentScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

// Import constants
import { THEMES } from '@/constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
function TabNavigator() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const tabBarOptions = {
    activeTintColor: theme === THEMES.LIGHT ? '#1e1b4b' : '#ffffff',
    inactiveTintColor: theme === THEMES.LIGHT ? '#6b7280' : '#9ca3af',
    style: {
      backgroundColor: theme === THEMES.LIGHT ? '#ffffff' : '#1f2937',
      borderTopColor: theme === THEMES.LIGHT ? '#e5e7eb' : '#374151',
    },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Plan':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Guests':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        ...tabBarOptions,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: language === 'sw' ? 'Nyumbani' : 'Home' }}
      />
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{ title: language === 'sw' ? 'Mpango' : 'Plan' }}
      />
      <Tab.Screen 
        name="Guests" 
        component={GuestsScreen}
        options={{ title: language === 'sw' ? 'Wageni' : 'Guests' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: language === 'sw' ? 'Ujumbe' : 'Messages' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen}
        options={{ title: language === 'sw' ? 'Zaidi' : 'More' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme === THEMES.LIGHT ? '#ffffff' : '#1f2937',
    },
    headerTintColor: theme === THEMES.LIGHT ? '#1e1b4b' : '#ffffff',
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
  };

      if (!isAuthenticated) {
        return (
          <NavigationContainer>
            <Stack.Navigator screenOptions={screenOptions}>
              <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateAccount"
                component={CreateAccountScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="TermsOfService"
                component={TermsOfServiceScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="RoleSelection"
                component={RoleSelectionScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProfileSetup"
                component={ProfileSetupScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        );
      }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen 
          name="Tabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EventDetails" 
          component={EventDetailsScreen}
          options={{ title: 'Event Details' }}
        />
        <Stack.Screen 
          name="CreateEvent" 
          component={CreateEventScreen}
          options={{ title: 'Create Event' }}
        />
        <Stack.Screen 
          name="VendorSearch" 
          component={VendorSearchScreen}
          options={{ title: 'Find Vendors' }}
        />
        <Stack.Screen 
          name="VendorDetails" 
          component={VendorDetailsScreen}
          options={{ title: 'Vendor Details' }}
        />
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{ title: 'Booking' }}
        />
        <Stack.Screen 
          name="CreateGuest" 
          component={CreateGuestScreen}
          options={{ title: 'Add Guest' }}
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
          options={{ title: 'Payment' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
