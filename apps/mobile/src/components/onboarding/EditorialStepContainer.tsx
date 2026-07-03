import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftPrimary } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { EditorialHeader } from './EditorialHeader';
import { EditorialProgress } from './EditorialProgress';

interface EditorialStepContainerProps {
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

export function EditorialStepContainer({
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
}: EditorialStepContainerProps) {
  const { editorial } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <EditorialHeader onBack={onBack} />

        <EditorialProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          label={progressLabel}
        />

        {/* Editorial Header — loud uppercase display type */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay-Bold',
              fontSize: 30,
              lineHeight: 34,
              textTransform: 'uppercase',
              color: editorial.onSurface,
            }}
          >
            {title}
            {titleAccent ? (
              <Text style={{ color: editorial.primaryContainer }}>{' '}{titleAccent}</Text>
            ) : null}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 16,
                lineHeight: 24,
                color: editorial.onSurfaceVariant,
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
                backgroundColor: nextDisabled ? editorial.surfaceContainerHighest : editorial.primaryContainer,
                paddingVertical: 18,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: nextLoading ? 0.7 : 1,
              },
              nextDisabled ? {} : shadowSoftPrimary,
            ]}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 18,
                color: nextDisabled ? editorial.outline : editorial.onPrimary,
              }}
            >
              {nextLoading ? 'Please wait...' : nextLabel}
            </Text>
            {!nextLoading && !nextDisabled && (
              <Ionicons name="arrow-forward" size={20} color={editorial.onPrimary} />
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
                  color: editorial.onSurfaceVariant,
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
