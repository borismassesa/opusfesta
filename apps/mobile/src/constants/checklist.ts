// Task copy/ids originally mirrored the web checklist template (apps/opus_website/src/app/my/planning/PlanningClient.tsx
// SECTIONS). The mobile checklist has since regrouped the same tasks into themed goal
// cards within 4 broad phase bands (Home screen redesign) — task ids, widgets, and CTAs
// are unchanged so persistence and deep links keep working; only the grouping differs.
//
// Per the "match web" persistence decision: no wedding_tasks table — regular tasks are
// checked off locally (AsyncStorage, see useChecklist.ts) and "widget" tasks derive their
// completion from couple_profiles, same as the web client.

export type ChecklistWidget = 'date' | 'budget' | 'guest_count' | 'location' | 'categories';

export type ChecklistTask = {
  id: string;
  text: string;
  widget?: ChecklistWidget;
  cta?: { label: string; route: string; params?: Record<string, string> };
};

// Ionicons name — kept as a plain string (not `keyof typeof Ionicons.glyphMap`) to
// avoid importing @expo/vector-icons into a constants file with no other RN deps.
export type ChecklistGoal = {
  id: string;
  title: string;
  icon: string;
  tasks: ChecklistTask[];
};

export type ChecklistPhase = {
  id: string;
  label: string;
  goals: ChecklistGoal[];
};

