import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface EditorialHeaderProps {
  onBack?: () => void;
  showMenu?: boolean;
}

export function EditorialHeader({ onBack, showMenu = false }: EditorialHeaderProps) {
  const { editorial } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 56,
        backgroundColor: editorial.bg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 22,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={editorial.primaryContainer} />
          </Pressable>
        )}
      </View>
      {showMenu && (
        <Pressable
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={editorial.onSurface} />
        </Pressable>
      )}
    </View>
  );
}
