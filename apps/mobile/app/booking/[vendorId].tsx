import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePickerField } from '@/components/onboarding/DatePickerField';
import { BudgetSelector } from '@/components/onboarding/BudgetSelector';
import { BUDGET_RANGES, type BudgetKey } from '@/constants/onboarding';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useOpusFestaAuth } from '@/lib/auth';
import { createBookingInquiry } from '@/lib/api/bookings';
import { getVendorById } from '@/lib/api/vendors';

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
  const { user } = useOpusFestaAuth();
  const [guestCount, setGuestCount] = useState(250);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [budgetKey, setBudgetKey] = useState<BudgetKey | null>(null);

  const { data: vendor } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => getVendorById(vendorId!),
    enabled: !!vendorId,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      eventDate: '',
      guestCount: 250,
      budgetRange: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingForm) =>
      createBookingInquiry(client, {
        vendor_id: vendorId!,
        name: user?.name ?? '',
        email: user?.email ?? '',
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
      <Header title="Request a quote" subtitle={vendor?.business_name ?? 'Vendor'} showBack />

      <View className="gap-5">
        {/* Event date */}
        <View>
          <Text className="text-sm font-work-sans-bold text-of-text mb-1.5">
            Event date
          </Text>
          <DatePickerField
            value={eventDate}
            onChange={(date) => {
              setEventDate(date);
              setValue('eventDate', date.toISOString().slice(0, 10), { shouldValidate: true });
            }}
            placeholder="Select a date"
            formatValue={(date) =>
              date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
            minimumDate={new Date()}
          />
          {errors.eventDate && (
            <Text className="text-xs text-red-600 mt-1">{errors.eventDate.message}</Text>
          )}
        </View>

        {/* Guest count */}
        <View>
          <Text className="text-sm font-work-sans-bold text-of-text mb-1.5">
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
          <Text className="text-sm font-work-sans-bold text-of-text mb-1.5">
            Budget range
          </Text>
          <BudgetSelector
            value={budgetKey ?? ''}
            onSelect={(key) => {
              setBudgetKey(key);
              const range = BUDGET_RANGES.find((r) => r.key === key);
              setValue('budgetRange', range?.label ?? '', { shouldValidate: true });
            }}
          />
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
