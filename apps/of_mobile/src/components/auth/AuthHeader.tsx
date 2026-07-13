import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface AuthHeaderProps {
  onBack?: () => void;
}

export function AuthHeader({ onBack }: AuthHeaderProps) {
  return (
    <View className="flex-row items-center h-14 px-3">
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={authTheme.ink} />
        </Pressable>
      )}
    </View>
  );
}