export const CHECKLIST_PHASES: ChecklistPhase[] = [
  {
    id: 'p1',
    label: '12+ months',
    goals: [
      {
        id: 'p1_g1',
        title: 'Set your foundations',
        icon: 'compass-outline',
        tasks: [
          { id: 's12_1', text: 'Set your wedding date', widget: 'date' },
          {
            id: 's12_2',
            text: 'Define your wedding budget',
            widget: 'budget',
            cta: { label: 'Manage budget', route: '/planning/budget' },
          },
          { id: 's12_3', text: 'Estimate your guest count', widget: 'guest_count' },
        ],
      },
      {
        id: 'p1_g2',
        title: 'Plan your vision',
        icon: 'sparkles-outline',
        tasks: [
          {
            id: 's12_4',
            text: 'Choose a venue and city',
            widget: 'location',
            cta: { label: 'Browse venues', route: '/(tabs)/categories', params: { category: 'Venues' } },
          },
          { id: 's12_5', text: 'Choose your wedding style or theme' },
          { id: 's12_6', text: 'Choose which vendor categories you need', widget: 'categories' },
          {
            id: 's12_7',
            text: 'Consider hiring a wedding planner',
            cta: { label: 'Find planners', route: '/(tabs)/categories', params: { category: 'Wedding Planners' } },
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    label: '5-10 months',
    goals: [
      {
        id: 'p2_g1',
        title: 'Book your vendors',
        icon: 'camera-outline',
        tasks: [
          {
            id: 's9_1',
            text: 'Book your photographer',
            cta: { label: 'Find photographers', route: '/(tabs)/categories', params: { category: 'Photographers' } },
          },
          {
            id: 's9_2',
            text: 'Book your videographer',
            cta: { label: 'Find videographers', route: '/(tabs)/categories', params: { category: 'Videographers' } },
          },
          {
            id: 's9_3',
            text: 'Book your caterer',
            cta: { label: 'Find caterers', route: '/(tabs)/categories', params: { category: 'Caterers' } },
          },
          {
            id: 's9_4',
            text: 'Book musicians or a DJ',
            cta: { label: 'Find DJs & musicians', route: '/(tabs)/categories', params: { category: 'DJs & Music' } },
          },
          {
            id: 's6_2',
            text: 'Book your florist',
            cta: { label: 'Find florists', route: '/(tabs)/categories', params: { category: 'Florists' } },
          },
          {
            id: 's6_6',
            text: 'Hire a cake designer',
            cta: { label: 'Find cake designers', route: '/(tabs)/categories', params: { category: 'Cake & Desserts' } },
          },
        ],
      },
      {
        id: 'p2_g2',
        title: 'Style your day',
        icon: 'shirt-outline',
        tasks: [
          { id: 's9_6', text: 'Begin shopping for wedding attire' },
          { id: 's6_5', text: 'Choose and order bridal party outfits' },
          {
            id: 's6_3',
            text: 'Book hair and makeup artists',
            cta: { label: 'Find beauty pros', route: '/(tabs)/categories', params: { category: 'Beauty & Makeup' } },
          },
        ],
      },
      {
        id: 'p2_g3',
        title: 'Invite your guests',
        icon: 'mail-outline',
        tasks: [
          {
            id: 's9_5',
            text: 'Send save-the-dates',
            cta: { label: 'Create a wedding website', route: '/(tabs)/profile' },
          },
          {
            id: 's6_1',
            text: 'Send formal invitations',
            cta: { label: 'Share your wedding website', route: '/(tabs)/profile' },
          },
          { id: 's6_7', text: 'Arrange accommodation for out-of-town guests' },
        ],
      },
      {
        id: 'p2_g4',
        title: 'Plan the honeymoon',
        icon: 'airplane-outline',
        tasks: [
          { id: 's9_7', text: 'Research honeymoon destinations' },
          { id: 's6_4', text: 'Plan and book the honeymoon' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    label: '3-7 months',
    goals: [
      {
        id: 'p3_g1',
        title: 'Find attire and rings',
        icon: 'diamond-outline',
        tasks: [
          { id: 's3_3', text: 'Purchase your wedding rings' },
          { id: 's3_4', text: 'Schedule dress and suit fittings' },
        ],
      },
      {
        id: 'p3_g2',
        title: 'Finalise the details',
        icon: 'restaurant-outline',
        tasks: [
          { id: 's3_1', text: 'Finalise the catering menu and details' },
          { id: 's3_5', text: 'Plan your rehearsal dinner' },
          { id: 's3_6', text: 'Create a seating chart' },
        ],
      },
      {
        id: 'p3_g3',
        title: 'Confirm with vendors',
        icon: 'checkmark-done-outline',
        tasks: [
          {
            id: 's3_2',
            text: 'Confirm all vendor bookings in writing',
            cta: { label: 'View messages', route: '/(tabs)/messages' },
          },
          {
            id: 's3_7',
            text: 'Organise a vendor payments schedule',
            cta: { label: 'View messages', route: '/(tabs)/messages' },
          },
        ],
      },
    ],
  },
  {
    id: 'p4',
    label: '0-2 months',
    goals: [
      {
        id: 'p4_g1',
        title: 'Confirm your guests',
        icon: 'people-outline',
        tasks: [
          {
            id: 's1_1',
            text: 'Confirm final headcount with all vendors',
            cta: { label: 'Open guest list', route: '/planning/guests' },
          },
          {
            id: 's1_6',
            text: 'Send out final RSVP reminders',
            cta: { label: 'Open guest list', route: '/planning/guests' },
          },
        ],
      },
      {
        id: 'p4_g2',
        title: 'Handle logistics',
        icon: 'car-outline',
        tasks: [
          { id: 's1_2', text: 'Apply for your marriage certificate' },
          {
            id: 's1_3',
            text: 'Arrange wedding day transportation',
            cta: { label: 'Find transportation', route: '/(tabs)/categories', params: { category: 'Transportation' } },
          },
          { id: 'sf_3', text: 'Prepare vendor payment envelopes' },
          { id: 'sf_5', text: 'Delegate day-of responsibilities' },
        ],
      },
      {
        id: 'p4_g3',
        title: 'Set up beauty trials',
        icon: 'cut-outline',
        tasks: [
          { id: 's1_4', text: 'Write your vows' },
          { id: 's1_5', text: 'Create the day-of timeline' },
          { id: 's1_7', text: 'Break in your wedding shoes' },
          { id: 'sf_1', text: 'Final dress and suit fittings' },
          {
            id: 'sf_6',
            text: 'Schedule beauty prep (skincare, hair treatments)',
            cta: { label: 'Find beauty pros', route: '/(tabs)/categories', params: { category: 'Beauty & Makeup' } },
          },
        ],
      },
      {
        id: 'p4_g4',
        title: 'Final countdown',
        icon: 'gift-outline',
        tasks: [
          {
            id: 'sf_2',
            text: 'Confirm all vendors with exact timings',
            cta: { label: 'View messages', route: '/(tabs)/messages' },
          },
          { id: 'sf_4', text: 'Pack for the honeymoon' },
          { id: 'sf_7', text: "Relax and enjoy - you've got this!" },
        ],
      },
    ],
  },
];

export const CHECKLIST_TOTAL_TASKS = CHECKLIST_PHASES.reduce(
  (sum, phase) => sum + phase.goals.reduce((goalSum, goal) => goalSum + goal.tasks.length, 0),
  0
);

export const CHECKLIST_TOTAL_GOALS = CHECKLIST_PHASES.reduce((sum, phase) => sum + phase.goals.length, 0);

export function isWidgetTaskComplete(widget: ChecklistWidget, profile: any): boolean {
  switch (widget) {
    case 'date':
      return !!(profile?.wedding_date || profile?.date_undecided);
    case 'budget':
      return !!profile?.budget_range;
    case 'guest_count':
      return profile?.guest_count != null;
    case 'location':
      return !!profile?.city;
    case 'categories':
      return (profile?.preferred_categories?.length ?? 0) > 0;
    default:
      return false;
  }
}
