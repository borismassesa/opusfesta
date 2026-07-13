import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
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
    <StepContainer
      title="Where are you celebrating?"
      currentStep={4}
      totalSteps={8}
      progressLabel="Location Planning"
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!selected && !deciding}
    >
      <View className="gap-4 mt-1">
        {/* City selection option */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2.5">
            <View
              className={`w-[22px] h-[22px] rounded-[11px] items-center justify-center border-2 ${
                !deciding ? 'border-ed-primary-container bg-ed-primary-container' : 'border-ed-outline-variant bg-transparent'
              }`}
            >
              {!deciding && <View className="w-[7px] h-[7px] rounded-[4px] bg-ed-bg" />}
            </View>
            <View>
              <Text className="font-space-grotesk-bold text-xl text-ed-on-surface">
                I have a city in mind
              </Text>
              <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mt-0.5">
                Discover venues in Tanzania's most iconic locations.
              </Text>
            </View>
          </View>

          {/* Search */}
          {!deciding && (
            <View className="ml-8 gap-3.5">
              <View
                className="bg-ed-surface-container-lowest rounded-xl flex-row items-center px-3.5 border border-[rgba(30,27,23,0.1)]"
                style={shadowSoft}
              >
                <Ionicons name="search" size={18} color={editorial.outline} />
                <TextInput
                  value={searchText}
                  onChangeText={(t) => { setSearchText(t); setDeciding(false); }}
                  placeholder="Search for a city..."
                  placeholderTextColor={editorial.outlineVariant}
                  className="flex-1 font-work-sans text-base text-ed-on-surface py-3.5 pl-2.5"
                />
              </View>

              {/* Search results */}
              {searchText.length > 0 && filteredCities.length > 0 && (
                <View className="gap-1.5">
                  {filteredCities.map((c) => (
                    <Pressable
                      key={c.key}
                      onPress={() => { setSelected(c.key); setSearchText(c.label); }}
                      className={`p-3 rounded-lg ${selected === c.key ? 'bg-ed-secondary-container' : 'bg-ed-surface-container-low'}`}
                    >
                      <Text className="font-work-sans-medium text-sm text-ed-on-surface">
                        {c.icon} {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Popular Destinations */}
              <View>
                <Text className="font-work-sans-bold text-[9px] tracking-[3px] uppercase text-ed-on-surface-variant mb-2.5">
                  Popular Destinations
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                  {POPULAR_CITIES.map((city) => (
                    <Pressable
                      key={city.key}
                      onPress={() => { setSelected(city.key); setSearchText(city.label); }}
                      className="w-[110px] mx-1"
                    >
                      <View
                        className={`w-[110px] h-[140px] rounded-xl overflow-hidden bg-ed-surface-container-highest ${
                          selected === city.key ? 'border-2 border-of-light' : 'border border-[rgba(30,27,23,0.15)]'
                        }`}
                        style={shadowSoftSm}
                      >
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-[32px]">{city.icon}</Text>
                        </View>
                        <View className="p-2 bg-black/50 absolute bottom-0 left-0 right-0">
                          <Text className="font-space-grotesk-bold text-[11px] text-white">
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
        <View className="border-t border-[rgba(205,195,208,0.3)] pt-4">
          <Pressable
            onPress={() => { setDeciding(true); setSelected(''); }}
            className="flex-row items-center gap-2.5 p-3 rounded-xl"
          >
            <View
              className={`w-[22px] h-[22px] rounded-[11px] items-center justify-center border-2 ${
                deciding ? 'border-ed-primary-container bg-ed-primary-container' : 'border-ed-outline-variant bg-transparent'
              }`}
            >
              {deciding && <View className="w-[7px] h-[7px] rounded-[4px] bg-ed-bg" />}
            </View>
            <View>
              <Text className="font-space-grotesk-bold text-base text-ed-on-surface">
                Still deciding
              </Text>
              <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                We'll show you the best across the region.
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </StepContainer>
  );
}
