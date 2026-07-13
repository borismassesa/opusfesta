import { useState, forwardRef } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authTheme } from '@/constants/theme';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  error?: string;
  hint?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  accessibilityLabel?: string;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoComplete,
    error,
    hint,
    rightLabel,
    onRightPress,
    accessibilityLabel,
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderClass = error
    ? 'border-[1.5px] border-of-danger'
    : focused
      ? 'border-[1.5px] border-of-light'
      : 'border border-of-line';

  return (
    <View className="gap-1.5">
      <View className="flex-row justify-between items-center">
        <Text className="font-work-sans-semibold text-[13px] text-of-ink">{label}</Text>
        {rightLabel && (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="font-work-sans-semibold text-[13px] text-of-accent">
              {rightLabel}
            </Text>
          </Pressable>
        )}
      </View>
      <View className={`flex-row items-center bg-of-white rounded-lg ${borderClass}`}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={authTheme.placeholder}
          secureTextEntry={secureTextEntry && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
          className="flex-1 font-work-sans text-base text-of-ink px-4 py-3.5"
          {...(secureTextEntry ? { textContentType: 'password' } : {})}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="px-3.5 h-11 items-center justify-center"
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={authTheme.textSecondary} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="font-work-sans text-xs text-of-danger">{error}</Text>
      ) : hint ? (
        <Text className="font-work-sans text-xs text-of-muted">{hint}</Text>
      ) : null}
    </View>
  );
});
