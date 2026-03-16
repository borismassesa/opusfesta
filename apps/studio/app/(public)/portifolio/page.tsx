import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Portfolio | OpusStudio',
  description: 'Browse our gallery of production photos and videos across commercial, documentary, music video, and branded work.',
};

export default function PortfolioAliasPage() {
  redirect('/portfolio');
}
