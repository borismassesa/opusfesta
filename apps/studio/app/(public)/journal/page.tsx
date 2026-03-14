import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import JournalFeed from '@/components/JournalFeed';

export const metadata: Metadata = {
  title: 'Journal | OpusFesta Studio',
  description: 'Insights, behind-the-scenes, and creative thinking from the OpusFesta Studio team.',
};

export default function JournalPage() {
  return (
    <PageLayout>
      <JournalFeed />
    </PageLayout>
  );
}
