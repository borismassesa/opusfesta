/**
 * Extracts a human-readable message from an unknown thrown value.
 *
 * Handles the two shapes the app actually throws:
 *  - Clerk errors, which carry `errors: [{ message }]`
 *  - standard `Error` (and anything else with a string `message`)
 *
 * Lets call sites use `catch (err)` (typed `unknown` under strict mode)
 * instead of `catch (err: any)`.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'string') return err;

  if (err && typeof err === 'object') {
    const clerkErrors = (err as { errors?: unknown }).errors;
    if (Array.isArray(clerkErrors)) {
      const first = clerkErrors[0] as { message?: unknown } | undefined;
      if (first && typeof first.message === 'string') return first.message;
    }

    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }

  return fallback;
}
