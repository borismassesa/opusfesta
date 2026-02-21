'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MenuSidebar from '@/components/MenuSidebar';
import MainFooter from '@/components/MainFooter';
import BackToTop from '@/components/BackToTop';
import GridOverlay from '@/components/GridOverlay';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="relative">
      <GridOverlay />
      <Header onMenuToggle={() => setIsMenuOpen(true)} />
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="pt-20">{children}</div>
      <MainFooter />
      <BackToTop />
    </main>
  );
}
