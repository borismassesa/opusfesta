export type PersonalityOption = {
  id: string
  label: string
  label_sw: string
  body: string
  body_sw: string
}

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  { id: 'decisive', label: 'Decisive', label_sw: 'Mwenye uamuzi', body: 'When you speak, everyone listens.', body_sw: 'Unaposema, kila mtu husikiliza.' },
  { id: 'easygoing', label: 'Easygoing', label_sw: 'Mtulivu', body: 'You roll with the punches.', body_sw: 'Unakubaliana na hali yoyote.' },
  { id: 'serene', label: 'Serene', label_sw: 'Mpole', body: 'You’re the ultimate source of calm.', body_sw: 'Wewe ni chanzo kikuu cha utulivu.' },
  { id: 'lively', label: 'Lively', label_sw: 'Mchangamfu', body: 'You can put a smile on anyone’s face.', body_sw: 'Unaweza kumfanya yeyote atabasamu.' },
  { id: 'meticulous', label: 'Meticulous', label_sw: 'Makini', body: 'No detail escapes your eye.', body_sw: 'Hakuna jambo dogo linalokwepa jicho lako.' },
  { id: 'warm', label: 'Warm', label_sw: 'Mkarimu', body: 'Couples feel like family from the first meeting.', body_sw: 'Wanandoa huhisi kama familia tangu mkutano wa kwanza.' },
]
