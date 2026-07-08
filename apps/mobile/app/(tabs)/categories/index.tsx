import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { VendorsHeader } from '@/components/vendors/VendorsHeader';
import { VendorsTabRow, type VendorsTabKey } from '@/components/vendors/VendorsTabRow';
import { FindVendorsTab } from '@/components/vendors/FindVendorsTab';
import { BookedVendorsTab } from '@/components/vendors/BookedVendorsTab';
import { FavoritesTab } from '@/components/vendors/FavoritesTab';

export default function CategoriesScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { category: deepLinkCategory } = useLocalSearchParams<{ category?: string }>();
  const [activeTab, setActiveTab] = useState<VendorsTabKey>('find');

  // A deep link (e.g. the home checklist's "Book your photographer" CTA)
  // should land straight on that category's own results screen, same as
  // tapping its tile does, rather than filtering this screen in place.
  useEffect(() => {
    if (deepLinkCategory) router.replace(`/(tabs)/categories/${deepLinkCategory}`);
  }, [deepLinkCategory]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <VendorsHeader onHeartPress={() => setActiveTab('favorites')} />
      <VendorsTabRow activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'find' && <FindVendorsTab />}
      {activeTab === 'booked' && (
        <BookedVendorsTab
          onFindVendor={(categoryKey) => router.push(`/(tabs)/categories/${categoryKey}`)}
        />
      )}
      {activeTab === 'favorites' && (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
          <FavoritesTab />
        </View>
      )}
    </SafeAreaView>
  );
}
