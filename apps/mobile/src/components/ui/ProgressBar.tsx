import { View } from 'react-native';
import { brutalist } from '@/constants/theme';

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
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      className={className}
      style={{
        height: 6,
        backgroundColor: brutalist.surfaceContainerHigh,
        borderRadius: 3,
      }}
    >
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color || brutalist.primaryContainer,
          width: `${clampedProgress}%`,
        }}
      />
    </View>
  );
}
