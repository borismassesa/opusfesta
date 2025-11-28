import type { LucideIcon } from 'lucide-react';
import {
  Heart,
  Image,
  MapPin,
  Users,
  CheckSquare,
  DollarSign,
  Calendar,
  ClipboardList,
  Clock,
  ListChecks,
  Sparkles
} from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
  hasDropdown?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Planning Tools', href: '#', hasDropdown: false },
  { label: 'Vendors', href: '#', hasDropdown: true },
  { label: 'Wedding Website', href: '#', hasDropdown: false },
  { label: 'Guests & RSVPs', href: '#', hasDropdown: true },
  { label: 'Attire & Rings', href: '#', hasDropdown: true },
  { label: 'Ideas & Advice', href: '#', hasDropdown: true },
];

type HeroTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const HERO_TABS: HeroTab[] = [
  { id: 'venues', label: 'Venues', icon: MapPin },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'ideas', label: 'Ideas', icon: Heart },
];

export const POPULAR_TAGS = ['beach wedding', 'modern luxury', 'flowers', 'lace dresses'];

export const HERO_SLIDES = [
  {
    id: 1,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    author: 'Evergreen Films',
    avatar: 'https://picsum.photos/seed/vid1/50/50',
    color: '#e8f4f8',
  },
  {
    id: 2,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    author: 'Love & Lens',
    avatar: 'https://picsum.photos/seed/vid2/50/50',
    color: '#f8e8e8',
  },
  {
    id: 3,
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    author: 'Rustic Barns Co.',
    avatar: 'https://picsum.photos/seed/vid3/50/50',
    color: '#e8f8ec',
  },
];

export const CATEGORIES = [
  'Popular',
  'Real Weddings',
  'Ceremonies',
  'Receptions',
  'Beach Weddings',
  'Garden Weddings',
  'Modern & Luxury',
  'Rustic & Barn',
  'Decor & Details',
  'Florals',
  'Cakes & Desserts',
  'Fashion & Attire',
];

export const MARQUEE_CATEGORIES = [
  { title: 'Beauty', image: 'https://picsum.photos/seed/beauty/600/400' },
  { title: 'Bridal Salons', image: 'https://picsum.photos/seed/bridal/600/400' },
  { title: 'Caterers', image: 'https://picsum.photos/seed/caterers/600/400' },
  { title: 'Florists', image: 'https://picsum.photos/seed/florists/600/400' },
  { title: 'Officiants', image: 'https://picsum.photos/seed/officiants/600/400' },
  { title: 'Transportation', image: 'https://picsum.photos/seed/transport/600/400' },
  { title: 'Rentals', image: 'https://picsum.photos/seed/rentals/600/400' },
  { title: 'Venues', image: 'https://picsum.photos/seed/venues-marquee/600/400' },
  { title: 'Videographers', image: 'https://picsum.photos/seed/videographers/600/400' },
  { title: 'Wedding Planners', image: 'https://picsum.photos/seed/planners/600/400' },
];

