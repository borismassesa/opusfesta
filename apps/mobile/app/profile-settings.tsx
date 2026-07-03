import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
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
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          fontFamily: 'WorkSans-Bold',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: editorial.onSurfaceVariant,
          marginBottom: 10,
          marginLeft: 2,
        }}
      >
        Appearance
      </Text>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: editorial.surfaceContainer,
          borderRadius: 14,
          padding: 4,
          gap: 4,
        }}
      >
        {APPEARANCE_OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: active ? editorial.primaryContainer : 'transparent',
              }}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? editorial.onPrimary : editorial.onSurfaceVariant}
              />
              <Text
                style={{
                  fontFamily: 'WorkSans-SemiBold',
                  fontSize: 13,
                  color: active ? editorial.onPrimary : editorial.onSurfaceVariant,
                }}
              >
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
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
          </Pressable>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 20, color: editorial.onSurface }}>Profile</Text>
        </View>

        {/* User card */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Avatar name={user?.name ?? undefined} imageUrl={user?.imageUrl} size="lg" />
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 20, color: editorial.onSurface, marginTop: 14 }}>
            {user?.name ?? 'Your Profile'}
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, marginTop: 4 }}>
            {user?.email}
          </Text>
        </View>

        {/* Appearance */}
        <AppearanceToggle />

        {/* Menu items */}
        <View style={{ gap: 2 }}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handlePress(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: editorial.outlineVariant,
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? editorial.error : colors.primary}
                style={{ marginRight: 14 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'WorkSans-Medium',
                  fontSize: 15,
                  color: item.danger ? editorial.error : editorial.onSurface,
                }}
              >
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
