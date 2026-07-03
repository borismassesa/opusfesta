import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { CoupleNames } from '@/components/ui/CoupleNames';
import { useCoupleOnboarding } from './_layout';

const SETUP_TASKS = [
  'Setting up your profile',
  'Finding local vendors',
  'Building your timeline',
  'Personalizing your experience...',
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function CompleteScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { data } = useCoupleOnboarding();
  const { editorial } = useTheme();

  const [completedTasks, setCompletedTasks] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef(SETUP_TASKS.map(() => new Animated.Value(0))).current;
  const checkAnims = useRef(SETUP_TASKS.map(() => new Animated.Value(0))).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const callOnboardingFunction = async (payload: Record<string, unknown>, attempt = 1): Promise<void> => {
    const token = await getToken({ template: 'supabase' });
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/complete-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: 'couple', profile: payload }),
    });
    if (response.status === 409 && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return callOnboardingFunction(payload, attempt + 1);
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete onboarding');
    }
  };

  const submit = async () => {
    setSubmitError(null);
    try {
      const partner1Name = [data.names?.partner1FirstName, data.names?.partner1LastName].filter(Boolean).join(' ');
      const partner2Name = [data.names?.partner2FirstName, data.names?.partner2LastName].filter(Boolean).join(' ') || null;

      const payload = {
        partner1_name: partner1Name,
        partner2_name: partner2Name,
        wedding_date: data.date?.dateOption === 'not_sure' ? null : data.date?.weddingDate,
        date_undecided: data.date?.dateOption === 'not_sure',
        budget_range: null,
        guest_count: data.guests?.guestCount ?? null,
        city: data.location?.city ?? null,
        region: null,
        planning_stage: data.planningStage?.stage ?? null,
        preferred_categories: data.vendorNeeds?.vendorNeeds ?? [],
        preferred_styles: data.venueSetting?.venueSettings ?? [],
        preferred_designs: data.designStyle?.designStyles ?? [],
        whatsapp_phone: null,
        avatar_url: null,
      };

      await callOnboardingFunction(payload);

      await user?.update({
        unsafeMetadata: {
          ...(user?.unsafeMetadata ?? {}),
          onboardingComplete: true,
          userType: 'couple',
        },
      });
      await user?.reload();
      router.replace('/');
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    const taskDelay = 900;

    // Animate tasks
    SETUP_TASKS.forEach((_, index) => {
      setTimeout(() => {
        Animated.timing(fadeAnims[index], { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }, index * taskDelay + 200);

      setTimeout(() => {
        Animated.timing(checkAnims[index], {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }).start();
        setCompletedTasks(index + 1);
      }, index * taskDelay + 600);
    });

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SETUP_TASKS.length * taskDelay + 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Submit data and navigate
    const timeout = setTimeout(submit, SETUP_TASKS.length * taskDelay + 1200);

    return () => clearTimeout(timeout);
  }, [attempt]);

  if (submitError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View
            style={[
              {
                width: '100%',
                maxWidth: 360,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                padding: 20,
              },
              shadowSoft,
            ]}
          >
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.error }}>
              Couldn't finish setting up your plan
            </Text>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.error, marginTop: 8, lineHeight: 20 }}>
              {submitError}
            </Text>
            <Pressable
              onPress={() => setAttempt((a) => a + 1)}
              style={[
                { marginTop: 16, backgroundColor: editorial.primaryContainer, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
                shadowSoft,
              ]}
            >
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#fff' }}>Try again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurfaceVariant }}>Go back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      {/* Decorative blurs */}
      <View style={{ position: 'absolute', top: '-10%', left: '-10%', width: 200, height: 200, borderRadius: 100, backgroundColor: editorial.tertiaryFixed, opacity: 0.2 }} />
      <View style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 240, height: 240, borderRadius: 120, backgroundColor: editorial.primaryFixed, opacity: 0.1 }} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Spinning ring with icon */}
        <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Animated.View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 3,
              borderStyle: 'dashed',
              borderColor: 'rgba(66,20,104,0.2)',
              transform: [{ rotate: spinRotation }],
            }}
          />
          <View
            style={[
              {
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: editorial.surfaceContainerLowest,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadowSoft,
            ]}
          >
            <Ionicons name="sparkles" size={48} color={editorial.onPrimaryContainer} />
          </View>
          {/* Floating accents */}
          <View style={[{ position: 'absolute', top: 0, right: 16, backgroundColor: editorial.secondaryContainer, padding: 8, borderRadius: 14 }, shadowSoft]}>
            <Ionicons name="heart" size={16} color={editorial.onSecondaryContainer} />
          </View>
          <View style={[{ position: 'absolute', bottom: 24, left: 0, backgroundColor: editorial.primaryFixed, padding: 8, borderRadius: 14 }, shadowSoft]}>
            <Ionicons name="sparkles-outline" size={16} color={editorial.primaryContainer} />
          </View>
        </View>

        {/* Couple names — the romantic signature moment */}
        <CoupleNames
          partner1={data.names?.partner1FirstName}
          partner2={data.names?.partner2FirstName}
          size="lg"
          style={{ marginBottom: 4 }}
        />

        {/* Header */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 22,
            letterSpacing: -0.6,
            textTransform: 'uppercase',
            color: editorial.onSurface,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Creating your wedding plan
        </Text>
        <Text
          style={{
            fontFamily: 'WorkSans-Medium',
            fontSize: 15,
            color: editorial.onSurfaceVariant,
            textAlign: 'center',
            maxWidth: 320,
            marginBottom: 32,
          }}
        >
          We're curating the finest East African vendors and experiences to match your unique vision.
        </Text>

        {/* Task Checklist */}
        <View style={{ width: '100%', gap: 10, paddingHorizontal: 16 }}>
          {SETUP_TASKS.map((task, index) => {
            const isComplete = completedTasks > index;
            const isActive = completedTasks === index;
            return (
              <Animated.View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  padding: 14,
                  backgroundColor: isActive ? editorial.secondaryContainer : editorial.surfaceContainerLow,
                  borderRadius: 12,
                  opacity: fadeAnims[index],
                }}
              >
                <Animated.View style={{ transform: [{ scale: checkAnims[index] }] }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isComplete ? editorial.primaryContainer : editorial.surfaceContainerHighest,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isComplete && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </Animated.View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk-Bold',
                      fontSize: 16,
                      color: editorial.onSurface,
                    }}
                  >
                    {task}
                  </Text>
                  {isActive && (
                    <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                      Tailoring matches to your budget and style.
                    </Text>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Brand watermark */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 16,
            color: editorial.onSurface,
            opacity: 0.2,
            marginTop: 32,
          }}
        >
          OpusFesta
        </Text>
      </View>
    </SafeAreaView>
  );
}
