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
    <View className={`${className} h-1.5 rounded-[3px] bg-ed-surface-container-high`}>
      <View
        className="h-1.5 rounded-[3px]"
        style={{ backgroundColor: color || editorial.primaryContainer, width: `${clampedProgress}%` }}
      />
    </View>
  );
}
