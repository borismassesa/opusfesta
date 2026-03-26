import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { brutalist } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color={brutalist.primaryContainer} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {subtitle && (
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 13,
                color: brutalist.onSurfaceVariant,
              }}
            >
              {subtitle}
            </Text>
          )}
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 24,
              letterSpacing: -0.5,
              color: brutalist.onSurface,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>
      {rightAction}
    </View>
  );
}
