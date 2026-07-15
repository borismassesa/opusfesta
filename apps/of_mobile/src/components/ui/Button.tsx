import { Pressable, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';

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

// Static per-size padding/text classes (fixed scale, not runtime values).
const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'py-2 px-4', text: 'text-sm' },
  md: { container: 'py-4 px-7', text: 'text-base' },
  lg: { container: 'py-5 px-8', text: 'text-lg' },
};

// Editorial Romance buttons: pill-shaped, flat fill, no shadow — the shared
// OF web system (opus_website hero CTA is a flat lavender pill, color transition only).
const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-ed-primary-container', text: 'text-ed-on-primary' },
  outline: { container: 'bg-transparent border-[1.5px] border-ed-primary-container', text: 'text-ed-primary-container' },
  ghost: { container: 'bg-transparent', text: 'text-ed-primary-container' },
  danger: { container: 'bg-transparent border-[1.5px] border-ed-error', text: 'text-ed-error' },
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
  const { editorial } = useTheme();
  const v = variantClasses[variant];
  const s = sizeClasses[size];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${className} ${v.container} ${s.container} rounded-full items-center justify-center flex-row ${disabled ? 'opacity-50' : 'opacity-100'}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : editorial.primaryContainer}
          size="small"
        />
      ) : (
        <Text className={`font-space-grotesk-bold tracking-[0.5px] ${v.text} ${s.text}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
