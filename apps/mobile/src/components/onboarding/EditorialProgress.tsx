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
    <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 11,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: editorial.onSurfaceVariant,
          }}
        >
          Step {String(currentStep).padStart(2, '0')} of {String(totalSteps).padStart(2, '0')}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: label ? 12 : 16,
            color: label ? editorial.primaryContainer : editorial.tertiaryContainer,
          }}
        >
          {label || percentLabel}
        </Text>
      </View>
      <View
        style={{
          height: 10,
          backgroundColor: editorial.surfaceContainerHighest,
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[editorial.primaryContainer, editorial.surfaceTint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 5,
          }}
        />
      </View>
    </View>
  );
}
