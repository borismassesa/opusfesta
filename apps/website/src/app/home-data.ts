import type { LucideIcon } from 'lucide-react';
import { Heart, Image, MapPin, Users } from 'lucide-react';

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
  'Discover',
  'Venues',
  'Photographers',
  'Florists',
  'Wedding Dresses',
  'Cakes',
  'Music & DJs',
  'Videographers',
  'Planners',
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
  { id: 1, title: 'Napa Valley Vineyard Wedding', author: 'Bella Photography', image: 'https://picsum.photos/seed/wedding1/600/450', likes: 164, views: 6800 },
  { id: 2, title: 'Modern Industrial Reception', author: 'Urban Events', image: 'https://picsum.photos/seed/wedding2/600/450', likes: 142, views: 5200 },
  { id: 3, title: 'Seaside Elopement Film', author: 'Salty Love Photo', image: 'https://picsum.photos/seed/wedding3/600/450', likes: 185, views: 9100 },
  { id: 4, title: 'Lush Floral Centerpieces', author: 'Bloom & Co', image: 'https://picsum.photos/seed/wedding4/600/450', likes: 121, views: 4700 },
  { id: 5, title: 'Classic Church Ceremony', author: 'Timeless Vows', image: 'https://picsum.photos/seed/wedding5/600/450', likes: 134, views: 6100 },
  { id: 6, title: 'Garden Party Tablescape', author: 'Nature Weddings', image: 'https://picsum.photos/seed/wedding6/600/450', likes: 178, views: 8300 },
  { id: 7, title: 'Luxury Ballroom Entrance', author: 'Grand Events', image: 'https://picsum.photos/seed/wedding7/600/450', likes: 156, views: 7200 },
  { id: 8, title: 'Intimate Backyard Nuptials', author: 'Home & Heart', image: 'https://picsum.photos/seed/wedding8/600/450', likes: 118, views: 4300 },
];
