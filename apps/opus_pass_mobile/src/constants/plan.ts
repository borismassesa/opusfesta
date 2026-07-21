import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** A promoted action on a goal's detail page — the peach cards in the
 *  reference ("Track RSVPs →", "Start your guest list →"). */
export interface GoalCta {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconName;
  route: Href;
}

export interface PlanGoal {
  id: string;
  title: string;
  icon: IoniconName;
  /** The "Things to do" checklist on the goal's detail page. */
  tasks: string[];
  /** Some goals list more work than fits, mirroring the reference's "4+ tasks". */
  moreTasks?: boolean;
  ctas?: GoalCta[];
}

export interface PlanStage {
  id: number;
  label: string;
  goals: PlanGoal[];
}

/**
 * The wedding-planning checklist: four time-based stages, each with goals that
 * open a detail page (app/goal/[id].tsx). Static content for now — there's no
 * per-couple checklist table yet, so completion is stored on-device (see
 * usePlanProgress). Shared by the Home "Your plan" section and the goal detail
 * screen so the two can never drift.
 *
 * CTA routes point only at screens that actually exist in this app; goals whose
 * natural destination isn't built yet simply have no CTA rather than a link to
 * a dead end.
 */
export const PLAN_STAGES: PlanStage[] = [
  {
    id: 1,
    label: '12+ months',
    goals: [
      {
        id: 'venues',
        title: 'Find and save venues',
        icon: 'storefront',
        tasks: [
          'Estimate your venue budget',
          'Browse venues and save favourites',
          'Contact venues and schedule visits',
          'Compare and decide',
        ],
        ctas: [
          {
            id: 'explore-venues',
            title: 'Explore venues',
            subtitle: 'Browse vendors and save the ones you love.',
            icon: 'storefront',
            route: '/vendors',
          },
        ],
      },
      {
        id: 'vibe',
        title: 'Figure out your vibe',
        icon: 'color-palette',
        tasks: ['Collect inspiration you keep coming back to', 'Settle on your colours and style'],
      },
      {
        id: 'guest-list',
        title: 'Start your guest list',
        icon: 'people',
        tasks: [
          'Add guests to your guest list',
          'Estimate your guest count',
          'Collect guest contacts',
          'Choose your wedding party',
        ],
        ctas: [
          {
            id: 'start-guest-list',
            title: 'Start your guest list',
            subtitle: 'Keep guest details organised for every event.',
            icon: 'people',
            route: '/guests',
          },
        ],
      },
      {
        id: 'budget',
        title: 'Start your budget',
        icon: 'cash',
        tasks: ['Set a total you are comfortable with', 'Split it across vendors', 'Track deposits as you book'],
      },
      {
        id: 'photographers',
        title: 'Connect with photographers',
        icon: 'camera',
        tasks: [
          'Browse photographers and save favourites',
          'Ask about their packages',
          'Check their full galleries',
          'Compare and decide',
        ],
        moreTasks: true,
        ctas: [
          {
            id: 'explore-photographers',
            title: 'Explore photographers',
            subtitle: 'Find and message vendors near you.',
            icon: 'camera',
            route: '/vendors',
          },
        ],
      },
      {
        id: 'invitations',
        title: 'Browse invitations',
        icon: 'mail',
        tasks: ['Browse invitation designs', 'Save the ones you love', 'Pick your package'],
        ctas: [
          {
            id: 'browse-cards',
            title: 'Browse invitations',
            subtitle: 'Digital cards your guests open on WhatsApp.',
            icon: 'mail',
            route: '/cards',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: '5-10 months',
    goals: [
      {
        id: 'book-venue',
        title: 'Book your venue',
        icon: 'storefront',
        tasks: ['Confirm your date', 'Read the contract carefully', 'Pay your deposit'],
      },
      {
        id: 'catering',
        title: 'Contact caterers',
        icon: 'restaurant',
        tasks: ['Shortlist caterers', 'Arrange a tasting', 'Agree the menu and price'],
      },
      {
        id: 'website',
        title: 'Start your website',
        icon: 'globe',
        tasks: ['Share your invite link', 'Add your event details'],
        ctas: [
          {
            id: 'open-website',
            title: 'Share your invite',
            subtitle: 'Get your link and QR code for guests.',
            icon: 'globe',
            route: '/website',
          },
        ],
      },
      {
        id: 'registry',
        title: 'Start your registry',
        icon: 'gift',
        tasks: ['Choose what to ask for', 'Add your payment details', 'Share it with guests'],
        ctas: [
          {
            id: 'open-registry',
            title: 'Start your registry',
            subtitle: 'Let guests contribute towards your day.',
            icon: 'gift',
            route: '/registry',
          },
        ],
      },
      {
        id: 'order-invitations',
        title: 'Order invitations',
        icon: 'mail',
        tasks: ['Pick your design and package', 'Personalise your wording', 'Place your order'],
        ctas: [
          {
            id: 'order-cards',
            title: 'Order invitations',
            subtitle: 'Pick a design and personalise it.',
            icon: 'mail',
            route: '/cards',
          },
        ],
      },
      {
        id: 'entertainment',
        title: 'Book entertainment',
        icon: 'musical-notes',
        tasks: ['Shortlist DJs and bands', 'Check they are free on your date'],
      },
    ],
  },
  {
    id: 3,
    label: '3-7 months',
    goals: [
      {
        id: 'attire',
        title: 'Find attire and rings',
        icon: 'shirt',
        tasks: ['Shop for your outfits', 'Book your fittings', 'Order the rings'],
        moreTasks: true,
      },
      {
        id: 'invite-guests',
        title: 'Invite guests',
        icon: 'people',
        tasks: [
          'Finalise your guest list',
          'Send your invitations',
          'Turn on RSVPs',
          'Follow up with anyone who has not replied',
        ],
        ctas: [
          {
            id: 'open-guests',
            title: 'Invite guests',
            subtitle: 'Send invites and track who replied.',
            icon: 'people',
            route: '/guests',
          },
        ],
      },
      {
        id: 'menu',
        title: 'Finalise your menu',
        icon: 'restaurant',
        tasks: ['Confirm the menu', 'Agree the drinks', 'Note any dietary needs'],
      },
      {
        id: 'ceremony',
        title: 'Plan ceremony details',
        icon: 'book',
        tasks: ['Confirm your officiant', 'Plan the order of service', 'Choose your readings'],
      },
      {
        id: 'transport',
        title: 'Book transportation',
        icon: 'car',
        tasks: ['Arrange cars for the day', 'Plan guest transport if needed'],
      },
    ],
  },
  {
    id: 4,
    label: '0-2 months',
    goals: [
      {
        id: 'collect-rsvps',
        title: 'Collect RSVPs',
        icon: 'mail-open',
        tasks: ['Chase anyone still pending', 'Confirm your final headcount'],
        ctas: [
          {
            id: 'track-rsvps',
            title: 'Track RSVPs',
            subtitle: 'See which guests replied and remind the rest.',
            icon: 'mail-open',
            route: '/guests',
          },
        ],
      },
      {
        id: 'day-of',
        title: 'Finalise day-of details',
        icon: 'clipboard',
        tasks: [
          'Plan your ceremony',
          'Create a seating chart',
          'Share the timeline with your vendors',
          'Confirm final payments',
        ],
        ctas: [
          {
            id: 'message-guests',
            title: 'Send day-of details',
            subtitle: 'Share timing and directions with guests.',
            icon: 'chatbubbles',
            route: '/guests',
          },
        ],
      },
      {
        id: 'get-married',
        title: 'Get married!',
        icon: 'heart',
        tasks: ['Rehearse your ceremony', 'Hand off the rings and paperwork', 'Bring small decor to your venue'],
      },
    ],
  },
];

export const ALL_GOALS: PlanGoal[] = PLAN_STAGES.flatMap((stage) => stage.goals);

export const TOTAL_GOALS = ALL_GOALS.length;

/** Finds a goal plus the stage it belongs to, for the detail screen's eyebrow. */
export function findGoal(goalId: string): { goal: PlanGoal; stage: PlanStage } | null {
  for (const stage of PLAN_STAGES) {
    const goal = stage.goals.find((g) => g.id === goalId);
    if (goal) return { goal, stage };
  }
  return null;
}

export function taskCountLabel(goal: PlanGoal): string {
  return `${goal.tasks.length}${goal.moreTasks ? '+' : ''} task${goal.tasks.length === 1 ? '' : 's'}`;
}
