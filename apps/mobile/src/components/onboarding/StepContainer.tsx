import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, brutalist } from '@/constants/theme';

const logoText = require('../../../assets/images/logo-text.png');

interface StepContainerProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showLogo?: boolean;
}

export function StepContainer({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  nextDisabled = false,
  nextLoading = false,
  showLogo = true,
}: StepContainerProps) {
  const router = useRouter();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ─── Header: back + logo ─── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, position: 'relative' }}>
          {onBack && (
            <Pressable
              onPress={onBack}
              style={{ position: 'absolute', left: 16, top: 8, padding: 4 }}
            >
              <Ionicons name="chevron-back" size={24} color={brutalist.onSurface} />
            </Pressable>
          )}
          {showLogo && (
            <Image
              source={logoText}
              style={{ width: 120, height: 28 }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* ─── Progress bar ─── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}>
          <View style={{ height: 4, backgroundColor: brutalist.outlineVariant, borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: brutalist.primaryContainer,
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* ─── Question ─── */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: brutalist.onSurface, lineHeight: 32, marginBottom: 6 }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant, lineHeight: 20, marginBottom: 16 }}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* ─── Content ─── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* ─── Next button (full-width, pinned to bottom) ─── */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
          <Pressable
            onPress={onNext}
            disabled={nextDisabled || nextLoading}
            style={{
              backgroundColor: nextDisabled ? brutalist.surfaceContainerHighest : brutalist.primaryContainer,
              paddingVertical: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: nextDisabled ? brutalist.outlineVariant : brutalist.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: nextLoading ? 0.7 : 1,
            }}
          >
            <Text style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 16,
              color: nextDisabled ? brutalist.outline : '#fff',
            }}>
              {nextLoading ? 'Please wait...' : nextLabel}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
