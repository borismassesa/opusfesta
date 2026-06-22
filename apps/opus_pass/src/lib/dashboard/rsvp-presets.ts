import type { RsvpQuestionInput } from './actions'

/** A ready-made question a couple can add with one click (Knot "popular questions"). */
export interface RsvpQuestionPreset {
  key: string
  label: string
  input: Omit<RsvpQuestionInput, 'event_id' | 'sort_order'>
}

/** Popular follow-up questions, asked per-event to guests who RSVP. */
export const EVENT_QUESTION_PRESETS: RsvpQuestionPreset[] = [
  {
    key: 'meal_preference',
    label: "What's your meal preference?",
    input: {
      prompt: "What's your meal preference?",
      kind: 'multiple_choice',
      required: true,
      attending_only: true,
      options: [
        { label: 'Chicken' },
        { label: 'Beef' },
        { label: 'Fish' },
        { label: 'Vegetarian' },
      ],
    },
  },
  {
    key: 'dietary_restrictions',
    label: 'Do you have any dietary restrictions?',
    input: {
      prompt: 'Do you have any dietary restrictions?',
      kind: 'short_answer',
      required: false,
      attending_only: true,
    },
  },
  {
    key: 'transportation',
    label: 'Will you need transportation to the event?',
    input: {
      prompt: 'Will you need transportation to the event?',
      kind: 'multiple_choice',
      required: true,
      attending_only: true,
      options: [{ label: 'Yes' }, { label: 'No' }],
    },
  },
  {
    key: 'song_requests',
    label: 'Do you have any song requests?',
    input: {
      prompt: 'Do you have any song requests?',
      kind: 'short_answer',
      required: false,
      attending_only: true,
    },
  },
]

/** Popular general questions, asked to everyone who RSVPs (attending or not). */
export const GENERAL_QUESTION_PRESETS: RsvpQuestionPreset[] = [
  {
    key: 'note_to_couple',
    label: 'Send a note to the couple?',
    input: {
      prompt: 'Send a note to the couple?',
      kind: 'short_answer',
      required: false,
      attending_only: false,
    },
  },
  {
    key: 'arrival_time',
    label: 'When will you and your party arrive?',
    input: {
      prompt: 'When will you and your party arrive?',
      kind: 'short_answer',
      required: false,
      attending_only: false,
    },
  },
  {
    key: 'children_under_10',
    label: 'Will you be bringing any children under the age of 10?',
    input: {
      prompt: 'Will you be bringing any children under the age of 10?',
      kind: 'multiple_choice',
      required: true,
      attending_only: false,
      options: [{ label: 'Yes' }, { label: 'No' }],
    },
  },
]
