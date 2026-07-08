import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { FavoritesTab } from '@/components/vendors/FavoritesTab';

export default function SavedVendorsScreen() {
  return (
    <ScreenWrapper scrollable={false}>
      <Header title="Saved vendors" showBack />
      <FavoritesTab />
    </ScreenWrapper>
  );
}
