import { View } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View className="flex-row gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i < currentStep ? 'bg-of-primary' : i === currentStep ? 'bg-of-medium' : 'bg-of-border'
          }`}
        />
      ))}
    </View>
  );
}
