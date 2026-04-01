'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MenuSidebar from '@/components/MenuSidebar';
import GridOverlay from '@/components/GridOverlay';
import BackToTop from '@/components/BackToTop';

interface HomePageShellProps {
  children: React.ReactNode;
}

export default function HomePageShell({ children }: HomePageShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="studio-shell relative">
      <GridOverlay />
      <Header onMenuToggle={() => setIsMenuOpen(true)} />
      <MenuSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {children}
      <BackToTop />
    </main>
  );
}
