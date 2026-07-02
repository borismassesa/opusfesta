import { View, Text, TextInput, Pressable } from 'react-native';
import { useEffect, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  onResend?: () => Promise<void> | void;
  resendCooldownSeconds?: number;
}

export function OtpInput({ length = 6, onComplete, error, onResend, resendCooldownSeconds = 30 }: OtpInputProps) {
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    setCode(digits);
    if (digits.length === length) {
      onComplete(digits);
    }
  };

  const handleResend = async () => {
    if (!onResend || cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCooldown(resendCooldownSeconds);
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="items-center">
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View className="flex-row gap-2.5">
          {Array.from({ length }).map((_, i) => (
            <View
              key={i}
              className={`w-12 h-14 rounded-lg border items-center justify-center ${
                i < code.length ? 'border-of-light bg-white' : 'border-of-line bg-white'
              }`}
            >
              <Text className="font-work-sans-bold text-xl text-of-ink">{code[i] ?? ''}</Text>
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
        accessibilityLabel="Verification code"
        accessibilityValue={{ text: `${code.length} of ${length} digits entered` }}
        style={{ position: 'absolute', opacity: 0, height: 0 }}
      />
      {error && <Text className="text-xs text-of-danger mt-3">{error}</Text>}
      {onResend && (
        <Pressable
          onPress={handleResend}
          disabled={cooldown > 0 || resending}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code"
          accessibilityState={{ disabled: cooldown > 0 || resending }}
          className="mt-4"
        >
          <Text className={`font-work-sans-semibold text-sm ${cooldown > 0 ? 'text-of-placeholder' : 'text-of-accent'}`}>
            {cooldown > 0 ? `Resend code in 0:${cooldown.toString().padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
