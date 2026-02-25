'use client';

import { useRef, useState } from 'react';
import Header from '@/components/Header';
import MenuSidebar from '@/components/MenuSidebar';
import MainFooter from '@/components/MainFooter';
import BackToTop from '@/components/BackToTop';
import GridOverlay from '@/components/GridOverlay';

interface PageLayoutProps {
  children: React.ReactNode;
  withTopOffset?: boolean;
}

const MENU_PANEL_ID = 'studio-sidebar-menu';
const MENU_HEADING_ID = 'studio-sidebar-menu-heading';

export default function PageLayout({ children, withTopOffset = true }: PageLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="relative">
      <GridOverlay />
      <Header
        onMenuToggle={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
        menuButtonRef={menuButtonRef}
        menuControlsId={MENU_PANEL_ID}
      />
      <MenuSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        panelId={MENU_PANEL_ID}
        headingId={MENU_HEADING_ID}
        returnFocusRef={menuButtonRef}
      />
      <div className={withTopOffset ? 'pt-20' : undefined}>{children}</div>
      <MainFooter />
      <BackToTop />
    </main>
  );
}
