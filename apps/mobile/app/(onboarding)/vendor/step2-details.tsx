import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { useVendorOnboarding } from './_layout';
import { PRICE_RANGE_OPTIONS } from '@/constants/onboarding';
import { colors } from '@/constants/theme';

export default function VendorStep2() {
  const router = useRouter();
  const { data, setStep2 } = useVendorOnboarding();

  const [description, setDescription] = useState(data.step2?.description ?? '');
  const [priceRange, setPriceRange] = useState<string>(data.step2?.priceRange ?? '');

  const canProceed = description.length >= 50 && priceRange.length > 0;

  const handleNext = () => {
    setStep2({
      description,
      priceRange: priceRange as '$' | '$$' | '$$$' | '$$$$',
    });
    router.push('/(onboarding)/vendor/step3-location');
  };

  return (
    <StepContainer
      title="Service details"
      subtitle="Help couples understand what you offer"
      currentStep={1}
      totalSteps={4}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!canProceed}
    >
      <View className="gap-5">
        <View>
          <Text className="font-dm-sans-bold text-sm text-of-text mb-1.5">
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your services, specialties, and what makes you unique..."
            placeholderTextColor={`${colors.muted}80`}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="bg-white border border-of-border rounded-input px-4 py-3.5 text-sm font-dm-sans text-of-text min-h-[120px]"
          />
          <Text
            className={`text-xs mt-1 ${
              description.length >= 50 ? 'text-of-green' : 'text-of-muted'
            }`}
          >
            {description.length}/50 minimum characters
          </Text>
        </View>

        <View>
          <Text className="font-dm-sans-bold text-sm text-of-text mb-3">Price range</Text>
          <View className="gap-2.5">
            {PRICE_RANGE_OPTIONS.map((option) => {
              const isSelected = priceRange === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setPriceRange(option.key)}
                  className={`py-3.5 px-4 rounded-button border flex-row justify-between items-center ${
                    isSelected
                      ? 'bg-of-pale border-of-primary'
                      : 'bg-white border-of-border'
                  }`}
                >
                  <View>
                    <Text
                      className={`font-dm-sans-medium text-sm ${
                        isSelected ? 'text-of-primary' : 'text-of-text'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-xs text-of-muted">{option.description}</Text>
                  </View>
                  <Text
                    className={`font-dm-sans-bold text-lg ${
                      isSelected ? 'text-of-primary' : 'text-of-muted'
                    }`}
                  >
                    {option.key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </StepContainer>
  );
}
