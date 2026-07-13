import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftPrimary } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { EditorialHeader } from './EditorialHeader';
import { EditorialProgress } from './EditorialProgress';

const logoText = require('../../../assets/images/logo-text.png');

/**
 * Shared onboarding step scaffold (SafeArea + KeyboardAvoiding + title +
 * scroll + CTA) with two visual treatments:
 *  - `editorial` (default, couple flow): EditorialHeader + gradient labelled
 *    progress, accent title, arrow CTA with soft shadow, optional skip.
 *  - `vendor`: centered logo header + plain progress bar, plain CTA.
 *
 * Note the progress convention differs by variant: the vendor bar treats
 * `currentStep` as 0-based (`(currentStep + 1) / totalSteps`) while the
 * editorial progress treats it as 1-based — each variant's consumers pass the
 * value they always have, so neither needs to change.
 */
type StepVariant = 'vendor' | 'editorial';

interface StepContainerProps {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  progressLabel?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showLogo?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  variant?: StepVariant;
}

export function StepContainer({
  title,
  titleAccent,
  subtitle,
  currentStep,
  totalSteps,
  progressLabel,
  children,
  onNext,
  onBack,
  nextLabel,
  nextDisabled = false,
  nextLoading = false,
  showLogo = true,
  showSkip = false,
  onSkip,
  variant = 'editorial',
}: StepContainerProps) {
  const { editorial } = useTheme();
  const isVendor = variant === 'vendor';
  const resolvedNextLabel = nextLabel ?? (isVendor ? 'Next' : 'Continue');
  const vendorProgress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {isVendor ? (
          <>
            {/* ─── Header: back + logo ─── */}
            <View className="flex-row items-center justify-center px-5 pt-2 pb-1 relative">
              {onBack && (
                <Pressable onPress={onBack} className="absolute left-4 top-2 p-1">
                  <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
                </Pressable>
              )}
              {showLogo && (
                <Image
                  source={logoText}
                  className="w-[120px] h-7"
                  resizeMode="contain"
                />
              )}
            </View>

            {/* ─── Progress bar ─── */}
            <View className="px-5 pt-3 pb-5">
              <View className="h-1 bg-ed-outline-variant rounded-sm overflow-hidden">
                <View
                  className="h-full rounded-sm bg-ed-primary-container"
                  style={{ width: `${vendorProgress}%` }}
                />
              </View>
            </View>

            {/* ─── Question ─── */}
            <View className="px-5">
              <Text className="font-playfair-bold text-[28px] uppercase text-ed-on-surface leading-[32px] mb-1.5">
                {title}
              </Text>
              {subtitle && (
                <Text className="font-work-sans text-sm text-ed-on-surface-variant leading-5 mb-4">
                  {subtitle}
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <EditorialHeader onBack={onBack} />

            <EditorialProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              label={progressLabel}
            />

            {/* Editorial Header — loud uppercase display type */}
            <View className="px-5 mb-4">
              <Text className="font-playfair-bold text-[30px] leading-[34px] uppercase text-ed-on-surface">
                {title}
                {titleAccent ? (
                  <Text className="text-ed-primary-container">{' '}{titleAccent}</Text>
                ) : null}
              </Text>
              {subtitle && (
                <Text className="font-work-sans text-base leading-6 text-ed-on-surface-variant mt-2 max-w-[320px]">
                  {subtitle}
                </Text>
              )}
            </View>
          </>
        )}

        {/* ─── Scrollable content ─── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* ─── CTA ─── */}
        <View className="px-5 pb-4 pt-2">
          {isVendor ? (
            <Pressable
              onPress={onNext}
              disabled={nextDisabled || nextLoading}
              className={`py-4 rounded-full items-center justify-center ${nextLoading ? 'opacity-70' : 'opacity-100'} ${
                nextDisabled ? 'bg-ed-surface-container-highest' : 'bg-ed-primary-container'
              }`}
            >
              <Text className={`font-space-grotesk-bold text-base ${nextDisabled ? 'text-ed-outline' : 'text-white'}`}>
                {nextLoading ? 'Please wait...' : resolvedNextLabel}
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onNext}
                disabled={nextDisabled || nextLoading}
                className={`py-[18px] rounded-full items-center justify-center flex-row gap-2 ${nextLoading ? 'opacity-70' : 'opacity-100'} ${
                  nextDisabled ? 'bg-ed-surface-container-highest' : 'bg-ed-primary-container'
                }`}
                style={nextDisabled ? undefined : shadowSoftPrimary}
              >
                <Text
                  className={`font-space-grotesk-bold text-lg ${nextDisabled ? 'text-ed-outline' : 'text-ed-on-primary'}`}
                >
                  {nextLoading ? 'Please wait...' : resolvedNextLabel}
                </Text>
                {!nextLoading && !nextDisabled && (
                  <Ionicons name="arrow-forward" size={20} color={editorial.onPrimary} />
                )}
              </Pressable>
              {showSkip && onSkip && (
                <Pressable onPress={onSkip} className="items-center mt-3">
                  <Text className="font-work-sans-bold text-xs tracking-[2px] uppercase text-ed-on-surface-variant">
                    Skip for now
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
