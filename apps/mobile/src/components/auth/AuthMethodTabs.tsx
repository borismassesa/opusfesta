import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export type AuthMethod = 'email' | 'phone' | 'google';

const METHODS: { key: AuthMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'email', label: 'Email', icon: 'mail-outline' },
  { key: 'phone', label: 'Phone', icon: 'call-outline' },
  { key: 'google', label: 'Google', icon: 'logo-google' },
];

interface AuthMethodTabsProps {
  active: AuthMethod;
  onSelect: (method: AuthMethod) => void;
}

export function AuthMethodTabs({ active, onSelect }: AuthMethodTabsProps) {
  return (
    <View className="flex-row bg-of-pale rounded-button p-1 mb-6">
      {METHODS.map((m) => {
        const isActive = active === m.key;
        return (
          <Pressable
            key={m.key}
            onPress={() => onSelect(m.key)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-button ${
              isActive ? 'bg-white' : ''
            }`}
            style={isActive ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}
          >
            <Ionicons
              name={m.icon}
              size={16}
              color={isActive ? colors.primary : colors.muted}
              style={{ marginRight: 4 }}
            />
            <Text
              className={`text-xs ${
                isActive ? 'font-dm-sans-bold text-of-primary' : 'font-dm-sans text-of-muted'
              }`}
            >
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
