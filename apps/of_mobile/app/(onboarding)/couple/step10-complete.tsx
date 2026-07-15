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
import { getErrorMessage } from '@/lib/errors';

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
  }, [spinAnim]);

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
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Something went wrong. Please try again.'));
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
    // Intentionally keyed on `attempt` only: this drives the one-shot setup
    // animation + submission. `submit` is redefined each render, and the anim
    // refs are stable, so re-running on anything but a retry would replay the
    // whole sequence and resubmit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (submitError) {
    return (
      <SafeAreaView className="flex-1 bg-ed-bg">
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-full max-w-[360px] rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-5"
            style={shadowSoft}
          >
            <Text className="font-space-grotesk-bold text-lg text-ed-error">
              Couldn't finish setting up your plan
            </Text>
            <Text className="font-work-sans text-sm mt-2 leading-5 text-ed-error">
              {submitError}
            </Text>
            <Pressable
              onPress={() => setAttempt((a) => a + 1)}
              className="mt-4 py-3.5 rounded-xl items-center bg-ed-primary-container"
              style={shadowSoft}
            >
              <Text className="font-space-grotesk-bold text-[15px] text-white">Try again</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} className="mt-3 items-center">
              <Text className="font-work-sans-bold text-[13px] text-ed-on-surface-variant">Go back</Text>
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
    <SafeAreaView className="flex-1 bg-ed-bg">
      {/* Decorative blurs */}
      <View className="absolute w-[200px] h-[200px] rounded-full bg-ed-tertiary-fixed" style={{ top: '-10%', left: '-10%', opacity: 0.2 }} />
      <View className="absolute w-[240px] h-[240px] rounded-full bg-ed-primary-fixed" style={{ bottom: '-10%', right: '-10%', opacity: 0.1 }} />

      <View className="flex-1 items-center justify-center px-6">
        {/* Spinning ring with icon */}
        <View className="w-40 h-40 items-center justify-center mb-8">
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
            className="w-[100px] h-[100px] rounded-full items-center justify-center bg-ed-surface-container-lowest"
            style={shadowSoft}
          >
            <Ionicons name="sparkles" size={48} color={editorial.onPrimaryContainer} />
          </View>
          {/* Floating accents */}
          <View className="absolute top-0 right-4 bg-ed-secondary-container p-2 rounded-[14px]" style={shadowSoft}>
            <Ionicons name="heart" size={16} color={editorial.onSecondaryContainer} />
          </View>
          <View className="absolute bottom-6 left-0 bg-ed-primary-fixed p-2 rounded-[14px]" style={shadowSoft}>
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
        <Text className="font-space-grotesk-bold text-[22px] tracking-[-0.6px] uppercase text-ed-on-surface text-center mb-2">
          Creating your wedding plan
        </Text>
        <Text className="font-work-sans-medium text-[15px] text-ed-on-surface-variant text-center max-w-[320px] mb-8">
          We're curating the finest East African vendors and experiences to match your unique vision.
        </Text>

        {/* Task Checklist */}
        <View className="w-full gap-2.5 px-4">
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
                    className={`w-7 h-7 rounded-[14px] items-center justify-center ${
                      isComplete ? 'bg-ed-primary-container' : 'bg-ed-surface-container-highest'
                    }`}
                  >
                    {isComplete && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </Animated.View>
                <View className="flex-1">
                  <Text className="font-space-grotesk-bold text-base text-ed-on-surface">
                    {task}
                  </Text>
                  {isActive && (
                    <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
                      Tailoring matches to your budget and style.
                    </Text>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Brand watermark */}
        <Text className="font-space-grotesk-bold text-base text-ed-on-surface mt-8" style={{ opacity: 0.2 }}>
          OpusFesta
        </Text>
      </View>
    </SafeAreaView>
  );
}
