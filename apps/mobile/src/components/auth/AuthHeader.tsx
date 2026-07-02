import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface AuthHeaderProps {
  onBack?: () => void;
}

export function AuthHeader({ onBack }: AuthHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 12 }}>
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={authTheme.ink} />
        </Pressable>
      )}
    </View>
  );
}
