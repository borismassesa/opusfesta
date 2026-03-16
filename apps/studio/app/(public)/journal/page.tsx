import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import JournalFeed from '@/components/JournalFeed';
import { getPublishedArticles } from '@/lib/data-access';

export const metadata: Metadata = {
  title: 'Journal | OpusStudio',
  description: 'Insights, behind-the-scenes, and creative thinking from the OpusStudio team.',
};

export default async function JournalPage() {
  const articles = await getPublishedArticles();

  return (
    <PageLayout>
      <JournalFeed articles={articles} />
    </PageLayout>
  );
}
