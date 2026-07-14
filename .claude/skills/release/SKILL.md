---
name: release
description: "Use when the user says '/release', 'bump the version', 'cut a release', or 'what version should this be' for a mobile app. Catches up a mobile app's app.json expo.version to reflect every commit shipped since the last version bump, then commits the bump on its own. Covers apps/of_mobile (OpusFesta) and apps/opus_pass_mobile (OpusPass)."
---

# Mobile Release Version Bump

This is the catch-up tool: it looks at the whole range of commits since the version field last
changed, not just one commit. For bumping as part of a single commit you're already making, use
the `git-commit` skill's inline version-bump step instead — this skill is for when the version
has drifted behind several unbumped commits (the common case, since bumping is easy to forget).

## Step 0 — Pick the app

This repo has more than one mobile app, each with its own independent `expo.version`. Confirm
which one before touching anything; don't infer it from the working directory alone.

| App | Path | `app.json` |
|-----|------|-----------|
| OpusFesta | `apps/of_mobile` | `apps/of_mobile/app.json` |
| OpusPass | `apps/opus_pass_mobile` | `apps/opus_pass_mobile/app.json` |

Everything below uses `<app>` for the chosen directory. Never bump both in one commit — their
versions are unrelated.

## Step 1 — Find the baseline

Find the last commit that actually changed the version field:

```bash
git log -S'"version"' --oneline -- apps/<app>/app.json
```

Take the most recent hit as the baseline commit. If there is no hit, fall back to the commit
that introduced the file:

```bash
git log --diff-filter=A --oneline -- apps/<app>/app.json | tail -1
```

## Step 2 — Classify every commit since the baseline

```bash
git log --oneline <baseline-commit>..HEAD -- apps/<app>
```

Apply the same rules as `git-commit`'s version bump step:

| Signal | Level |
|---|---|
| Breaking change, removed user-facing feature, auth model change (look for `BREAKING` in body, or judgment call from the diff) | major |
| `feat:` — new user-facing feature, screen, or additive integration | minor |
| `fix:` — user-facing bug fix | patch |
| `chore:` / `refactor:` / `docs:` / `test:` / `move:` / `polish:`-only, with no visible behavior change | ignore |

Take the **highest** level triggered by any commit in the range — do not add levels together,
and do not bump once per commit. Ignore commits outside `apps/<app>`.

If nothing in range is a user-facing `feat`/`fix`, report "no bump needed" and stop.

## Step 3 — State the decision before writing anything

```
Version bump decision: <major|minor|patch> — <reason>
Commits driving it: <short list>
<old-version> → <new-version>
```

This is a visible, shared version number — confirm with the user before committing if the range
is large or the call is ambiguous (e.g. many commits, first-ever bump, or unclear whether
something already shipped).

## Step 4 — Apply the bump

```bash
# From repo root
node -e "const fs=require('fs');const p='apps/<app>/app.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.expo.version='NEW_VERSION';fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');"
```

## Step 5 — Commit the bump on its own

Stage only `apps/<app>/app.json`. Never `git add -A`. No attribution footer (`Co-Authored-By`,
"Generated with Claude Code") — this project never adds one.

Use a scope that names the app, so the two apps' bumps are distinguishable in the log:

```bash
git commit -m "$(cat <<'EOF'
chore(of_mobile): bump version to NEW_VERSION
EOF
)"
```

## Step 6 — Suggest the follow-up

After the bump lands, offer to run `app-store-changelog` for the same commit range to draft App
Store notes, TestFlight checklist, and the admin release brief.

## Notes

- Each app's `eas.json` has `appVersionSource: "remote"` and `autoIncrement: true` for the
  **build number** — EAS manages that separately. This skill only touches the semver
  `expo.version` field, which EAS does not auto-manage.
- The TestFlight **build number** is a different thing again, bumped by `testflight-local`.
- **Do not tag here.** Every release *is* tagged in this repo, but the tag is created by
  `testflight-local` after a successful TestFlight upload — that's the moment something actually
  ships, and the tag carries the build number (`opuspass-v0.1.0-build2`) as well as the version.
  A version bump on its own has shipped nothing yet, so it gets no tag. Bumping `expo.version`
  here and tagging at upload are two halves of one release: bump, then build, then tag.
