# OF-ENG-PASS-PLEDGES-001: Pledges report data integrity + real gaps

**App:** `apps/opus_pass` · **Area:** `/my/dashboard/pledges` → Reports tab
**Primary files:** `src/app/my/dashboard/pledges/PledgesManager.tsx` (UI + report math), `src/lib/dashboard/queries.ts` (`getPledges`, `pledgeStatsFrom`), `src/lib/dashboard/actions.ts` (`derivePledgeStatus`), `supabase/migrations/20260528000003_event_pledges.sql` (schema)
**Status:** Draft — bugs verified against current code, fixes not yet implemented.

## Summary

A review of the Pledges report surfaced numbers that disagree with each other on the same screen (Outstanding: 100,000 vs 600,000), a status label that doesn't reflect money actually received, inconsistent rounding, and a duplicated card. Root cause in every case: the report mixes a **net, couple-wide** aggregate (`pledgeStatsFrom`) with a **per-pledge, floored-at-zero** aggregate (everywhere else — table rows, aging, CSV export, top contributors), and one overpaid pledge is enough to make the two disagree. Below is what's actually happening in the code, then what to fix, in the order it should be fixed.

## 1. Correctness bugs (ship-blockers)

### 1.1 Outstanding disagrees with itself

- **Where:** `pledgeStatsFrom()`, `queries.ts:545-572`, vs. per-pledge outstanding used in the table/aging/CSV (`PledgesManager.tsx:168, 645, 986, 1147`).
- **What's happening:** `pledgeStatsFrom` computes `outstanding = max(0, totalPledged - totalReceived)` — a **single net number across every pledge**. Every other surface on the page computes outstanding **per pledge**, `max(0, pledged - received)`, then sums. When one pledge is overpaid (received > pledged), the per-pledge version floors that pledge's contribution at 0, but the net version lets the surplus silently cancel out other pledges' shortfalls. One overpaid pledge is enough to make the two numbers diverge exactly by the overpayment amount.
- **A second, sharper bug in the same function:** `totalReceived` sums `amount_received` for **every** pledge regardless of status (`queries.ts:545-572` — no status filter on the received side), while `totalPledged` excludes `declined` pledges. A declined pledge that still has a nonzero `amount_received` (e.g. partial payment recorded before it was marked declined) inflates `totalReceived` without a matching `totalPledged`, which *lowers* the reported Outstanding tile further. This is a second, independent source of drift from the per-pledge sum, on top of the overpayment issue.
- **Fix:** `pledgeStatsFrom` must compute outstanding the same way as the rest of the page: sum of `max(0, pledged - received)` per non-declined pledge. Overpayment should never be allowed to net against a different pledge's shortfall.
- **Open product decision (blocks the fix):** what does the system do with an overpayment? Options: (a) treat it as an error to flag and let the couple correct, (b) treat it as a gift/bonus on top of the pledge (received > pledged is fine, just never subtracts elsewhere), or (c) auto-raise the pledge amount to match. This brief assumes (b) — overpayment is a valid state, surfaced as its own signal, never netted against other pledges — but that needs sign-off before implementing, since it also affects collection rate (below) and any future payment-ledger design.

### 1.2 Collection rate is inflated by the same bug, and conflates two different metrics

- **Where:** `PledgesManager.tsx:2750-2751` (Reports tab) and `PledgesManager.tsx:557-558` (`printStatement()`) — same formula, duplicated in two places, no shared helper.
- **What's happening:** `collectionRate = totalReceived / totalPledged`. Since `totalReceived` isn't capped per pledge, an overpayment inflates the numerator for the whole page, not just its own row — this is the same root cause as 1.1, just expressed as a percentage instead of a currency figure.
- **A second issue, separate from the overpayment bug:** the "Collection rate" tile (`PledgesManager.tsx:2913-2927`) shows an amount-based rate (`totalReceived / totalPledged`) as its headline value, and a *count*-based rate (`fulfillmentRate = paidCount / totalPledges`, `2826`) as its hint text underneath. These are two different metrics ("% of money collected" vs "% of pledges fully paid") stacked in one tile with no label distinguishing them — easy to misread as the same number restated.
- **Fix:** extract one shared `collectionRate(pledges)` helper in `queries.ts`, built from the corrected per-pledge outstanding logic (1.1), used by both the Reports tab and `printStatement()`. Label the two rates separately if both are worth keeping (e.g. "Collection rate" + explicitly labeled "Pledges fully paid" instead of an unlabeled hint).

### 1.3 Group collection rate can show >100%, which is a nonsense figure to show a user

