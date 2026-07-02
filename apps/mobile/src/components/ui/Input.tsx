import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { editorial, shadowSoftSm } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName = '', ...props }, ref) => {
    return (
      <View className={containerClassName}>
        {label && (
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: editorial.onSurfaceVariant,
              marginBottom: 6,
              marginLeft: 2,
            }}
          >
            {label}
          </Text>
        )}
        <View
          style={[
            {
              backgroundColor: editorial.surfaceContainerLowest,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: editorial.outlineVariant,
            },
            error
              ? { borderWidth: 1.5, borderColor: editorial.error }
              : shadowSoftSm,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={editorial.outlineVariant}
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 16,
              color: editorial.onSurface,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
            {...props}
          />
        </View>
        {error && (
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 12,
              color: editorial.error,
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
