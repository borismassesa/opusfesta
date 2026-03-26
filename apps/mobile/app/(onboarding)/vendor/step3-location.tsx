import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { CitySelector } from '@/components/onboarding/CitySelector';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { Input } from '@/components/ui/Input';
import { useVendorOnboarding } from './_layout';
import type { CityKey } from '@/constants/onboarding';

export default function VendorStep3() {
  const router = useRouter();
  const { user } = useUser();
  const { data, setStep3 } = useVendorOnboarding();

  const [city, setCity] = useState<string>(data.step3?.city ?? '');
  const [address, setAddress] = useState(data.step3?.address ?? '');
  const [whatsapp, setWhatsapp] = useState(data.step3?.whatsappPhone ?? '');
  const [phone, setPhone] = useState(data.step3?.phone ?? '');
  const [email, setEmail] = useState(
    data.step3?.email ?? user?.primaryEmailAddress?.emailAddress ?? '',
  );
  const [instagram, setInstagram] = useState(data.step3?.instagram ?? '');

  const canProceed = city.length > 0 && whatsapp.length >= 9;

  const handleNext = () => {
    setStep3({
      city,
      address: address || undefined,
      whatsappPhone: whatsapp,
      phone: phone || undefined,
      email: email || undefined,
      instagram: instagram || undefined,
    });
    router.push('/(onboarding)/vendor/step4-portfolio');
  };

  return (
    <StepContainer
      title="Location & contact"
      subtitle="How can couples reach you?"
      currentStep={2}
      totalSteps={4}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!canProceed}
    >
      <View className="gap-5">
        <View>
          <Text className="font-dm-sans-bold text-sm text-of-text mb-3">City</Text>
          <CitySelector value={city} onSelect={(key: CityKey) => setCity(key)} />
        </View>

        <Input
          label="Address / area (optional)"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. Masaki, Dar es Salaam"
        />

        <PhoneInput
          label="WhatsApp number *"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        <PhoneInput
          label="Phone number (optional)"
          value={phone}
          onChangeText={setPhone}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="business@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Instagram (optional)"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="@yourbusiness"
          autoCapitalize="none"
        />
      </View>
    </StepContainer>
  );
}
