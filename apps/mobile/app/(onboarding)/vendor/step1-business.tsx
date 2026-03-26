import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { Input } from '@/components/ui/Input';
import { CategoryGrid } from '@/components/onboarding/CategoryGrid';
import { useVendorOnboarding } from './_layout';
import { VENDOR_CATEGORY_OPTIONS } from '@/constants/onboarding';

export default function VendorStep1() {
  const router = useRouter();
  const { data, setStep1 } = useVendorOnboarding();

  const [businessName, setBusinessName] = useState(data.step1?.businessName ?? '');
  const [category, setCategory] = useState<string>(data.step1?.category ?? '');
  const [years, setYears] = useState(data.step1?.yearsInBusiness?.toString() ?? '');

  const canProceed = businessName.length >= 2 && category.length > 0;

  const handleNext = () => {
    setStep1({
      businessName,
      category,
      yearsInBusiness: years ? parseInt(years, 10) : undefined,
    });
    router.push('/(onboarding)/vendor/step2-details');
  };

  return (
    <StepContainer
      title="Your business"
      subtitle="Tell us about your wedding services"
      currentStep={0}
      totalSteps={4}
      onNext={handleNext}
      nextDisabled={!canProceed}
    >
      <View className="gap-5">
        <Input
          label="Business name"
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="e.g. Zanzibar Blooms"
          autoCapitalize="words"
        />

        <View>
          <Text className="font-dm-sans-bold text-sm text-of-text mb-3">Category</Text>
          <CategoryGrid
            categories={VENDOR_CATEGORY_OPTIONS}
            selected={category ? [category] : []}
            onToggle={(key) => setCategory(key)}
            singleSelect
          />
        </View>

        <Input
          label="Years in business (optional)"
          value={years}
          onChangeText={setYears}
          placeholder="e.g. 5"
          keyboardType="number-pad"
        />
      </View>
    </StepContainer>
  );
}
