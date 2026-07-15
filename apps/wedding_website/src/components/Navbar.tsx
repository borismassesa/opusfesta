import { Menu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'wishes', label: 'Wishes' },
    { id: 'registry', label: 'Registry' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'table-seating', label: 'Table & Seating' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/30">
      <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-page h-20">
        <a className="font-display-md text-2xl md:text-3xl tracking-tight" href="#">Amina & Juma</a>
        <div className="hidden md:flex items-center gap-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-secondary hover:text-primary nav-link'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="md:hidden text-secondary">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
