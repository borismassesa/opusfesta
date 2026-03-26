import { View, Text, TextInput } from 'react-native';
import { colors } from '@/constants/theme';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
}

export function PhoneInput({ value, onChangeText, label = 'Phone number', error }: PhoneInputProps) {
  return (
    <View className="mb-4">
      <Text className="font-dm-sans-medium text-sm text-of-text mb-1.5">{label}</Text>
      <View className="flex-row items-center bg-white border border-of-border rounded-input overflow-hidden">
        <View className="bg-of-pale px-3 py-3.5 border-r border-of-border">
          <Text className="font-dm-sans-medium text-sm text-of-text">+255</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={(text) => {
            // Only allow digits
            const digits = text.replace(/\D/g, '');
            onChangeText(digits);
          }}
          placeholder="712 345 678"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          maxLength={9}
          className="flex-1 px-3 py-3.5 font-dm-sans text-sm text-of-text"
        />
      </View>
      {error && <Text className="text-xs text-of-coral mt-1">{error}</Text>}
    </View>
  );
}
