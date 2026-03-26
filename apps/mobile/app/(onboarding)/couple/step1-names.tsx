import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow } from '@/constants/theme';
import { useCoupleOnboarding } from './_layout';

function BrutalistField({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: brutalist.onSurfaceVariant, marginLeft: 2 }}>
        {label}
      </Text>
      <View style={[{ backgroundColor: '#fff', borderRadius: 12 }, brutalistShadow]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brutalist.outlineVariant}
          autoCapitalize="words"
          style={{ fontFamily: 'WorkSans-Medium', fontSize: 16, color: brutalist.onSurface, paddingHorizontal: 16, paddingVertical: 14 }}
        />
      </View>
    </View>
  );
}

export default function CoupleStep1() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, setNames } = useCoupleOnboarding();

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
    <BrutalistStepContainer
      title="Let's start with your names"
      subtitle="We'll use these to personalize your wedding planning dashboard and invitations."
      currentStep={1}
      totalSteps={9}
      progressLabel="Getting Started"
      onBack={() => signOut()}
      onNext={handleNext}
      nextDisabled={!canProceed}
    >
      <View style={{ gap: 24, marginTop: 8 }}>
        {/* About You */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="person" size={20} color={brutalist.tertiaryContainer} />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, color: brutalist.onSurface }}>
              About You
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <BrutalistField label="Your first name" value={firstName} onChangeText={setFirstName} placeholder="e.g. Amara" />
            </View>
            <View style={{ flex: 1 }}>
              <BrutalistField label="Your last name" value={lastName} onChangeText={setLastName} placeholder="e.g. Mbeki" />
            </View>
          </View>
        </View>

        {/* Infinity symbol */}
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: brutalist.tertiaryFixed, alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
            <Ionicons name="infinite" size={40} color={brutalist.tertiaryContainer} />
          </View>
        </View>

        {/* Your Partner */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="heart" size={20} color={brutalist.secondary} />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, color: brutalist.onSurface }}>
              Your Partner
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <BrutalistField label="Partner's first name" value={partnerFirst} onChangeText={setPartnerFirst} placeholder="e.g. Kwame" />
            </View>
            <View style={{ flex: 1 }}>
              <BrutalistField label="Partner's last name" value={partnerLast} onChangeText={setPartnerLast} placeholder="e.g. Osei" />
            </View>
          </View>
        </View>

        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, fontStyle: 'italic', color: 'rgba(75,68,79,0.7)', marginTop: 8 }}>
          Don't worry, you can change these later in your profile settings.
        </Text>
      </View>
    </BrutalistStepContainer>
  );
}
