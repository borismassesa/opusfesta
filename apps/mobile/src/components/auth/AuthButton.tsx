import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { authTheme } from '@/constants/theme';

type AuthButtonVariant = 'primary' | 'outline';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AuthButtonVariant;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  accessibilityLabel,
  style,
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`rounded-lg py-3.5 px-5 flex-row items-center justify-center gap-2 ${isDisabled ? 'opacity-50' : 'opacity-100'} ${
        isPrimary ? 'bg-of-ink border-0' : 'bg-of-white border border-of-line'
      }`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? authTheme.bg : authTheme.ink} size="small" />
      ) : (
        <>
          {icon}
          <Text className={`font-work-sans-semibold text-base ${isPrimary ? 'text-of-white' : 'text-of-ink'}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
