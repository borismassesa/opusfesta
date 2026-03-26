import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { createBookingInquiry } from '@/lib/api/bookings';

const bookingSchema = z.object({
  eventDate: z.string().min(1, 'Event date is required'),
  guestCount: z.number().min(1, 'Guest count is required'),
  budgetRange: z.string().optional(),
  message: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingScreen() {
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const router = useRouter();
  const client = useAuthenticatedSupabase();
  const [guestCount, setGuestCount] = useState(250);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      eventDate: '2026-06-12',
      guestCount: 250,
      budgetRange: 'TZS 2M - 5M',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingForm) =>
      createBookingInquiry(client, {
        vendor_id: vendorId!,
        event_date: data.eventDate,
        guest_count: data.guestCount,
        budget_range: data.budgetRange,
        message: data.message,
      }),
    onSuccess: () => {
      Alert.alert('Request sent!', 'The vendor will respond shortly.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to send request');
    },
  });

  const onSubmit = (data: BookingForm) => {
    mutation.mutate({ ...data, guestCount });
  };

  return (
    <ScreenWrapper>
      <Header title="Request a quote" subtitle="Serena Grand Ballroom" showBack />

      <View className="gap-5">
        {/* Event date */}
        <Controller
          control={control}
          name="eventDate"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">
                Event date
              </Text>
              <Card className="flex-row justify-between items-center">
                <Text className="text-sm text-of-text">
                  {new Date(value).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text className="text-of-muted">📅</Text>
              </Card>
            </View>
          )}
        />

        {/* Guest count */}
        <View>
          <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">
            Number of guests
          </Text>
          <Card className="flex-row justify-between items-center">
            <Text className="text-sm text-of-text">{guestCount} guests</Text>
            <View className="flex-row gap-2">
              <Button
                title="−"
                variant="ghost"
                size="sm"
                onPress={() => setGuestCount(Math.max(1, guestCount - 10))}
                className="w-8 h-8 rounded-lg bg-of-pale p-0"
              />
              <Button
                title="+"
                variant="ghost"
                size="sm"
                onPress={() => setGuestCount(guestCount + 10)}
                className="w-8 h-8 rounded-lg bg-of-pale p-0"
              />
            </View>
          </Card>
        </View>

        {/* Budget range */}
        <View>
          <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">
            Budget range
          </Text>
          <Card>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-of-muted">TZS 2M</Text>
              <Text className="text-sm font-dm-sans-bold text-of-primary">
                TZS 5M
              </Text>
              <Text className="text-sm text-of-muted">TZS 10M</Text>
            </View>
            <View className="h-1.5 bg-of-pale rounded-full">
              <View className="h-1.5 w-[40%] bg-of-primary rounded-full" />
            </View>
          </Card>
        </View>

        {/* Message */}
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Message to vendor"
              value={value}
              onChangeText={onChange}
              placeholder="Tell us about your event vision, special requirements..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              error={errors.message?.message}
            />
          )}
        />

        {/* Submit */}
        <Button
          title="Send quote request"
          onPress={handleSubmit(onSubmit)}
          loading={mutation.isPending}
          className="mt-2"
        />
      </View>
    </ScreenWrapper>
  );
}
