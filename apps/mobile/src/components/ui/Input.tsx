import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { brutalist, brutalistShadow } from '@/constants/theme';

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
              color: brutalist.onSurfaceVariant,
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
              backgroundColor: brutalist.surfaceContainerLowest,
              borderRadius: 12,
            },
            error
              ? { borderWidth: 2, borderColor: brutalist.error }
              : brutalistShadow,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={brutalist.outlineVariant}
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 16,
              color: brutalist.onSurface,
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
              color: brutalist.error,
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
