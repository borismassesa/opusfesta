import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

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
  const { editorial } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color={editorial.primaryContainer} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {subtitle && (
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 13,
                color: editorial.onSurfaceVariant,
              }}
            >
              {subtitle}
            </Text>
          )}
          <Text
            style={{
              fontFamily: 'PlayfairDisplay-Bold',
              fontSize: 24,
              color: editorial.onSurface,
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
