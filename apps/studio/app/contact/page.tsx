import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import ContactPageContent from '@/components/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact | OpusStudio',
  description: 'Start a project with OpusStudio and share budget, timeline, and project scope.',
};

export default function ContactPage() {
  return (
    <PageLayout>
      <ContactPageContent />
    </PageLayout>
  );
}
