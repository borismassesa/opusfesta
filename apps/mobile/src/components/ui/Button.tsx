import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { brutalist, brutalistShadow, brutalistShadowPrimary } from '@/constants/theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantConfig: Record<ButtonVariant, { bg: string; text: string; border?: string; shadow: object }> = {
  primary: {
    bg: brutalist.primaryContainer,
    text: brutalist.onPrimary,
    shadow: brutalistShadowPrimary,
  },
  outline: {
    bg: 'transparent',
    text: brutalist.primaryContainer,
    border: brutalist.primaryContainer,
    shadow: {},
  },
  ghost: {
    bg: 'transparent',
    text: brutalist.primaryContainer,
    shadow: {},
  },
  danger: {
    bg: 'transparent',
    text: brutalist.error,
    border: brutalist.error,
    shadow: {},
  },
};

const sizeConfig: Record<ButtonSize, { py: number; px: number; fontSize: number }> = {
  sm: { py: 8, px: 16, fontSize: 14 },
  md: { py: 16, px: 28, fontSize: 16 },
  lg: { py: 20, px: 32, fontSize: 18 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const v = variantConfig[variant];
  const s = sizeConfig[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={className}
      style={[
        {
          backgroundColor: v.bg,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.5 : 1,
          ...(v.border ? { borderWidth: 2, borderColor: v.border } : {}),
        },
        disabled ? {} : v.shadow,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : brutalist.primaryContainer}
          size="small"
        />
      ) : (
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: s.fontSize,
            color: v.text,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
