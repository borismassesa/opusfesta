"use client";

interface VendorNavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const vendorNavigationTabs = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Pricing" },
  { id: "availability", label: "Availability" },
  { id: "awards", label: "Awards" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
  { id: "profile", label: "Vendor Profile" },
  { id: "things-to-know", label: "Things to know" },
];

export function VendorNavigationTabs({
  activeTab,
  onTabChange,
}: VendorNavigationTabsProps) {
  return (
    <div className="hidden lg:flex items-center gap-6 font-medium text-sm text-secondary">
      {vendorNavigationTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              // Smooth scroll to section
              const element = document.getElementById(`section-${tab.id}`);
              if (element) {
                // The activeTab is already updated by onTabChange, so the UI will update immediately
                // The scroll detection will catch up after the scroll completes
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className={`
              transition-colors whitespace-nowrap pb-4 -mb-4
              ${
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "hover:text-primary"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