- **Where:** `groupChart` (`PledgesManager.tsx:2807-2812`), rendered in the "Collection rate by group" bar chart (`2948-2952`).
- **What's happening:** same overpayment-not-floored issue as 1.1/1.2, but per group instead of per couple — an overpaid pledge in a small group can push that group's bar past 100%.
- **Fix:** cap the bar/percentage at 100%; if there's genuine overpayment in that group, surface it as a separate line ("TSh X over pledge") rather than letting the bar run past full.

### 1.4 Status label doesn't reflect money received, until the pledge is re-saved

- **Where:** `event_pledges.status` is a **stored column** (migration `20260528000003_event_pledges.sql:28`), derived at write time by `derivePledgeStatus()` (`actions.ts:626-635`): `received <= 0 → pledged|invited`, `received >= pledged → paid`, else `partial`.
- **What's happening:** this derivation is correct *as a function*, but it only runs when a pledge row is written (`createPledge`/`updatePledge` via `pledgeColumnsFromInput`, `actions.ts:646`). If `status` is ever set explicitly and `amount_received` changes through a path that doesn't go through this derivation (or a payment is recorded without triggering it), the stored `status` goes stale relative to the actual `amount_received`/`pledged_amount` pair. The report then trusts the stored column for the "By status" breakdown (`byStatus`, `PledgesManager.tsx:2755-2763`) instead of recomputing from the numbers on hand.
- **Fix:** the report (and ideally every read path — table rows, funnel, CSV) should derive status **at read time** from `(pledged_amount, amount_received, declined-flag)` using the same logic as `derivePledgeStatus`, not trust the stored column. Either export `derivePledgeStatus` from a shared location and call it in `getPledges`/`pledgeStatsFrom`, or compute status as a derived field the moment pledges are loaded, so the stored column becomes a cache that's always re-validated, not a source of truth. This is a purer, more contained fix than it looks — the derivation logic already exists and is correct; it just needs to run at read time in addition to write time.

### 1.5 Rounding inconsistency on the goal-progress bar

- **Where:** goal progress card, `PledgesManager.tsx:2879-2911` — pledged-vs-goal and received-vs-goal percentages computed independently (`2829-2840`).
- **What's happening:** two percentages derived from the same goal denominator use different rounding (one effectively floors, the other appears to round up), so `1,150,000 / 10,000,000` and `1,050,000 / 10,000,000` don't both round the way `Math.round` would.
- **Fix:** one shared rounding function (`Math.round`, applied consistently) for every percentage-of-goal figure on this card.

### 1.6 "Received by payment method" renders twice

- **Where:** bar chart at `PledgesManager.tsx:2943-2947`, table at `2973-2979` — both driven by the identical `byMethod` array (`2765-2774`), no difference in underlying data.
- **Fix:** keep the table (it carries payment counts, which the bar chart drops); remove the bar-chart `ChartCard` from the charts grid.

## 2. Real gaps worth building

### 2.1 Aging that actually ages

- **Where:** `outstandingAging()`, `PledgesManager.tsx:157-179` — buckets already exist in code (`30+ days overdue`, `8-30 days overdue`, `1-7 days overdue`, `Not yet due`, `No due date`), and only one function defines them (no conflicting second definition anywhere — confirmed via repo-wide search). If the report only ever shows "Not yet due," the buckets aren't the problem; either due dates aren't being set on pledges, or none of the sample data has passed a due date yet.
- **Fix:** verify due-date entry is actually part of the pledge-creation/edit flow and is being populated; add a "Due this week" bucket ahead of "Overdue" if not already implied by the existing negative-day buckets; render the overdue buckets in the warning color, and confirm this shows real data once due dates exist. This is likely more of a data/input-flow problem than a computation problem, since the bucket logic itself already looks correct.

### 2.2 A "who to chase" table

- **Current:** `top` (Top contributors, `PledgesManager.tsx:2813-2815`) is sorted by pledged amount — a vanity ranking, not an action list.
- **Fix:** add an outstanding-first table: contributor, outstanding amount, days overdue, last reminder sent (`pledge_reminder_log` already has this — see 2.3), one-tap WhatsApp chase button (reuse whatever share-link/message helper the invite-send flow already uses).

### 2.3 Follow-up effectiveness

- **Current:** `totalReminders` (`PledgesManager.tsx:2788`) is a single count with no outcome attached.
- **Data available:** `pledge_reminder_log` (migration `20260528000003_event_pledges.sql:47-53`) logs channel + timestamp per reminder, and `event_pledges` has `reminder_count`/`last_reminded_at`/`next_reminder_at`.
- **Fix:** join reminder timestamps against subsequent payment timestamps to compute "reminders that led to a payment within N days," a response rate, and a channel breakdown (WhatsApp vs SMS). The raw log data to build this already exists; it just isn't being aggregated anywhere yet.

