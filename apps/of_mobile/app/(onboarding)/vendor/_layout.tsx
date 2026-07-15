import { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';
import type {
  VendorStep1Data,
  VendorStep2Data,
  VendorStep3Data,
  VendorStep4Data,
} from '@/schemas/onboarding';

interface VendorOnboardingState {
  step1: VendorStep1Data | null;
  step2: VendorStep2Data | null;
  step3: VendorStep3Data | null;
  step4: VendorStep4Data | null;
}

interface VendorOnboardingContextValue {
  data: VendorOnboardingState;
  setStep1: (d: VendorStep1Data) => void;
  setStep2: (d: VendorStep2Data) => void;
  setStep3: (d: VendorStep3Data) => void;
  setStep4: (d: VendorStep4Data) => void;
}

const VendorOnboardingContext = createContext<VendorOnboardingContextValue | null>(null);

export function useVendorOnboarding() {
  const ctx = useContext(VendorOnboardingContext);
  if (!ctx) throw new Error('useVendorOnboarding must be used within vendor onboarding layout');
  return ctx;
}

export default function VendorOnboardingLayout() {
  const [data, setData] = useState<VendorOnboardingState>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
  });

  const value: VendorOnboardingContextValue = {
    data,
    setStep1: (d) => setData((prev) => ({ ...prev, step1: d })),
    setStep2: (d) => setData((prev) => ({ ...prev, step2: d })),
    setStep3: (d) => setData((prev) => ({ ...prev, step3: d })),
    setStep4: (d) => setData((prev) => ({ ...prev, step4: d })),
  };

  return (
    <VendorOnboardingContext.Provider value={value}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      />
    </VendorOnboardingContext.Provider>
  );
}
