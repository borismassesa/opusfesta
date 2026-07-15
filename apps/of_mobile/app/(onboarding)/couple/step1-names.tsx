import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { CoupleNames } from '@/components/ui/CoupleNames';
import { useCoupleOnboarding } from './_layout';

function EditorialField({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string;
}) {
  const { editorial } = useTheme();
  return (
    <View className="gap-1.5">
      <Text className="font-work-sans-bold text-[10px] tracking-[2px] uppercase text-ed-on-surface-variant ml-0.5">
        {label}
      </Text>
      <View className="bg-ed-surface-container-lowest rounded-[14px] border border-ed-outline-variant" style={shadowSoftSm}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={editorial.outlineVariant}
          autoCapitalize="words"
          className="font-work-sans-medium text-base text-ed-on-surface px-4 py-3.5"
        />
      </View>
    </View>
  );
}

export default function CoupleStep1() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, setNames } = useCoupleOnboarding();
  const { editorial } = useTheme();

  const [firstName, setFirstName] = useState(data.names?.partner1FirstName ?? '');
  const [lastName, setLastName] = useState(data.names?.partner1LastName ?? '');
  const [partnerFirst, setPartnerFirst] = useState(data.names?.partner2FirstName ?? '');
  const [partnerLast, setPartnerLast] = useState(data.names?.partner2LastName ?? '');

  const canProceed = firstName.trim().length >= 2;

  const handleNext = () => {
    setNames({
      partner1FirstName: firstName.trim(),
      partner1LastName: lastName.trim(),
      partner2FirstName: partnerFirst.trim(),
      partner2LastName: partnerLast.trim(),
    });
    router.push('/(onboarding)/couple/step1b-congrats');
  };

  return (
    <StepContainer
      title="Let's start with your names"
      subtitle="We'll use these to personalize your wedding planning dashboard and invitations."
      currentStep={1}
      totalSteps={8}
      progressLabel="Getting Started"
      onBack={() => signOut()}
      onNext={handleNext}
      nextDisabled={!canProceed}
    >
      <View className="gap-6 mt-2">
        {/* About You */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person" size={20} color={editorial.tertiaryContainer} />
            <Text className="font-space-grotesk-bold text-lg uppercase tracking-[1px] text-ed-on-surface">
              About You
            </Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <EditorialField label="Your first name" value={firstName} onChangeText={setFirstName} placeholder="e.g. Amara" />
            </View>
            <View className="flex-1">
              <EditorialField label="Your last name" value={lastName} onChangeText={setLastName} placeholder="e.g. Mbeki" />
            </View>
          </View>
        </View>

        {/* Live romantic preview — the couple's names in script as they type */}
        <View className="items-center py-1 min-h-[64px] justify-center">
          {firstName.trim() || partnerFirst.trim() ? (
            <CoupleNames partner1={firstName} partner2={partnerFirst} size="md" />
          ) : (
            <View className="w-[72px] h-[72px] rounded-full items-center justify-center bg-ed-tertiary-fixed opacity-70">
              <Ionicons name="infinite" size={40} color={editorial.tertiaryContainer} />
            </View>
          )}
        </View>

        {/* Your Partner */}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="heart" size={20} color={editorial.secondary} />
            <Text className="font-space-grotesk-bold text-lg uppercase tracking-[1px] text-ed-on-surface">
              Your Partner
            </Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <EditorialField label="Partner's first name" value={partnerFirst} onChangeText={setPartnerFirst} placeholder="e.g. Kwame" />
            </View>
            <View className="flex-1">
              <EditorialField label="Partner's last name" value={partnerLast} onChangeText={setPartnerLast} placeholder="e.g. Osei" />
            </View>
          </View>
        </View>

        <Text className="font-work-sans text-xs italic text-ed-on-surface-variant mt-2">
          Don't worry, you can change these later in your profile settings.
        </Text>
      </View>
    </StepContainer>
  );
}
