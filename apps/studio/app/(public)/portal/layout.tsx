import ClientAuthProvider from '@/components/portal/ClientAuthProvider';
import PortalSidebar from '@/components/portal/PortalSidebar';
import PortalMobileHeader from '@/components/portal/PortalMobileHeader';

export const metadata = {
  title: 'Client Portal — OpusStudio',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <div className="min-h-screen bg-brand-bg flex">
        {/* Desktop sidebar */}
        <PortalSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile top header */}
          <PortalMobileHeader />

          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 pb-24 lg:pb-10">
            {children}
          </main>

          <footer className="hidden lg:block border-t border-brand-border/20 py-4 text-center">
            <p className="text-[11px] text-brand-muted font-mono">
              OpusStudio — Dar es Salaam, Tanzania
            </p>
          </footer>
        </div>
      </div>
    </ClientAuthProvider>
  );
}
