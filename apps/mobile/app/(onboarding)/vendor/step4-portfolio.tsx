import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { PhotoUploader } from '@/components/onboarding/PhotoUploader';
import { useVendorOnboarding } from './_layout';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function VendorStep4() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { data, setStep4 } = useVendorOnboarding();

  const [photos, setPhotos] = useState<string[]>(data.step4?.portfolioUris ?? []);
  const [loading, setLoading] = useState(false);

  const canProceed = photos.length >= 1;

  const uploadPortfolioPhotos = async (uris: string[]): Promise<string[]> => {
    const token = await getToken({ template: 'supabase' });
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || !token) return [];

    const uploaded: string[] = [];

    for (const uri of uris) {
      try {
        const filename = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const blob = await fetch(uri).then((r) => r.blob());

        const res = await fetch(
          `${supabaseUrl}/storage/v1/object/vendor-portfolios/${filename}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'image/jpeg',
            },
            body: blob,
          },
        );

        if (res.ok) {
          uploaded.push(
            `${supabaseUrl}/storage/v1/object/public/vendor-portfolios/${filename}`,
          );
        }
      } catch {
        // Skip failed uploads — don't block onboarding
      }
    }

    return uploaded;
  };

  const callOnboardingFunction = async (
    payload: Record<string, unknown>,
    attempt = 1,
  ): Promise<void> => {
    const token = await getToken({ template: 'supabase' });
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/complete-onboarding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'vendor', profile: payload }),
      },
    );

    if (response.status === 409 && attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return callOnboardingFunction(payload, attempt + 1);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete onboarding');
    }
  };

  const handleSubmit = async () => {
    setStep4({ portfolioUris: photos });
    setLoading(true);

    try {
      const portfolioUrls = await uploadPortfolioPhotos(photos);

      const payload = {
        business_name: data.step1?.businessName,
        category: data.step1?.category,
        description: data.step2?.description,
        price_range: data.step2?.priceRange,
        city: data.step3?.city,
        address: data.step3?.address,
        whatsapp_phone: data.step3?.whatsappPhone
          ? `+255${data.step3.whatsappPhone}`
          : null,
        phone: data.step3?.phone ? `+255${data.step3.phone}` : null,
        email: data.step3?.email,
        instagram: data.step3?.instagram,
        portfolio_urls: portfolioUrls,
      };

      await callOnboardingFunction(payload);

      await user?.update({
        unsafeMetadata: {
          ...(user?.unsafeMetadata ?? {}),
          onboardingComplete: true,
          user_type: 'vendor',
        },
      });

      await user?.reload();
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepContainer
      title="Show your work"
      subtitle="Upload at least 1 photo to go live — add more later"
      currentStep={3}
      totalSteps={4}
      onNext={handleSubmit}
      onBack={() => router.back()}
      nextLabel="Launch my storefront"
      nextDisabled={!canProceed}
      nextLoading={loading}
    >
      <View className="gap-4">
        <Text className="text-xs text-of-muted">
          Even one great photo gets you listed. Add more from your dashboard after you're live.
        </Text>
        <PhotoUploader
          photos={photos}
          onPhotosChange={setPhotos}
          maxPhotos={10}
          minPhotos={1}
        />
      </View>
    </StepContainer>
  );
}
