import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { useOpusFestaAuth } from '@/lib/auth';
import { colors, brutalist } from '@/constants/theme';

type IonIcon = keyof typeof Ionicons.glyphMap;

const MENU_ITEMS: { icon: IonIcon; label: string; route?: string; danger?: boolean }[] = [
  { icon: 'heart-outline', label: 'Saved vendors', route: '/(tabs)/categories' },
  { icon: 'calendar-outline', label: 'Wedding details', route: '/website/section/wedding_details' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'settings-outline', label: 'Preferences' },
  { icon: 'help-circle-outline', label: 'Help & support' },
  { icon: 'log-out-outline', label: 'Sign out', danger: true },
];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user } = useOpusFestaAuth();
  const { signOut } = useAuth();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 12 }}>
            <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
          </Pressable>
          <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 20, color: '#1a1a1a' }}>Profile</Text>
        </View>

        {/* User card */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Avatar name={user?.name ?? undefined} imageUrl={user?.imageUrl} size="lg" />
          <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 20, color: '#1a1a1a', marginTop: 14 }}>
            {user?.name ?? 'Your Profile'}
          </Text>
          <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            {user?.email}
          </Text>
        </View>

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
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? '#DC2626' : colors.primary}
                style={{ marginRight: 14 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'DMSans-Medium',
                  fontSize: 15,
                  color: item.danger ? '#DC2626' : '#1a1a1a',
                }}
              >
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
