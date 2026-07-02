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
import { editorial, shadowSoftSm } from '@/constants/theme';

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
      style={[
        {
          flex: 1,
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 12,
          alignItems: 'center',
        },
        shadowSoftSm,
      ]}
    >
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: editorial.onSurface }}>{value}</Text>
      <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 0.5, color: editorial.onSurfaceVariant, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function GuestListScreen() {
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
    attending: guests.filter((g: any) => g.rsvp_status === 'attending').length,
    pending: guests.filter((g: any) => g.rsvp_status === 'pending').length,
    declined: guests.filter((g: any) => g.rsvp_status === 'declined').length,
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

  const cycleRsvp = (guest: any) => {
    const idx = RSVP_CYCLE.indexOf(guest.rsvp_status);
    const next = RSVP_CYCLE[(idx + 1) % RSVP_CYCLE.length];
    updateRsvp.mutate({ guestContactId: guest.id, rsvpStatus: next });
  };

  const handleSendInvite = async (guest: any) => {
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

  const confirmDelete = (guest: any) => {
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
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: editorial.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={showAdd ? 'close' : 'add'} size={20} color="#fff" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <StatCard label="TOTAL" value={counts.total} />
            <StatCard label="ATTENDING" value={counts.attending} />
            <StatCard label="PENDING" value={counts.pending} />
            <StatCard label="DECLINED" value={counts.declined} />
          </View>

          {showAdd && (
            <View style={{ gap: 10, marginBottom: 16 }}>
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
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              <Text
                style={{
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 14,
                  color: editorial.onSurfaceVariant,
                  textAlign: 'center',
                }}
              >
                No guests yet. Tap + to add your first guest.
              </Text>
            </View>
          ) : (
            <FlatList
              data={guests}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: any) => (
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: editorial.surfaceContainerLowest,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: editorial.outlineVariant,
                      padding: 14,
                      gap: 10,
                    },
                    shadowSoftSm,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: editorial.onSurface }}>
                      {item.full_name}
                    </Text>
                    {(item.group_tag || item.phone) && (
                      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                        {[item.group_tag, item.phone].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                    {item.responded_at && (item.meal_choice || item.guest_message || item.party_size > 1) && (
                      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant, marginTop: 4 }} numberOfLines={2}>
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
                      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 10, color: editorial.outline, marginTop: 2 }}>
                        Invited {new Date(item.last_invited_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {item.public_token && (
                    <Pressable onPress={() => handleSendInvite(item)} style={{ padding: 4 }}>
                      <Ionicons name="paper-plane-outline" size={18} color={editorial.primaryContainer} />
                    </Pressable>
                  )}
                  <Pressable onPress={() => cycleRsvp(item)}>
                    <Badge label={RSVP_LABEL[item.rsvp_status] ?? item.rsvp_status} variant={RSVP_VARIANT[item.rsvp_status] ?? 'default'} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(item)} style={{ padding: 4 }}>
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
