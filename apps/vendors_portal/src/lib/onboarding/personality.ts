export type PersonalityOption = {
  id: string
  label: string
  body: string
}

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  { id: 'decisive', label: 'Decisive', body: 'When you speak, everyone listens.' },
  { id: 'easygoing', label: 'Easygoing', body: 'You roll with the punches.' },
  { id: 'serene', label: 'Serene', body: 'You’re the ultimate source of calm.' },
  { id: 'lively', label: 'Lively', body: 'You can put a smile on anyone’s face.' },
  { id: 'meticulous', label: 'Meticulous', body: 'No detail escapes your eye.' },
  { id: 'warm', label: 'Warm', body: 'Couples feel like family from the first meeting.' },
]
