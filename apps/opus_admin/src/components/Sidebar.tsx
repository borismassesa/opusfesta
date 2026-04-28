'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Gem,
  Globe,
  Globe2,
  Heart,
  HelpCircle,
  History,
  Home,
  Image as ImageIcon,
  Inbox,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  ListTree,
  MapPin,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plane,
  Plug,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Tags,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import Logo from "./ui/Logo";

type NavItem = { icon: LucideIcon; label: string; href: string; badge?: string };
type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const topItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Inbox, label: "Inbox", href: "/inbox", badge: "12" },
];

const sections: NavSection[] = [
  {
    id: "website-cms",
    label: "Website CMS",
    icon: Globe,
    items: [
      { icon: Home, label: "Homepage", href: "/cms/homepage" },
      { icon: Store, label: "Vendors", href: "/cms/vendors" },
      { icon: MapPin, label: "Planning Tools", href: "/cms/planning-tools" },
      { icon: Lightbulb, label: "Advice & Ideas", href: "/cms/advice-and-ideas" },
      { icon: Gem, label: "Attire & Rings", href: "/cms/attire-and-rings" },
      { icon: UserCheck, label: "Guests", href: "/cms/guests" },
      { icon: Globe2, label: "Wedding Websites", href: "/cms/wedding-websites" },
      { icon: FileText, label: "Pages", href: "/cms/pages" },
      { icon: ImageIcon, label: "Media Library", href: "/cms/media" },
      { icon: ClipboardList, label: "Forms", href: "/cms/forms" },
      { icon: Tags, label: "Categories & Tags", href: "/cms/taxonomy" },
      { icon: ListTree, label: "Navigation", href: "/cms/navigation" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Briefcase,
    items: [
      { icon: CalendarCheck, label: "Bookings", href: "/operations/bookings" },
      { icon: Heart, label: "Clients", href: "/operations/clients" },
      { icon: Building2, label: "Vendor Accounts", href: "/operations/vendors" },
      { icon: Star, label: "Reviews & Moderation", href: "/operations/reviews" },
      { icon: Calendar, label: "Calendar", href: "/operations/calendar" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Landmark,
    items: [
      { icon: Receipt, label: "Invoices", href: "/finance/invoices" },
      { icon: CreditCard, label: "Payments", href: "/finance/payments" },
      { icon: Wallet, label: "Vendor Payouts", href: "/finance/payouts" },
      { icon: RefreshCw, label: "Refunds", href: "/finance/refunds" },
      { icon: FileText, label: "Tax & VAT", href: "/finance/tax" },
      { icon: Smartphone, label: "M-Pesa Reconciliation", href: "/finance/mpesa" },
    ],
  },
  {
    id: "workforce",
    label: "Workforce",
    icon: Users,
    items: [
      { icon: UserCog, label: "Employees", href: "/workforce/employees" },
      { icon: ClipboardList, label: "Schedule", href: "/workforce/schedule" },
      { icon: Wallet, label: "Payroll", href: "/workforce/payroll" },
      { icon: Plane, label: "Leave & Attendance", href: "/workforce/leave" },
      { icon: Shield, label: "Roles & Permissions", href: "/workforce/roles" },
      { icon: UserPlus, label: "Recruitment", href: "/workforce/recruitment" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    icon: BarChart3,
    items: [
      { icon: TrendingUp, label: "Analytics", href: "/insights/analytics" },
      { icon: History, label: "Activity Log", href: "/insights/activity" },
      { icon: ShieldCheck, label: "Audit Log", href: "/insights/audit" },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { icon: Plug, label: "Integrations", href: "/integrations" },
  { icon: HelpCircle, label: "Help Center", href: "/help" },
  { icon: MessageSquare, label: "Feedback", href: "/feedback" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const COLLAPSED_KEY = 'opusfesta:sidebar-collapsed'

function isItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function isSectionActive(pathname: string, section: NavSection) {
  return section.items.some((i) => isItemActive(pathname, i.href))
}

export function Sidebar() {
  const pathname = usePathname();
  const initialSection = sections.find((s) => isSectionActive(pathname, s))?.id ?? "website-cms";
  const [openSection, setOpenSection] = useState<string>(initialSection);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // Hydrate collapsed state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(COLLAPSED_KEY) === '1') setCollapsed(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const expand = () => setCollapsed(false)
  const toggle = () => setCollapsed((c) => !c)

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-100 flex flex-col h-full h-screen sticky top-0 py-6 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[72px] px-2' : 'w-64 px-4'
      )}
    >
      {/* Header: logo + toggle */}
      <div className={cn('flex items-center mb-6', collapsed ? 'justify-center' : 'justify-between px-3')}>
        {!collapsed && (
          <Link href="/" className="flex items-center" aria-label="Home">
            <Logo className="h-8 w-auto" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Search */}
      {collapsed ? (
        <button
          type="button"
          onClick={expand}
          aria-label="Search"
          title="Search"
          className="self-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors mb-4"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <div className="px-1 mb-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-12 py-2 bg-gray-50 border border-gray-100 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all"
            />
            <span className="absolute right-2 text-[10px] text-gray-400 font-medium border border-gray-200 bg-white rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className={cn('flex-1 overflow-y-auto overflow-x-hidden', collapsed ? 'space-y-2' : 'space-y-1')}>
        {/* Top items */}
        <nav className={cn(collapsed ? 'space-y-1' : 'space-y-1 mb-2')}>
          {topItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center rounded-xl text-sm font-semibold transition-colors',
                  collapsed
                    ? 'justify-center w-12 h-12 mx-auto'
                    : 'w-full justify-between px-3 py-2.5',
                  isActive
                    ? 'bg-[#F0DFF6] text-[#7E5896]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {collapsed ? (
                  <>
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                    {item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A0DC] ring-2 ring-white" />
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 stroke-[1.5]" />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="bg-[#C9A0DC] text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sections */}
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openSection === section.id;
          const isActive = isSectionActive(pathname, section);

          if (collapsed) {
            // Single icon button — clicking expands sidebar AND opens this section
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setCollapsed(false)
                  setOpenSection(section.id)
                }}
                aria-label={section.label}
                title={section.label}
                className={cn(
                  'flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-colors',
                  isActive
                    ? 'text-[#7E5896] bg-[#F0DFF6]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <SectionIcon className="w-5 h-5 stroke-[1.5]" />
              </button>
            )
          }

          return (
            <div key={section.id}>
              <button
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  isOpen ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <SectionIcon className="w-5 h-5 stroke-[1.5]" />
                  {section.label}
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <nav className="mt-1 mb-2 space-y-0.5 pl-2 border-l border-gray-100 ml-5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const itemActive = isItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          'w-full flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                          itemActive
                            ? 'bg-[#F0DFF6] text-[#7E5896]'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4 stroke-[1.5] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={cn('mt-auto border-t border-gray-100 pt-4', collapsed ? 'space-y-1' : 'space-y-1')}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors',
                collapsed
                  ? 'justify-center w-12 h-12 mx-auto'
                  : 'gap-3 px-3 py-2'
              )}
            >
              <Icon className="w-5 h-5 stroke-[1.5]" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
