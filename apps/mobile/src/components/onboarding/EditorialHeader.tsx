import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface EditorialHeaderProps {
  onBack?: () => void;
  showMenu?: boolean;
}

export function EditorialHeader({ onBack, showMenu = false }: EditorialHeaderProps) {
  const { editorial } = useTheme();
  return (
    <View className="flex-row justify-between items-center px-3 h-14 bg-ed-bg">
      <View className="flex-row items-center">
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-11 h-11 items-center justify-center rounded-[22px]"
          >
            <Ionicons name="arrow-back" size={24} color={editorial.primaryContainer} />
          </Pressable>
        )}
      </View>
      {showMenu && (
        <Pressable
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={editorial.onSurface} />
        </Pressable>
      )}
    </View>
  );
}