export const MOCK_SHOTS = [
  { id: 1, title: 'Napa Valley Vineyard Wedding', author: 'Bella Photography', image: 'https://picsum.photos/seed/wedding1/600/450', likes: 164, views: 6800, category: 'Real Weddings' },
  { id: 2, title: 'Modern Industrial Reception', author: 'Urban Events', image: 'https://picsum.photos/seed/wedding2/600/450', likes: 142, views: 5200, category: 'Receptions' },
  { id: 3, title: 'Seaside Elopement Film', author: 'Salty Love Photo', image: 'https://picsum.photos/seed/wedding3/600/450', likes: 185, views: 9100, category: 'Beach Weddings' },
  { id: 4, title: 'Lush Floral Centerpieces', author: 'Bloom & Co', image: 'https://picsum.photos/seed/wedding4/600/450', likes: 121, views: 4700, category: 'Florals' },
  { id: 5, title: 'Classic Church Ceremony', author: 'Timeless Vows', image: 'https://picsum.photos/seed/wedding5/600/450', likes: 134, views: 6100, category: 'Ceremonies' },
  { id: 6, title: 'Garden Party Tablescape', author: 'Nature Weddings', image: 'https://picsum.photos/seed/wedding6/600/450', likes: 178, views: 8300, category: 'Garden Weddings' },
  { id: 7, title: 'Luxury Ballroom Entrance', author: 'Grand Events', image: 'https://picsum.photos/seed/wedding7/600/450', likes: 156, views: 7200, category: 'Modern & Luxury' },
  { id: 8, title: 'Intimate Backyard Nuptials', author: 'Home & Heart', image: 'https://picsum.photos/seed/wedding8/600/450', likes: 118, views: 4300, category: 'Real Weddings' },
  { id: 9, title: 'Rustic Barn Celebration', author: 'Country Charm', image: 'https://picsum.photos/seed/wedding9/600/450', likes: 203, views: 11200, category: 'Rustic & Barn' },
  { id: 10, title: 'Elegant Table Decor', author: 'Refined Events', image: 'https://picsum.photos/seed/wedding10/600/450', likes: 167, views: 7800, category: 'Decor & Details' },
  { id: 11, title: 'Three-Tier Wedding Cake', author: 'Sweet Celebrations', image: 'https://picsum.photos/seed/wedding11/600/450', likes: 145, views: 6400, category: 'Cakes & Desserts' },
  { id: 12, title: 'Bridal Gown Details', author: 'Couture Studio', image: 'https://picsum.photos/seed/wedding12/600/450', likes: 189, views: 9700, category: 'Fashion & Attire' },
  { id: 13, title: 'Beachfront Vow Exchange', author: 'Coastal Weddings', image: 'https://picsum.photos/seed/wedding13/600/450', likes: 211, views: 12100, category: 'Beach Weddings' },
  { id: 14, title: 'Garden Rose Bouquet', author: 'Petals & Stems', image: 'https://picsum.photos/seed/wedding14/600/450', likes: 176, views: 8900, category: 'Florals' },
  { id: 15, title: 'Modern Minimalist Reception', author: 'Clean Lines Co', image: 'https://picsum.photos/seed/wedding15/600/450', likes: 158, views: 7100, category: 'Modern & Luxury' },
  { id: 16, title: 'Outdoor Garden Ceremony', author: 'Nature Nuptials', image: 'https://picsum.photos/seed/wedding16/600/450', likes: 194, views: 10300, category: 'Garden Weddings' },
];

// Planning Tools Data
type PlanningTool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  progress?: number;
};

export const PLANNING_TOOLS: PlanningTool[] = [
  {
    id: 'checklist',
    title: 'Wedding Checklist',
    description: 'Stay on track with our comprehensive timeline',
    icon: ListChecks,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    progress: 68,
  },
  {
    id: 'budget',
    title: 'Budget Planner',
    description: 'Track expenses and manage your wedding finances',
    icon: DollarSign,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    progress: 85,
  },
  {
    id: 'guestlist',
    title: 'Guest List Manager',
    description: 'Organize guests, track RSVPs, and manage seating',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    id: 'timeline',
    title: 'Wedding Timeline',
    description: 'Create your perfect day-of schedule',
    icon: Clock,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
  },
  {
    id: 'vendor',
    title: 'Vendor Manager',
    description: 'Keep all vendor contacts and contracts organized',
    icon: ClipboardList,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
  {
    id: 'calendar',
    title: 'Event Calendar',
    description: 'Never miss important wedding-related dates',
    icon: Calendar,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/30',
  },
];

type ChecklistItem = {
  id: string;
  task: string;
  category: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
};

export const CHECKLIST_PREVIEW: ChecklistItem[] = [
  {
    id: '1',
    task: 'Book venue',
    category: 'Venue',
    dueDate: '12 months before',
    completed: true,
    priority: 'high',
  },
  {
    id: '2',
    task: 'Send save-the-dates',
    category: 'Invitations',
    dueDate: '6 months before',
    completed: true,
    priority: 'high',
  },
  {
    id: '3',
    task: 'Order wedding cake',
    category: 'Catering',
    dueDate: '3 months before',
    completed: false,
    priority: 'medium',
  },
  {
    id: '4',
    task: 'Finalize seating chart',
    category: 'Planning',
    dueDate: '2 weeks before',
    completed: false,
    priority: 'high',
  },
];

type BudgetCategory = {
  category: string;
  budgeted: number;
  spent: number;
  icon: LucideIcon;
};

export const BUDGET_PREVIEW: BudgetCategory[] = [
  { category: 'Venue', budgeted: 15000, spent: 15000, icon: MapPin },
  { category: 'Catering', budgeted: 12000, spent: 8500, icon: Users },
  { category: 'Photography', budgeted: 5000, spent: 5000, icon: Image },
  { category: 'Flowers', budgeted: 3000, spent: 2200, icon: Heart },
];
