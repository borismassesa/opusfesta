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
- **`apps/opus_website/.env` points at the wrong Clerk instance (Vendors, not OpusFesta)
  — fix was applied locally on 2026-07-01 but LOST to sparse-checkout; must be redone.**
  See the 2026-07-01 addendum below.

## 2026-07-01 addendum — instance mapping corrected; opus_website fix must be redone

While debugging why mobile sign-ups weren't populating `public.users`, the actual Clerk
app→instance mapping was verified live via `clerk apps list` (and confirmed by the repo
owner). **The instance table further down in this doc was backwards** and has been
corrected. The correct dev-instance mapping is:

| Clerk app          | Dev frontend API (`pk_test_`)        |
| ------------------ | ------------------------------------ |
| **OpusFesta** (shared by opus_website + opus_pass + mobile) | `logical-chow-41.clerk.accounts.dev` |
| **OpusFesta Vendors** (vendors_portal)                      | `tidy-coyote-86.clerk.accounts.dev`  |
| **OpusFesta Admin** (opus_admin)                            | `enabled-moray-70.clerk.accounts.dev`|
| **OpusStudio** (studio)                                     | `concise-lamb-47.clerk.accounts.dev` |

Consequences of the corrected mapping:
- `apps/mobile/.env` and `apps/opus_pass/.env` were already correct (`logical-chow-41` =
  OpusFesta). Mobile was never the cause of the sync problem.
- **`apps/opus_website/.env` was wrong**: it carried `tidy-coyote-86` (the *Vendors*
  instance) instead of `logical-chow-41` (OpusFesta). On 2026-07-01 it was corrected
  locally to OpusFesta's dev keys, but `apps/opus_website/.env` is gitignored and the app
  was subsequently excluded from the working tree by a sparse-checkout setup, so **the fix
  is gone and must be reapplied** whenever opus_website is next checked out and run
  locally. Correct dev values (OpusFesta instance):
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9naWNhbC1jaG93LTQxLmNsZXJrLmFjY291bnRzLmRldiQ`
  - `CLERK_SECRET_KEY` = OpusFesta dev secret (pull with `clerk env pull` while linked to
    the OpusFesta app, or copy from `apps/opus_pass/.env`).

The actual mobile-sync fix landed elsewhere and is committed: `complete-onboarding` now
self-provisions the `public.users` row from the Clerk Backend API when the webhook hasn't
run (mirroring `apps/opus_pass/src/lib/dashboard/auth.ts`), so mobile onboarding no longer
depends on a webhook. That path needs `CLERK_SECRET_KEY` set as a **Supabase Edge Function
secret** on project `ppdapuqehwlfwofbpbvb` (separate from any app `.env`) — set it to the
key matching whichever instance mobile ships against (mobile now uses OpusFesta **live**
keys in both dev and prod builds, so use the `sk_live_` OpusFesta secret).

## Root cause

Two compounding faults:

1. **OpusPass points at the wrong Clerk instance.** The intended topology is:
   OpusFesta (`opus_website`) **and** OpusPass (`opus_pass`) **share one instance**;
   Vendor, Admin, and Studio each have **their own**. But OpusPass's key points at the
   **Vendor** instance, not the shared OpusFesta one.
2. **It's a `pk_test_` (development) key**, which cannot mount on a custom production domain.

Decoding the publishable keys in each app's `.env`:

> **Corrected 2026-07-01** — the mapping below was originally backwards (it had the
> OpusFesta and Vendors instances swapped). Verified live via `clerk apps list`:
> `logical-chow-41` = **OpusFesta** (shared), `tidy-coyote-86` = **Vendors**. The table
> and the sentence that followed it have been rewritten to the verified mapping.

| App              | Key prefix | Clerk instance (frontend API)        | Intended group        | OK? |
| ---------------- | ---------- | ------------------------------------ | --------------------- | --- |
| `opus_website`   | `pk_test_` | `tidy-coyote-86.clerk.accounts.dev`  | OpusFesta (shared)    | ❌ on Vendor's instance |
| `opus_pass`      | `pk_test_` | `logical-chow-41.clerk.accounts.dev` | OpusFesta (shared)    | ✅  |
| `mobile`         | `pk_test_`¹| `logical-chow-41.clerk.accounts.dev` | OpusFesta (shared)    | ✅  |
| `vendors_portal` | `pk_test_` | `tidy-coyote-86.clerk.accounts.dev`  | Vendor (own)          | ✅  |
| `opus_admin`     | `pk_test_` | `enabled-moray-70.clerk.accounts.dev`| Admin (own)           | ✅  |
| `studio`         | —          | `concise-lamb-47.clerk.accounts.dev` | Studio (own)          | —   |

¹ `mobile` was later switched to OpusFesta **live** (`pk_live_`) keys in both dev and prod
builds — see the 2026-07-01 addendum near the top.

So `opus_website` should be on `logical-chow-41` (the OpusFesta instance, to share profiles
with opus_pass and mobile) but is instead wired to `tidy-coyote-86` (the Vendor instance) —
the mirror image of the OpusPass symptom that opened this doc.

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
