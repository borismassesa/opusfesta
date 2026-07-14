import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName = '', ...props }, ref) => {
    const { editorial } = useTheme();
    return (
      <View className={containerClassName}>
        {label && (
          <Text className="font-work-sans-bold text-[11px] tracking-[2px] uppercase text-ed-on-surface-variant mb-1.5 ml-0.5">
            {label}
          </Text>
        )}
        <View
          className={`bg-ed-surface-container-lowest rounded-[14px] border ${error ? 'border-[1.5px] border-ed-error' : 'border-ed-outline-variant'}`}
          style={error ? undefined : shadowSoftSm}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={editorial.outlineVariant}
            className="font-work-sans text-base text-ed-on-surface px-4 py-3.5"
            {...props}
          />
        </View>
        {error && (
          <Text className="font-work-sans text-xs text-ed-error mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
