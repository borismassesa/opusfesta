import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  PieChartIcon,
  Settings,
  Star,
  Users
} from "lucide-react";
import { cn } from "../lib/utils";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Calendar, label: "Schedule" },
  { icon: FolderOpen, label: "Projects" },
  { icon: PieChartIcon, label: "Reports" },
  { icon: FileText, label: "Notes" },
  { icon: Star, label: "Benefits", badge: "NEW" },
];

const secondaryNavItems = [
  { icon: Briefcase, label: "Job" },
  { icon: Users, label: "Candidate" },
  { icon: Building2, label: "Company" },
  { icon: CreditCard, label: "Payment" },
];

const bottomNavItems = [
  { icon: HelpCircle, label: "Help Center" },
  { icon: MessageSquare, label: "Feedback" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full h-screen sticky top-0 py-6 px-4">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Ovalent</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1 mb-8">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href="#"
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  item.active
                    ? "bg-gray-50 text-gray-900 border border-gray-200 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <nav className="space-y-1 mb-8 border-t border-gray-100 pt-6">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 stroke-[1.5]" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-6 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-5 h-5 stroke-[1.5]" />
              {item.label}
            </a>
          );
        })}
      </div>
    </aside>
  );
}
