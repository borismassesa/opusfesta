import { randomBytes } from 'crypto'

// Temporary-password generator for the admin "create login now" path. Kept
// in its own module (no 'server-only') so it's unit-testable and free of the
// invitation orchestration's server deps.
//
// 14 chars from unambiguous classes (no O/0/I/l/1) with a GUARANTEED
// uppercase, lowercase, digit, and symbol, then shuffled. This clears even
// the strictest Clerk password policy (length + all-class complexity) and,
// being random, won't trip the breach (HaveIBeenPwned) check — while staying
// readable to hand over.
const TEMP_PW = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnpqrstuvwxyz',
  digits: '23456789',
  symbols: '!@#$%*?',
} as const

export const TEMP_PASSWORD_LENGTH = 14

export function generateTempPassword(): string {
  const draw = (set: string, n: number) =>
    Array.from({ length: n }, () => set[randomBytes(1)[0] % set.length])
  const all = TEMP_PW.upper + TEMP_PW.lower + TEMP_PW.digits + TEMP_PW.symbols
  const chars = [
    ...draw(TEMP_PW.upper, 2),
    ...draw(TEMP_PW.lower, 2),
    ...draw(TEMP_PW.digits, 2),
    ...draw(TEMP_PW.symbols, 1),
    ...draw(all, TEMP_PASSWORD_LENGTH - 7),
  ]
  // Fisher–Yates shuffle so the guaranteed-class chars aren't in fixed slots.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
