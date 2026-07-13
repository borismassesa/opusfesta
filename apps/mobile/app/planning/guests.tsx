import { useState } from 'react';
import { View, Text, Pressable, FlatList, Alert, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useWeddingEvent,
  useGuestList,
  useAddGuest,
  useUpdateGuestRsvp,
  useDeleteGuest,
  useRecordInvitationSend,
} from '@/hooks/useGuestList';
import { buildRsvpLink } from '@/lib/api/guests';
import type { Guest } from '@/types/guest';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

const RSVP_CYCLE = ['pending', 'attending', 'declined'];
const RSVP_LABEL: Record<string, string> = {
  pending: 'Pending',
  attending: 'Attending',
  declined: 'Declined',
  maybe: 'Maybe',
};
const RSVP_VARIANT: Record<string, 'default' | 'success' | 'warning'> = {
  pending: 'warning',
  attending: 'success',
  declined: 'default',
  maybe: 'default',
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View
      className="flex-1 bg-ed-surface-container-lowest rounded-xl border border-ed-outline-variant p-3 items-center"
      style={shadowSoftSm}
    >
      <Text className="font-space-grotesk-bold text-xl text-ed-on-surface">{value}</Text>
      <Text className="font-work-sans-bold text-[10px] tracking-[0.5px] text-ed-on-surface-variant mt-0.5">
        {label}
      </Text>
    </View>
  );
}

export default function GuestListScreen() {
  const { editorial } = useTheme();
  const { data: event, isLoading: eventLoading } = useWeddingEvent();
  const { data: guests = [], isLoading: guestsLoading } = useGuestList(event?.id);
  const addGuest = useAddGuest(event?.id);
  const updateRsvp = useUpdateGuestRsvp(event?.id);
  const deleteGuest = useDeleteGuest(event?.id);
  const recordSend = useRecordInvitationSend(event?.id);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [groupTag, setGroupTag] = useState('');

  const isLoading = eventLoading || guestsLoading;

  const counts = {
    total: guests.length,
    attending: guests.filter((g) => g.rsvp_status === 'attending').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    declined: guests.filter((g) => g.rsvp_status === 'declined').length,
  };

  const handleAdd = () => {
    if (!name.trim() || !event?.id) return;
    addGuest.mutate(
      { full_name: name.trim(), phone: phone.trim() || undefined, group_tag: groupTag.trim() || undefined },
      {
        onSuccess: () => {
          setName('');
          setPhone('');
          setGroupTag('');
          setShowAdd(false);
        },
      },
    );
  };

  const cycleRsvp = (guest: Guest) => {
    const idx = RSVP_CYCLE.indexOf(guest.rsvp_status);
    const next = RSVP_CYCLE[(idx + 1) % RSVP_CYCLE.length];
    updateRsvp.mutate({ guestContactId: guest.id, rsvpStatus: next });
  };

  const handleSendInvite = async (guest: Guest) => {
    if (!guest.public_token) return;
    const link = buildRsvpLink(guest.public_token);
    const result = await Share.share({
      message: `You're invited! Please RSVP here: ${link}`,
      url: link,
    });
    if (result.action !== Share.dismissedAction) {
      recordSend.mutate({ guestContactId: guest.id, currentInviteCount: guest.invite_count ?? 0 });
    }
  };

  const confirmDelete = (guest: Guest) => {
    Alert.alert('Remove guest', `Remove ${guest.full_name} from your guest list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteGuest.mutate(guest.id) },
    ]);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <Header
        title="Guest List"
        showBack
        rightAction={
          <Pressable
            onPress={() => setShowAdd((v) => !v)}
            className="w-9 h-9 rounded-full items-center justify-center bg-ed-primary-container"
          >
            <Ionicons name={showAdd ? 'close' : 'add'} size={20} color="#fff" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <View className="flex-row gap-2 mb-4">
            <StatCard label="TOTAL" value={counts.total} />
            <StatCard label="ATTENDING" value={counts.attending} />
            <StatCard label="PENDING" value={counts.pending} />
            <StatCard label="DECLINED" value={counts.declined} />
          </View>

          {showAdd && (
            <View className="gap-2.5 mb-4">
              <Input label="Name" value={name} onChangeText={setName} placeholder="Guest name" />
              <Input
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="+255 ..."
                keyboardType="phone-pad"
              />
              <Input
                label="Group (optional)"
                value={groupTag}
                onChangeText={setGroupTag}
                placeholder="e.g. Bride's family"
              />
              <Button title="Add guest" onPress={handleAdd} loading={addGuest.isPending} disabled={!name.trim()} />
            </View>
          )}

          {guests.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
                No guests yet. Tap + to add your first guest.
              </Text>
            </View>
          ) : (
            <FlatList
              data={guests}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  className="flex-row items-center bg-ed-surface-container-lowest rounded-[14px] border border-ed-outline-variant p-3.5 gap-2.5"
                  style={shadowSoftSm}
                >
                  <View className="flex-1">
                    <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">
                      {item.full_name}
                    </Text>
                    {(item.group_tag || item.phone) && (
                      <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
                        {[item.group_tag, item.phone].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                    {item.responded_at && (item.meal_choice || item.guest_message || item.party_size > 1) && (
                      <Text className="font-work-sans text-[11px] text-ed-on-surface-variant mt-1" numberOfLines={2}>
                        {[
                          item.party_size > 1 ? `Party of ${item.party_size}` : null,
                          item.meal_choice,
                          item.guest_message ? `"${item.guest_message}"` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    )}
                    {item.last_invited_at && (
                      <Text className="font-work-sans text-[10px] text-ed-outline mt-0.5">
                        Invited {new Date(item.last_invited_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {item.public_token && (
                    <Pressable onPress={() => handleSendInvite(item)} className="p-1">
                      <Ionicons name="paper-plane-outline" size={18} color={editorial.primaryContainer} />
                    </Pressable>
                  )}
                  <Pressable onPress={() => cycleRsvp(item)}>
                    <Badge label={RSVP_LABEL[item.rsvp_status] ?? item.rsvp_status} variant={RSVP_VARIANT[item.rsvp_status] ?? 'default'} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item)} className="p-1">
                    <Ionicons name="trash-outline" size={18} color={editorial.error} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </>
      )}
    </ScreenWrapper>
  );
}
