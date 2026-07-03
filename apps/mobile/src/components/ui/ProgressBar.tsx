import { View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color,
  className = '',
}: ProgressBarProps) {
  const { editorial } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      className={className}
      style={{
        height: 6,
        backgroundColor: editorial.surfaceContainerHigh,
        borderRadius: 3,
      }}
    >
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color || editorial.primaryContainer,
          width: `${clampedProgress}%`,
        }}
      />
    </View>
  );
}