### 2.4 Pace-to-goal

- **Current:** "Pledges over time" (`trendPoints` / `cumulativePledgedByDay`, `PledgesManager.tsx:2792`) plots cumulative pledged with no target line, and the goal card (2879-2911) shows current totals but no projection.
- **Fix:** add a projected-total-at-current-pace calculation and a target trajectory line to the trend chart, using `pledge_goal_amount` (migration `20260528000008`) and the event's date as the deadline.

### 2.5 Payment ledger

- **Current:** confirmed no ledger table exists anywhere in `supabase/migrations` — `event_pledges.amount_received` is a single mutable running total (`savePayment()`, `PledgesManager.tsx:477-509`, does `newReceived = target.amount_received + add` then overwrites). `payment_method` is similarly a single last-write-wins field per pledge, which is also why 1.6's method breakdown can only ever reflect the *most recent* method, not a true breakdown across multiple payments on the same pledge.
- **Fix:** this is the largest item in the brief — a new `pledge_payments` table (pledge_id, amount, method, recorded_at, recorded_by, optional reversal/refund flag), with `event_pledges.amount_received` becoming a derived/cached sum instead of the only record. Needed for: real per-method breakdown, reversal/refund support, and an audit trail for M-Pesa entry mistakes. This should be scoped as its own follow-up brief given the size (new table, migration, backfill from existing single-field data, and every write path that currently does `savePayment()` needs to change).

### 2.6 Group vs. source confusion

- **Verified:** there is **no `source` field on pledges or in the report at all** — "By group" (`PledgesManager.tsx:2776-2786`) buckets purely by `guest_contacts.group_tag`, falling back to a literal `'Ungrouped'` string. The "From Pledge link" segment described as appearing on the report does not exist in the current code — the closest thing in the schema is `guest_contacts.source: 'host' | 'public'` (`types.ts:19,82`), which describes how the *guest* was added generally (not pledge-specific), isn't joined into `getPledges()`'s pledge-with-contact query, and isn't referenced anywhere in `ReportsSection`.
- **Fix:** two separate cuts, not one conflated one: `group` stays `group_tag` (family/friends/church/colleagues — what couples actually filter by), and a genuinely pledge-specific `source` (link vs manual entry vs imported) would need to be captured at pledge-creation time and stored on `event_pledges` itself, since the existing `guest_contacts.source` isn't fine-grained enough (it's about the guest record, not this specific pledge). If "From Pledge link" was seen on an actual screen, it may be worth re-confirming where that render path lives before scoping this — it wasn't found in `PledgesManager.tsx`.

## 3. Polish

- Collapse or grey out empty status rows (`Awaiting pledge` / `Partly paid` / `Declined` all at 0) in `byStatus`'s `ReportTable`.
- No date-range filter or period-over-period comparison on the Reports tab.
- No Kiswahili strings on this page, unlike the rest of the bilingual dashboard.
- Charts (`charts.tsx`) have no accessible table fallback or on-hover values.
- "Confirmed coming" tile (`PledgesManager.tsx:2993-3006` area) reads as orphaned from the rest of the page — tie it explicitly to RSVP status so the number has a stated meaning.

## Recommended phasing

1. **Ship-blockers (1.1-1.6)** — all contained to `pledgeStatsFrom`, the two `collectionRate` call sites, `groupChart`, `byStatus`, the goal-progress rounding, and deleting one duplicate card. No schema changes. Blocked only on the overpayment-policy product decision (1.1).
2. **Aging + chase workflow (2.1, 2.2)** — highest-value gap; mostly UI + a due-date data audit, reuses existing aging logic and existing WhatsApp share helpers.
3. **Everything else (2.3-2.6, polish)** — 2.5 (payment ledger) is materially bigger than the rest and should be its own follow-up brief once scoped.

## Open questions needing a decision before implementation

1. Overpayment: error to correct, gift on top, or auto-raise the pledge? (blocks 1.1-1.3)
2. Collection rate: keep both the amount-based and count-based rates, and if so, label them distinctly, or drop one?
3. Is "From Pledge link" a real, currently-live segment somewhere not found in this pass, or a proposed addition — worth a quick screen-share/screenshot re-check before scoping 2.6 further.
4. Payment ledger (2.5): confirm this should be scoped as its own brief rather than folded into this one, given its size.
