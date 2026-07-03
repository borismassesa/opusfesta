import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorialStepContainer } from '@/components/onboarding/EditorialStepContainer';
import { shadowSoft, shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { CITIES } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

const POPULAR_CITIES = CITIES.filter((c) => ['dar_es_salaam', 'zanzibar', 'arusha', 'dodoma'].includes(c.key));

export default function LocationStep() {
  const router = useRouter();
  const { data, setLocation } = useCoupleOnboarding();
  const { editorial } = useTheme();
  const [selected, setSelected] = useState(data.location?.city ?? '');
  const [searchText, setSearchText] = useState('');
  const [deciding, setDeciding] = useState(false);

  const handleNext = () => {
    setLocation({ city: deciding ? 'other' : selected });
    router.push('/(onboarding)/couple/step5-guests');
  };

  const filteredCities = searchText
    ? CITIES.filter((c) => c.label.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  return (
    <EditorialStepContainer
      title="Where are you celebrating?"
      currentStep={4}
      totalSteps={8}
      progressLabel="Location Planning"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!selected && !deciding}
    >
      <View style={{ gap: 16, marginTop: 4 }}>
        {/* City selection option */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: !deciding ? editorial.primaryContainer : editorial.outlineVariant,
                backgroundColor: !deciding ? editorial.primaryContainer : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!deciding && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: editorial.bg }} />}
            </View>
            <View>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: editorial.onSurface }}>
                I have a city in mind
              </Text>
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                Discover venues in Tanzania's most iconic locations.
              </Text>
            </View>
          </View>

          {/* Search */}
          {!deciding && (
            <View style={{ marginLeft: 32, gap: 14 }}>
              <View style={[{ backgroundColor: editorial.surfaceContainerLowest, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(30,27,23,0.1)' }, shadowSoft]}>
                <Ionicons name="search" size={18} color={editorial.outline} />
                <TextInput
                  value={searchText}
                  onChangeText={(t) => { setSearchText(t); setDeciding(false); }}
                  placeholder="Search for a city..."
                  placeholderTextColor={editorial.outlineVariant}
                  style={{ flex: 1, fontFamily: 'WorkSans-Regular', fontSize: 16, color: editorial.onSurface, paddingVertical: 14, paddingLeft: 10 }}
                />
              </View>

              {/* Search results */}
              {searchText.length > 0 && filteredCities.length > 0 && (
                <View style={{ gap: 6 }}>
                  {filteredCities.map((c) => (
                    <Pressable
                      key={c.key}
                      onPress={() => { setSelected(c.key); setSearchText(c.label); }}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: selected === c.key ? editorial.secondaryContainer : editorial.surfaceContainerLow,
                      }}
                    >
                      <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 14, color: editorial.onSurface }}>
                        {c.icon} {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Popular Destinations */}
              <View>
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: editorial.onSurfaceVariant, marginBottom: 10 }}>
                  Popular Destinations
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                  {POPULAR_CITIES.map((city) => (
                    <Pressable
                      key={city.key}
                      onPress={() => { setSelected(city.key); setSearchText(city.label); }}
                      style={{ width: 110, marginHorizontal: 4 }}
                    >
                      <View
                        style={[
                          {
                            width: 110,
                            height: 140,
                            borderRadius: 12,
                            overflow: 'hidden',
                            backgroundColor: editorial.surfaceContainerHighest,
                            borderWidth: selected === city.key ? 2 : 1,
                            borderColor: selected === city.key ? editorial.primaryContainer : 'rgba(30,27,23,0.15)',
                          },
                          shadowSoftSm,
                        ]}
                      >
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 32 }}>{city.icon}</Text>
                        </View>
                        <View style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#fff' }}>
                            {city.label}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* Still deciding */}
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(205,195,208,0.3)', paddingTop: 16 }}>
          <Pressable
            onPress={() => { setDeciding(true); setSelected(''); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: deciding ? editorial.primaryContainer : editorial.outlineVariant,
                backgroundColor: deciding ? editorial.primaryContainer : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {deciding && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: editorial.bg }} />}
            </View>
            <View>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: editorial.onSurface }}>
                Still deciding
              </Text>
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
                We'll show you the best across the region.
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </EditorialStepContainer>
  );
}
