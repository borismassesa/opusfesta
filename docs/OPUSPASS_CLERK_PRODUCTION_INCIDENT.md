# OpusPass — Sign-in does not render in production (Clerk never fires)

**Date:** 2026-06-16
**App:** `apps/opus_pass` only
**Status:** ✅ Resolved 2026-06-16 — production Clerk keys updated in the opus_pass Vercel
environment; sign-in now renders on `opuspass.opusfesta.com`.
**Symptom:** On the deployed site (`opuspass.opusfesta.com`) the `/sign-in` page renders
the surrounding shell but the Clerk `<SignIn>` widget never mounts — "Clerk does not
fire." Works perfectly on `localhost`.

## Resolution

Fixed by updating the Clerk keys in the **opus_pass Vercel Production environment** to the
correct OpusFesta instance's production keys and redeploying. Sign-in now renders in
production.

**Still open (follow-ups, not blocking):**
- Local `apps/opus_pass/.env` may still carry the Vendor instance's `pk_test_`/`sk_test_`
  keys — update it to the OpusFesta instance's dev keys so local sign-in hits the same
  user pool as production / the website.
- The comment in `sign-in/[[...sign-in]]/page.tsx` is still inaccurate (stale basePath
  claim + "shares with vendors_portal"); correct it — see the end of this doc.

## Root cause

Two compounding faults:

1. **OpusPass points at the wrong Clerk instance.** The intended topology is:
   OpusFesta (`opus_website`) **and** OpusPass (`opus_pass`) **share one instance**;
   Vendor, Admin, and Studio each have **their own**. But OpusPass's key points at the
   **Vendor** instance, not the shared OpusFesta one.
2. **It's a `pk_test_` (development) key**, which cannot mount on a custom production domain.

Decoding the publishable keys in each app's `.env`:

| App              | Key prefix | Clerk instance (frontend API)        | Intended group        | OK? |
| ---------------- | ---------- | ------------------------------------ | --------------------- | --- |
| `opus_website`   | `pk_test_` | `tidy-coyote-86.clerk.accounts.dev`  | OpusFesta (shared)    | ✅  |
| `opus_pass`      | `pk_test_` | `logical-chow-41.clerk.accounts.dev` | OpusFesta (shared)    | ❌ on Vendor's instance |
| `vendors_portal` | `pk_test_` | `logical-chow-41.clerk.accounts.dev` | Vendor (own)          | ✅  |
| `opus_admin`     | `pk_test_` | `enabled-moray-70.clerk.accounts.dev`| Admin (own)           | ✅  |
| `studio`         | —          | (no key in local `.env`)             | Studio (own)          | —   |

So OpusPass should be on `tidy-coyote-86` (the OpusFesta instance, to share profiles with
the marketing site) but is instead wired to `logical-chow-41` (the Vendor instance).

A Clerk **development instance only initializes on `localhost` and `*.accounts.dev`**.
It refuses to load `clerk.js` / establish a session on an arbitrary custom domain.
So on the custom production domain `opuspass.opusfesta.com` the provider never boots and
`<SignIn>` renders nothing — while `localhost` keeps working (the dev key happily mounts on
localhost, just against the wrong user pool). This matches the observed "works local, dead
in prod, opus_pass only" behaviour.

### Why this is *not* a regression in the recent commits

The "auth broke in the last few commits" premise does not hold for the source code.
The recent OpusPass commits touched:

- `src/lib/dashboard/auth.ts` — the **server-side** `public.users` resolver
  (`458be35`, `3413521`, `f8924b9`). These fixed FK-rewrite (`23503`) and
  email-adoption hijack bugs; they do not affect whether Clerk mounts on the client.
- storefront / CMS / vendor UI — unrelated to auth bootstrap.

None of the Clerk *bootstrap* files changed recently:

- `src/app/layout.tsx` (`<ClerkProvider>`) — last change `923b11d` was a favicon tweak.
- `src/middleware.ts` (`clerkMiddleware`) — unchanged.
- `src/app/sign-in/[[...sign-in]]/page.tsx` — unchanged.
- `next.config.ts` — no basePath, no header/CSP config.

The likely *trigger* was the move to a standalone subdomain (`b0e6a7c`,
"serve opus_pass at subdomain root, drop /opuspass basePath"): once OpusPass is served
from a real custom domain instead of localhost, a `pk_test_` key can no longer
initialize Clerk there.

## Fix

OpusPass must use the **OpusFesta** Clerk instance (the one `opus_website` uses,
`tidy-coyote-86`'s production counterpart) — **not** the Vendor instance it is on today,
and **not** a `pk_test_` key.

1. Point OpusPass at the **same Clerk instance as `opus_website`** so they share profiles.
   Use that instance's **production** keys (`pk_live_…` / `sk_live_…`) and register
   `opuspass.opusfesta.com` as an allowed domain on it.
2. In the **opus_pass Vercel Production environment**, set (matching `opus_website`'s
   production values):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`  (OpusFesta instance)
   - `CLERK_SECRET_KEY=sk_live_…`  (OpusFesta instance)
   `NEXT_PUBLIC_*` is inlined at **build** time, so trigger a fresh deploy after changing
   them; redeploying a cached build will not pick them up.
3. Update the **local `apps/opus_pass/.env`** too — it currently holds the Vendor
   instance's `pk_test_`/`sk_test_` keys. Swap them for the OpusFesta instance's dev keys
   so local sign-in hits the same user pool as the website.
4. Verify DNS / domain is registered in the OpusFesta production instance dashboard so the
   production frontend-API CNAME for `opuspass.opusfesta.com` resolves.

### Also worth aligning (not the root cause)

OpusPass is missing the public Clerk URL env vars the sibling apps set
(`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`,
`NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`,
`NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`). OpusPass instead hardcodes
`signUpUrl` / `fallbackRedirectUrl` on the `<SignIn>` component, so this is not the bug,
but adding them keeps the apps consistent.

The comment in `sign-in/[[...sign-in]]/page.tsx` is inaccurate on two counts and should be
corrected once the instance is fixed:
- It claims `routing="hash"` is "required under basePath '/opuspass'" — the basePath was
  dropped in `b0e6a7c`, so that justification no longer applies (hash routing is harmless).
- It claims OpusPass shares an instance with "opus_website + vendors_portal". Intended
  topology is OpusPass shares **only** with opus_website (OpusFesta); Vendor/Admin/Studio
  are each separate.

## How to verify quickly

Decode any publishable key to see which instance it points at:

```bash
# everything after pk_test_/pk_live_ is base64(frontendApi + '$')
echo "<the-key>" | cut -d_ -f3 | base64 -d
```

`pk_test_` + a custom production domain = this bug.
