import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { useOpusFestaAuth } from '@/lib/auth';
import { useTheme } from '@/theme/useTheme';
import type { ThemePreference } from '@/theme/ColorSchemeProvider';

type IonIcon = keyof typeof Ionicons.glyphMap;

const MENU_ITEMS: { icon: IonIcon; label: string; route?: string; danger?: boolean }[] = [
  { icon: 'heart-outline', label: 'Saved vendors', route: '/saved-vendors' },
  { icon: 'calendar-outline', label: 'Wedding details', route: '/wedding-details' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'help-circle-outline', label: 'Help & support', route: '/help-support' },
  { icon: 'log-out-outline', label: 'Sign out', danger: true },
];

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string; icon: IonIcon }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

function AppearanceToggle() {
  const { editorial, preference, setPreference } = useTheme();
  return (
    <View className="mb-7">
      <Text className="font-work-sans-bold text-[11px] tracking-[2px] uppercase text-ed-on-surface-variant mb-2.5 ml-0.5">
        Appearance
      </Text>
      <View className="flex-row bg-ed-surface-container rounded-[14px] p-1 gap-1">
        {APPEARANCE_OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[10px] ${
                active ? 'bg-ed-primary-container' : 'bg-transparent'
              }`}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? editorial.onPrimary : editorial.onSurfaceVariant}
              />
              <Text className={`font-work-sans-semibold text-[13px] ${active ? 'text-white' : 'text-ed-on-surface-variant'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user } = useOpusFestaAuth();
  const { signOut } = useAuth();
  const { editorial, colors } = useTheme();

  const handlePress = async (item: (typeof MENU_ITEMS)[number]) => {
    if (item.danger) {
      Alert.alert('Sign out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]);
      return;
    }
    if (item.route) {
      router.push(item.route as Href);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="p-1 mr-3">
            <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
          </Pressable>
          <Text className="font-work-sans-bold text-xl text-ed-on-surface">Profile</Text>
        </View>

        {/* User card */}
        <View className="items-center mb-8">
          <Avatar name={user?.name ?? undefined} imageUrl={user?.imageUrl} size="lg" />
          <Text className="font-work-sans-bold text-xl text-ed-on-surface mt-3.5">
            {user?.name ?? 'Your Profile'}
          </Text>
          <Text className="font-work-sans text-sm text-ed-on-surface-variant mt-1">
            {user?.email}
          </Text>
        </View>

        {/* Appearance */}
        <AppearanceToggle />

        {/* Menu items */}
        <View className="gap-0.5">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handlePress(item)}
              className="flex-row items-center py-4 border-b border-ed-outline-variant"
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? editorial.error : colors.primary}
                style={{ marginRight: 14 }}
              />
              <Text className={`flex-1 font-work-sans-medium text-[15px] ${item.danger ? 'text-ed-error' : 'text-ed-on-surface'}`}>
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={16} color={editorial.outlineVariant} />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
