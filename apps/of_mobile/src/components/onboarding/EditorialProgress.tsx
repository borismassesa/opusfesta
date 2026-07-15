import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';

interface EditorialProgressProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function EditorialProgress({ currentStep, totalSteps, label }: EditorialProgressProps) {
  const { editorial } = useTheme();
  const progress = (currentStep / totalSteps) * 100;
  const percentLabel = `${Math.round(progress)}% Complete`;

  return (
    <View className="px-5 mb-6">
      <View className="flex-row justify-between items-end mb-2">
        <Text className="font-space-grotesk-bold text-[11px] tracking-[2px] uppercase text-ed-on-surface-variant">
          Step {String(currentStep).padStart(2, '0')} of {String(totalSteps).padStart(2, '0')}
        </Text>
        <Text
          className={`font-space-grotesk-bold ${label ? 'text-xs text-ed-primary-container' : 'text-base text-ed-tertiary-container'}`}
        >
          {label || percentLabel}
        </Text>
      </View>
      <View className="h-2.5 bg-ed-surface-container-highest rounded-full overflow-hidden">
        <LinearGradient
          colors={[editorial.primaryContainer, editorial.surfaceTint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: `${progress}%`, borderRadius: 9999 }}
        />
      </View>
    </View>
  );
}
