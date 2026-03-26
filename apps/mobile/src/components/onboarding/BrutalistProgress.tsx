import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brutalist } from '@/constants/theme';

interface BrutalistProgressProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function BrutalistProgress({ currentStep, totalSteps, label }: BrutalistProgressProps) {
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
            color: brutalist.onSurfaceVariant,
          }}
        >
          Step {String(currentStep).padStart(2, '0')} of {String(totalSteps).padStart(2, '0')}
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: label ? 12 : 16,
            color: label ? brutalist.primaryContainer : brutalist.tertiaryContainer,
          }}
        >
          {label || percentLabel}
        </Text>
      </View>
      <View
        style={{
          height: 10,
          backgroundColor: brutalist.surfaceContainerHighest,
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[brutalist.primaryContainer, brutalist.surfaceTint]}
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
