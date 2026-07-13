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
    <View className="flex-row items-center justify-between mb-5">
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && (
          <Pressable onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={22} color={editorial.primaryContainer} />
          </Pressable>
        )}
        <View className="flex-1">
          {subtitle && (
            <Text className="font-work-sans text-[13px] text-ed-on-surface-variant">
              {subtitle}
            </Text>
          )}
          <Text className="font-playfair-bold text-2xl text-ed-on-surface" numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
      {rightAction}
    </View>
  );
}
