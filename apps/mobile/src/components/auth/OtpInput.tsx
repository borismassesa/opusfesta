import { View, Text, TextInput, Pressable } from 'react-native';
import { useRef, useState } from 'react';
import { colors } from '@/constants/theme';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, onComplete, error }: OtpInputProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    setCode(digits);
    if (digits.length === length) {
      onComplete(digits);
    }
  };

  return (
    <View className="items-center">
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View className="flex-row gap-2.5">
          {Array.from({ length }).map((_, i) => (
            <View
              key={i}
              className={`w-12 h-14 rounded-input border items-center justify-center ${
                i < code.length ? 'border-of-primary bg-of-pale' : 'border-of-border bg-white'
              }`}
            >
              <Text className="font-dm-sans-bold text-xl text-of-text">
                {code[i] ?? ''}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        autoFocus
        maxLength={length}
        style={{ position: 'absolute', opacity: 0, height: 0 }}
      />
      {error && <Text className="text-xs text-of-coral mt-3">{error}</Text>}
    </View>
  );
}
