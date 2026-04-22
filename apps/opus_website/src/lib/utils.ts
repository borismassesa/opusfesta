// Minimal classname merger for the UI primitives under components/ui.
// Kept dependency-free (no clsx/tailwind-merge) because the few call
// sites only ever pass simple strings and undefined/null falsy values.
export type ClassValue = string | number | false | null | undefined

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter((v): v is string | number => Boolean(v)).join(' ')
}
