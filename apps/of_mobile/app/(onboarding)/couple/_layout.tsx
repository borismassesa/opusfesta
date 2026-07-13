import { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';

interface CoupleNamesData {
  partner1FirstName: string;
  partner1LastName: string;
  partner2FirstName: string;
  partner2LastName: string;
}

interface CouplePlanningStageData {
  stage: string;
}

interface CoupleDateData {
  weddingDate: string | null;
  dateOption: 'exact' | 'month_year' | 'not_sure';
}

interface CoupleLocationData {
  city: string;
}

interface CoupleGuestsData {
  guestCountKey: string;
  guestCount: number | null;
}

interface CoupleVenueSettingData {
  venueSettings: string[];
}

interface CoupleDesignStyleData {
  designStyles: string[];
}

interface CoupleVendorNeedsData {
  vendorNeeds: string[];
}

interface CoupleOnboardingState {
  names: CoupleNamesData | null;
  planningStage: CouplePlanningStageData | null;
  date: CoupleDateData | null;
  location: CoupleLocationData | null;
  guests: CoupleGuestsData | null;
  venueSetting: CoupleVenueSettingData | null;
  designStyle: CoupleDesignStyleData | null;
  vendorNeeds: CoupleVendorNeedsData | null;
}

interface CoupleOnboardingContextValue {
  data: CoupleOnboardingState;
  setNames: (d: CoupleNamesData) => void;
  setPlanningStage: (d: CouplePlanningStageData) => void;
  setDate: (d: CoupleDateData) => void;
  setLocation: (d: CoupleLocationData) => void;
  setGuests: (d: CoupleGuestsData) => void;
  setVenueSetting: (d: CoupleVenueSettingData) => void;
  setDesignStyle: (d: CoupleDesignStyleData) => void;
  setVendorNeeds: (d: CoupleVendorNeedsData) => void;
}

const CoupleOnboardingContext = createContext<CoupleOnboardingContextValue | null>(null);

export function useCoupleOnboarding() {
  const ctx = useContext(CoupleOnboardingContext);
  if (!ctx) throw new Error('useCoupleOnboarding must be used within couple onboarding layout');
  return ctx;
}

export default function CoupleOnboardingLayout() {
  const [data, setData] = useState<CoupleOnboardingState>({
    names: null,
    planningStage: null,
    date: null,
    location: null,
    guests: null,
    venueSetting: null,
    designStyle: null,
    vendorNeeds: null,
  });

  const value: CoupleOnboardingContextValue = {
    data,
    setNames: (d) => setData((prev) => ({ ...prev, names: d })),
    setPlanningStage: (d) => setData((prev) => ({ ...prev, planningStage: d })),
    setDate: (d) => setData((prev) => ({ ...prev, date: d })),
    setLocation: (d) => setData((prev) => ({ ...prev, location: d })),
    setGuests: (d) => setData((prev) => ({ ...prev, guests: d })),
    setVenueSetting: (d) => setData((prev) => ({ ...prev, venueSetting: d })),
    setDesignStyle: (d) => setData((prev) => ({ ...prev, designStyle: d })),
    setVendorNeeds: (d) => setData((prev) => ({ ...prev, vendorNeeds: d })),
  };

  return (
    <CoupleOnboardingContext.Provider value={value}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      />
    </CoupleOnboardingContext.Provider>
  );
}
