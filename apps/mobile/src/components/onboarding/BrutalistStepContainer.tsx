import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { brutalist, brutalistShadowPrimary } from '@/constants/theme';
import { BrutalistHeader } from './BrutalistHeader';
import { BrutalistProgress } from './BrutalistProgress';

interface BrutalistStepContainerProps {
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
  showSkip?: boolean;
  onSkip?: () => void;
}

export function BrutalistStepContainer({
  title,
  titleAccent,
  subtitle,
  currentStep,
  totalSteps,
  progressLabel,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  nextLoading = false,
  showSkip = false,
  onSkip,
}: BrutalistStepContainerProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <BrutalistHeader onBack={onBack} />

        <BrutalistProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          label={progressLabel}
        />

        {/* Editorial Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: -0.5,
              color: brutalist.onSurface,
            }}
          >
            {title}
            {titleAccent ? (
              <Text style={{ color: brutalist.onPrimaryContainer }}>{' '}{titleAccent}</Text>
            ) : null}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 16,
                lineHeight: 24,
                color: brutalist.onSurfaceVariant,
                marginTop: 8,
                maxWidth: 320,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* CTA Area */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
          <Pressable
            onPress={onNext}
            disabled={nextDisabled || nextLoading}
            style={[
              {
                backgroundColor: nextDisabled ? brutalist.surfaceContainerHighest : brutalist.primaryContainer,
                paddingVertical: 18,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: nextLoading ? 0.7 : 1,
              },
              nextDisabled ? {} : brutalistShadowPrimary,
            ]}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 18,
                color: nextDisabled ? brutalist.outline : brutalist.onPrimary,
              }}
            >
              {nextLoading ? 'Please wait...' : nextLabel}
            </Text>
            {!nextLoading && !nextDisabled && (
              <Ionicons name="arrow-forward" size={20} color={brutalist.onPrimary} />
            )}
          </Pressable>
          {showSkip && onSkip && (
            <Pressable onPress={onSkip} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text
                style={{
                  fontFamily: 'WorkSans-Bold',
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: brutalist.onSurfaceVariant,
                }}
              >
                Skip for now
              </Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
