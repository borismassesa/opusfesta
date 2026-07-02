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

  const borderColor = error ? authTheme.danger : focused ? authTheme.borderFocus : authTheme.border;

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'WorkSans-SemiBold', fontSize: 13, color: authTheme.ink }}>{label}</Text>
        {rightLabel && (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontFamily: 'WorkSans-SemiBold', fontSize: 13, color: authTheme.accent }}>
              {rightLabel}
            </Text>
          </Pressable>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: authTheme.bg,
          borderRadius: authTheme.radius,
          borderWidth: focused || error ? 1.5 : 1,
          borderColor,
        }}
      >
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
          style={{
            flex: 1,
            fontFamily: 'WorkSans-Regular',
            fontSize: 16,
            color: authTheme.ink,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
          {...(secureTextEntry ? { textContentType: 'password' } : {})}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ paddingHorizontal: 14, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={authTheme.textSecondary} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: authTheme.danger }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: authTheme.textSecondary }}>{hint}</Text>
      ) : null}
    </View>
  );
});
